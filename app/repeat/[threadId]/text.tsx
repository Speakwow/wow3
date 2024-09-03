'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { IconRightArrow } from "@/components/ui/icons"
import { evalSpeechFromFile } from "@/lib/speech/eval";
import { synthesizeSpeech } from "@/lib/speech/tts";
import { webm2Wav } from "@/lib/speech/wav";
import { Mic, RefreshCwIcon, Volume1Icon } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Howl } from 'howler';
import { Bravo } from "@/components/bravo";
import { saveRepeatRecord } from "@/lib/action/mongoIO";
import { LessonReport } from "@/components/report";
import { StopIcon } from "@radix-ui/react-icons";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import Image from 'next/image'
import AzureConfig from "@/lib/speech/config";
import _ from "lodash";
import { Score2Grade } from "@/lib/tools"
import { useUnmount } from "usehooks-ts";


function calculateAverages(data: any[]): any {
    const count = data.length;
    if (count === 0) {
        throw new Error("The data array is empty.");
    }

    let totalScore = 0;
    let totalAccuracy = 0;
    let totalFluency = 0;
    let totalCompleteness = 0;
    let totalProsody = 0;

    data.forEach(item => {
        totalScore += item.score;
        totalAccuracy += item.detail_score.accuracy;
        totalFluency += item.detail_score.fluency;
        totalCompleteness += item.detail_score.completeness;
        totalProsody += item.detail_score.prosody;
    });

    const avgScore = totalScore / count;
    const avgAccuracy = totalAccuracy / count;
    const avgFluency = totalFluency / count;
    const avgCompleteness = totalCompleteness / count;
    const avgProsody = totalProsody / count;

    return {
        score: avgScore,
        detailScore: {
            accuracy: avgAccuracy,
            fluency: avgFluency,
            completeness: avgCompleteness,
            prosody: avgProsody,
        }
    };
}

export default function RepeatText({ thread, userId, threadId }: { thread: string[], userId: string, threadId: string }) {

    const [audioFile, setAudioFile] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)


    const [currentRecord, setCurrentRecord] = useState<any>()

    const [threadRecord, setThreadRecord] = useState<any[]>([])

    const [report, setReport] = useState<any>()
    const [saveState, setSaveState] = useState('unsaved')

    const [recognitionText, setRecognitionText] = useState(''); // 存储语音识别的文本
    const [displayText, setDisplayText] = useState('');

    //是否在播放
    const [isPlaying, setIsPlaying] = useState(true);
    //是否在识别
    const [isRecognizing, setIsRecognizing] = useState(false)
    //是否在识别
    const [isReviewing, setIsReviewing] = useState(false)
    //是否有结果
    const [isFinish, setIsFinish] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null);

    const [sound, setSound] = useState<Howl | null>(null);

    function HowlerSuspend() {
        try {
            Howler.ctx?.suspend();
        } catch (e) {
            console.log('HowlerSuspend error', e);
        }
    }
    function HowlerResume() {
        try {
            setSound(null)
            Howler.ctx?.resume();
        } catch (e) {
            console.log('HowlerResume error', e);
        }
    }

    /// 监听页面可见性变化事件
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            HowlerResume();
        }else if(document.visibilityState === 'hidden'){
            setIsRecognizing(false);
            setIsFinish(false);
            setIsPlaying(false);
            setDisplayText('Press the button and try agian')
            setRecognitionText('')
            HowlerSuspend()
        }
    });

    // Cleanup on component unmount or page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (sound) {
                sound.stop();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (sound) {
                sound.stop();
            }
        };
    }, [sound]);


    //Handle Playing Audio
    function handleAudioPlay(audioData: ArrayBuffer) {

        const audioBlob = new Blob([audioData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioFile(audioUrl)


        var newSound = new Howl({
            src: [audioUrl],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setIsPlaying(true)
            },
            onend: function () {
                setDisplayText('Press the button and Repeat');
                setIsPlaying(false)
                console.log('Playback finished');
            }
        });
        setSound(newSound);
        newSound.play();
    }



    //Welcome Messgae TTS
    useEffect(() => {
        setDisplayText('Listen carefully...')
        synthesizeSpeech(thread[currentIndex], audioData => {
            if (audioData) {
                handleAudioPlay(audioData)
            } else {
                console.error('Speech synthesis failed or returned no audio');
            }
        })
    }, [currentIndex]);

    //handle Play
    const handleReplay = async () => {
        setDisplayText('Replaying...');
        setRecognitionText('')
        var sound = new Howl({
            src: [audioFile],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setIsPlaying(true)
            },
            onend: function () {
                setDisplayText('Press the button and Repeat!');
                setIsPlaying(false)
                console.log('Playback finished');
            }
        });
        sound.play();
    }

    const listeningRef = useRef(false)
    const [listening, setListening] = useState(false)
    const sttRef = useRef<speechsdk.SpeechRecognizer>()
    const audioConfigRef = useRef<speechsdk.AudioConfig>()
    const mediaStreamRef = useRef<MediaStream>()
    const [enableInput, setEnableInput] = useState(false)


    useUnmount(() => {
        try {
            listeningRef.current = false
            setListening(false)
            if (sttRef.current) sttRef.current.close()
        } catch { }
    })

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    var asrOff = new Howl({
        src: ['/sound/asr-off.wav'],
        format: ['wav'],
        autoplay: false,
    });
    var asrOn = new Howl({
        src: ['/sound/asr-on.wav'],
        format: ['wav'],
        autoplay: false,
    });


    const azureSpeechConfig = useMemo(() => {
        // const speechConfig = speechsdk.SpeechConfig.fromSubscription('8d0f1ad8db3a41bf91ba8a1e9b44a621', 'westus')
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
        speechConfig.speechRecognitionLanguage = 'en-US'
        // speechConfig.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', "12201")
        // speechConfig.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '3201')

        return { speechConfig }
    }, [])


    const handleStartRecording = useCallback((index: number) => {
        setDisplayText('Repeat After Me...');
        setIsRecognizing(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                mediaStreamRef.current = stream
                const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
                const audioConfig = speechsdk.AudioConfig.fromStreamInput(stream)
                audioConfigRef.current = audioConfig
                sttRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
                const pronunciationAssessmentConfig = new speechsdk.PronunciationAssessmentConfig(
                    thread[index],
                    speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
                    speechsdk.PronunciationAssessmentGranularity.Phoneme,
                    false
                );
                pronunciationAssessmentConfig.enableProsodyAssessment = true;
                pronunciationAssessmentConfig.applyTo(sttRef.current);
                var results: any[] = [];
                var recognizedText = "";

                sttRef.current.recognized = function (s, e) {
                    var jo = JSON.parse(e.result.properties.getProperty(speechsdk.PropertyId.SpeechServiceResponse_JsonResult));
                    if (jo.DisplayText != ".") {
                        console.log(`Recognizing: ${jo.DisplayText}`);
                        recognizedText += jo.DisplayText + " ";
                    }
                    console.log(jo)
                    results.push(jo);
                }

                function onRecognizedResult() {
                    console.log(`Recognized text: ${recognizedText}`);
                    let word_count = 0
                    let total_score = {
                        accuracy: 0,
                        fluency: 0,
                        comp: 0,
                        pron: 0,
                        prosody: 0
                    }
                    results.forEach(result => {
                        if (result.RecognitionStatus == 'Success') {
                            console.log(result)
                            word_count += result.NBest[0].Words.length
                            total_score.accuracy += result.NBest[0].Words.length * result.NBest[0].PronunciationAssessment.AccuracyScore
                            total_score.fluency += result.NBest[0].Words.length * result.NBest[0].PronunciationAssessment.FluencyScore
                            total_score.prosody += result.NBest[0].Words.length * result.NBest[0].PronunciationAssessment.ProsodyScore
                            total_score.comp += result.NBest[0].Words.length * result.NBest[0].PronunciationAssessment.CompletenessScore
                            total_score.pron += result.NBest[0].Words.length * result.NBest[0].PronunciationAssessment.PronScore
                        }
                    })
                    let compRate = recognizedText.length / thread[index].length * 1.1
                    if (compRate > 1) {
                        compRate = 1
                    }
                    const evalResult = {
                        text: recognizedText,
                        accuracy: +(total_score.accuracy * compRate / word_count).toFixed(0),
                        fluency: +(total_score.fluency * compRate / word_count).toFixed(0),
                        pron: +(total_score.pron * compRate / word_count).toFixed(0),
                        comp: +(total_score.comp * compRate / word_count).toFixed(0),
                        prosody: +(total_score.prosody * compRate / word_count).toFixed(0)
                    }
                    if (evalResult.pron) {
                        const recordReport = {
                            index: index,
                            text: thread[index],
                            input: recognizedText,
                            score: evalResult.pron,
                            detail_score: {
                                accuracy: evalResult.accuracy,
                                fluency: evalResult.fluency,
                                completeness: evalResult.comp,
                                prosody: evalResult.prosody,
                            },
                        }
                        console.log('Done Eval Speech')
                        console.log(recordReport)

                        setCurrentRecord(recordReport)
                        setDisplayText('');
                        setIsRecognizing(false);
                        setRecognitionText(thread[index]);
                        setIsFinish(true)
                        setIsReviewing(false)

                    } else {
                        setDisplayText('Not hearing, try again');
                        setIsRecognizing(false);
                        setIsFinish(false)
                        setIsReviewing(false)

                    }
                }

                sttRef.current.canceled = function (s, e) {
                    if (e.reason === speechsdk.CancellationReason.Error) {
                        var str = "(cancel) Reason: " + speechsdk.CancellationReason[e.reason] + ": " + e.errorDetails;
                        console.log(str);
                    }

                    sttRef.current?.stopContinuousRecognitionAsync();
                };

                sttRef.current.sessionStopped = function (s, e) {
                    sttRef.current?.stopContinuousRecognitionAsync();
                    sttRef.current?.close();
                    onRecognizedResult();
                };
                sttRef.current.startContinuousRecognitionAsync();

            })
            .catch(error => {
                setSaveState('failed')
                console.error('Error accessing media devices.', error);
            });
    }, [azureSpeechConfig])

    useEffect(() => {
        console.log('Get Cached Record', currentRecord)
        if (currentRecord) {
            if (!threadRecord[currentIndex]) {
                setThreadRecord(prev => [
                    ...prev,
                    currentRecord,
                ]);
                console.log(threadRecord)
            } else {
                setThreadRecord(prev => [
                    ...prev.slice(0, -1),
                    currentRecord,
                ])
            }
        }
    }, [currentRecord])

    useEffect(() => {
        console.log('Update Thread Record', threadRecord)

    }, [threadRecord])

    // const handleStartRecording2 = async () => {

    //     asrOn.play()
    //     try {
    //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    //         const mediaRecorder = new MediaRecorder(stream);
    //         mediaRecorderRef.current = mediaRecorder;
    //         audioChunksRef.current = [];

    //         mediaRecorder.ondataavailable = event => {
    //             audioChunksRef.current.push(event.data);
    //         };

    //         mediaRecorder.onstop = async () => {
    //             const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    //             stream.getTracks().forEach(track => track.stop());
    //             try {
    //                 console.log('Start Webm2Wav')
    //                 const wavBlob = await webm2Wav(audioBlob);
    //                 console.log('Start Eval Speech')
    //                 const evalResult = await evalSpeechFromFile(thread[currentIndex], wavBlob) as any;
    //                 const recordReport = {
    //                     index: currentIndex,
    //                     text: thread[currentIndex],
    //                     score: evalResult.pronunciation,
    //                     detail_score: {
    //                         accuracy: evalResult.accuracy,
    //                         fluency: evalResult.fluency,
    //                         completeness: evalResult.completeness,
    //                         prosody: evalResult.prosody,
    //                     },
    //                 }
    //                 console.log('Done Eval Speech')
    //                 if (!currentRecord) {
    //                     setThreadRecord(prev => [
    //                         ...prev,
    //                         recordReport,
    //                     ]);
    //                 } else {
    //                     setThreadRecord(prev => [
    //                         ...prev.slice(0, -1),
    //                         recordReport,
    //                     ])
    //                 }
    //                 setCurrentRecord(recordReport)
    //                 setDisplayText('');
    //                 setIsRecognizing(false);
    //                 setRecognitionText(thread[currentIndex]);
    //                 setIsFinish(true)
    //                 setIsReviewing(false)
    //                 audioChunksRef.current = []; // Clear array to release memory
    //             } catch (error) {
    //                 console.error('Error ASR:', error);
    //                 setDisplayText('Not Hearing...Try again');
    //                 setIsRecognizing(false)
    //                 setIsReviewing(false)
    //                 setIsReviewing(false);
    //             }
    //         };

    //         mediaRecorder.start();
    //         setDisplayText('Repeat After Me...');
    //         setIsRecognizing(true);
    //     } catch (error) {
    //         console.error('Error starting recording:', error);
    //         setDisplayText('Not Hearing...Try again');
    //         setIsRecognizing(false);
    //     }
    // };

    // const handleStopRecording2 = async () => {
    //     if (mediaRecorderRef.current) {
    //         setIsReviewing(true)
    //         mediaRecorderRef.current.stop();
    //         setDisplayText('Reviewing...');

    //     }
    // };

    const handleStopRecording = useCallback(() => {
        setIsReviewing(true)
        setDisplayText('Reviewing...');
        if (sttRef.current) {
            sttRef.current.stopContinuousRecognitionAsync(() => {
                sttRef.current?.close();
                sttRef.current = undefined;
            });
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            sttRef.current = undefined;
        }
        if (audioConfigRef.current) {
            sttRef.current = undefined;
        }
    }, []);

    const handleRetry = useCallback(() => {
        setIsRecognizing(false);
        setIsFinish(false);
        setIsPlaying(false);
        setDisplayText('Press the button and try agian')
        setRecognitionText('')
    }, []);




    const nextPage = () => {
        setCurrentRecord(null)
        if (currentIndex + 1 <= thread.length - 1) {
            setIsRecognizing(false);
            setIsFinish(false);
            setIsPlaying(false);
            setAudioFile("")
            setDisplayText('')
            setRecognitionText('')
            setCurrentIndex(currentIndex + 1)
        } else {
            setIsRecognizing(false);
            setIsFinish(false);
            setIsPlaying(true);
            setSaveState('saving')
            const final_report = calculateAverages(threadRecord)
            setReport(final_report)
            saveRepeatRecord(userId, threadId, final_report.score, final_report, threadRecord)
                .then(res => setSaveState('saved'))
        }
    }

    if (saveState == 'saving') {
        return (
            <div className=' h-screen flex flex-col justify-center items-center animate-pulse'>
                AI 评分中...
            </div>
        )
    }


    if (saveState == 'saved' && report.score) {
        return (
            <div className=' h-full flex flex-col justify-center items-center '>
                <LessonReport score={report.score} detail={report.detailScore} />
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center justify-center h-full p-2">
            <div className="w-full text-xl  mx-6 flex  flex-col h-full justify-center items-center">
                <audio ref={audioRef} className="sr-only">
                </audio>

                <Card className="w-full md:w-3/4 z-50 p-4 pb-6 h-fit rounded-[36px]  font-medium text-center bg-white/75 ">
                    <div className="flex justify-center  w-full p-2">
                        {recognitionText.length > 0 && !isRecognizing && threadRecord[currentIndex] && threadRecord[currentIndex].score ?
                            <Bravo score={threadRecord[currentIndex].score * 1.1} />
                            :
                            <div>
                                <Button onClick={handleReplay} size='icon' variant='ghost' className="w-12 h-12" disabled={isPlaying || isRecognizing}>
                                    <Volume1Icon color="#42C83C" className="w-8 h-8"></Volume1Icon>
                                </Button>
                            </div>
                        }

                    </div>

                    {!recognitionText || !threadRecord[currentIndex] ?
                        <div className="text-xl md:text-2xl  w-full text-pretty text-ellipsis overflow-hidden">
                            {thread[currentIndex]}
                        </div>
                        :
                        <div className={`text-xl md:text-2xl  w-full text-pretty text-ellipsis overflow-hidden ${threadRecord[currentIndex].score >= 70 ? 'text-primary' : 'text-red-600'}`}>{recognitionText}</div>
                    }

                </Card>
            </div>

            <div className='w-full flex flex-col-reverse gap-8 h-full p-8'>
                <div className='grid grid-cols-3 object-center gap-4 justify-items-center items-center'>
                    <div></div>
                    {
                        !isRecognizing ?
                            !isFinish ?
                                <Button
                                    type='button'
                                    size={'icon'}
                                    className={`h-fit p-6 bg-[#42C83C] w-fit rounded-full border-8 border-white }`}
                                    onClick={() => handleStartRecording(currentIndex)}
                                    disabled={isPlaying || isReviewing}
                                >

                                    <Mic width="60" height="60" />


                                </Button>
                                :
                                <Button
                                    type='button'
                                    size={'icon'}
                                    className={`h-fit p-6 bg-[#42C83C] w-fit rounded-full border-8 border-white }`}
                                    onClick={handleRetry}
                                    disabled={isPlaying || isReviewing}
                                >
                                    <RefreshCwIcon width="60" height="60" />

                                </Button>
                            :
                            <Button
                                type='button'
                                size={'icon'}
                                className={`h-fit p-6 bg-red-500 hover:bg-red-900 w-fit rounded-full border-8 border-white animate-bounce`}
                                onClick={handleStopRecording}
                                disabled={isPlaying || isReviewing}
                            >
                                <StopIcon width="60" height="60" />
                            </Button>
                    }
                    {recognitionText.length > 0 && !isRecognizing ?
                        <Button size="icon" className='rounded-full p-3 w-fit h-fit bg-[#42C83C] border-4 border-white ' onClick={() => nextPage()}>
                            <IconRightArrow className="w-6 h-6" />
                        </Button>
                        :
                        null
                    }
                </div>

                <div className=
                    {` text-xl md:text-2xl
                 ${displayText == 'Repeat After Me...' ? 'animate-bounce ' : ''} 
                w-full text-center text-white`
                    } style={{ textShadow: '2px 2px 2px #333' }}>
                    {displayText}
                </div>
            </div>
        </div>

    )
}