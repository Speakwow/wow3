'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { IconRightArrow } from "@/components/ui/icons"
import { sttFromMic } from "@/lib/speech/asr";
import { EvalResult, evalSpeechFromFile } from "@/lib/speech/eval";
import { synthesizeSpeech } from "@/lib/speech/tts";
import { webm2Wav } from "@/lib/speech/wav";
import { Mic, RefreshCwIcon, Volume1Icon } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Howl } from 'howler';
import { Bravo } from "@/components/bravo";
import { saveWordRecord } from "@/lib/action/mongoIO";
import { LessonReport } from "@/components/report";
import { useUnmount } from "usehooks-ts";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import Image from 'next/image'
import AzureConfig from "@/lib/speech/config";
import _ from "lodash";
import { Score2Grade } from "@/lib/tools"


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

let currentText = ''
var asrOn = new Howl({
    src: ['/sound/asr-on.wav'],
    format: ['wav'],
    autoplay: false,
});

var asrOff = new Howl({
    src: ['/sound/asr-off.wav'],
    format: ['wav'],
    autoplay: false,
});

export default function RepeatText({ thread, userId, threadId }: { thread: any[], userId: string, threadId: string }) {

    const [audioFile, setAudioFile] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)
    const [threadRecord, setThreadRecord] = useState<any[]>([])
    const [currentRecord, setCurrentRecord] = useState<any>()

    const [report, setReport] = useState<any>()
    const [saveState, setSaveState] = useState('unsaved')

    const [recognitionText, setRecognitionText] = useState(''); // 存储语音识别的文本
    const [displayText, setDisplayText] = useState('');

    const [loading, setLoading] = useState(true);
    //是否在播放
    const [isPlaying, setIsPlaying] = useState(false);
    //是否在识别
    const [isRecognizing, setIsRecognizing] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null);

    const howlRef = useRef<Howl | null>(null);
    const audioUrlRef = useRef<string | null>(null);


    //Handle Playing Audio
    function handleAudioPlay(audioData: ArrayBuffer) {
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
        }
        const audioBlob = new Blob([audioData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;
        setAudioFile(audioUrl)


        // 卸载之前的 Howl 实例
        if (howlRef.current) {
            howlRef.current.unload();
            howlRef.current = null;
        }

        var sound = new Howl({
            src: [audioUrl],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setLoading(true);
                setIsPlaying(true)
            },
            onend: function () {
                setIsPlaying(false)
                console.log('Playback finished');
                handleSpeechToText(currentIndex)

            }
        });
        howlRef.current = sound;
        sound.play();
    }



    //Welcome Messgae TTS
    useEffect(() => {
        setDisplayText('Listen carefully...')
        synthesizeSpeech(thread[currentIndex].text, audioData => {
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

        // 卸载之前的 Howl 实例
        if (howlRef.current) {
            howlRef.current.unload();
            howlRef.current = null;
        }
        var sound = new Howl({
            src: [audioFile],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setLoading(true);
                setIsPlaying(true)
            },
            onend: function () {
                setDisplayText('Press the button and Repeat');
                setIsPlaying(false)
                setLoading(false);
                console.log('Playback finished');

                // 卸载 Howl 实例
                sound.unload();
                howlRef.current = null;
            }
        });
        howlRef.current = sound;
        sound.play();
    }

    const azureSpeechConfig = useMemo(() => {
        // const speechConfig = speechsdk.SpeechConfig.fromSubscription('8d0f1ad8db3a41bf91ba8a1e9b44a621', 'westus')
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
        speechConfig.speechRecognitionLanguage = 'en-US'
        // speechConfig.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', "12201")
        // speechConfig.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '3201')

        return { speechConfig }
    }, [])

    const listeningRef = useRef(false)
    const [listening, setListening] = useState(false)
    const sttRef = useRef<speechsdk.SpeechRecognizer>()
    const evalRef = useRef<speechsdk.SpeechRecognizer>()
    const audioConfigRef = useRef<speechsdk.AudioConfig>()
    const mediaStreamRef = useRef<MediaStream>()

    useUnmount(() => {
        try {
            listeningRef.current = false
            setListening(false)
            if (sttRef.current) sttRef.current.close()
        } catch { }
    })

    //Handle Asr with Eval
    const handleSpeechToText = useCallback((index: number) => {

        setDisplayText('loading...');
        setLoading(true)
        setIsRecognizing(true)
        setRecognitionText('');
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                setDisplayText('Say it out loud!');
                console.log(thread[index].text)
                mediaStreamRef.current = stream
                const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
                const audioConfig = speechsdk.AudioConfig.fromStreamInput(stream)
                audioConfigRef.current = audioConfig
                sttRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
                evalRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
                const pronunciationAssessmentConfig = new speechsdk.PronunciationAssessmentConfig(
                    thread[index].text,
                    speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
                    speechsdk.PronunciationAssessmentGranularity.Phoneme,
                    false
                );
                pronunciationAssessmentConfig.applyTo(evalRef.current);

                sttRef.current.recognizeOnceAsync(result => {
                    switch (result.reason) {
                        case speechsdk.ResultReason.RecognizedSpeech:
                            console.log(`RECOGNIZED: Text=${result.text}`);
                            setDisplayText('Reviewing...');
                            setRecognitionText(result.text);
                            break;
                        case speechsdk.ResultReason.NoMatch:
                            console.log("NOMATCH: Speech could not be recognized.");
                            console.error('Speech recognition error:');
                            // setDisplayText('Not Hearing...Try again');
                            // setLoading(false)
                            // setIsRecognizing(false)
                            break;
                        case speechsdk.ResultReason.Canceled:
                            const cancellation = speechsdk.CancellationDetails.fromResult(result);
                            console.log(`CANCELED: Reason=${cancellation.reason}`);

                            if (cancellation.reason == speechsdk.CancellationReason.Error) {
                                console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                                console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                                console.log("CANCELED: Did you set the speech resource key and region values?");

                                // setDisplayText('Not Hearing...Try again');
                                // setLoading(false)
                                // setIsRecognizing(false)
                            }
                            break;
                    }

                    if (mediaStreamRef.current) {
                        mediaStreamRef.current.getTracks().forEach(track => track.stop());
                    }
                    if (audioConfigRef.current) {
                        sttRef.current = undefined;
                    }
                })

                evalRef.current.recognizeOnceAsync(result => {
                    switch (result.reason) {
                        case speechsdk.ResultReason.RecognizedSpeech:
                            var pronunciation_result = speechsdk.PronunciationAssessmentResult.fromResult(result);
                            var evalResult = {
                                text: result.text,
                                pronunciation: pronunciation_result.pronunciationScore,
                                accuracy: pronunciation_result.accuracyScore,
                                fluency: pronunciation_result.fluencyScore,
                            }
                            const recordReport = {
                                index: index,
                                text: thread[index].text,
                                score: evalResult.pronunciation,
                                detail_score: {
                                    accuracy: evalResult.accuracy,
                                    fluency: evalResult.fluency,
                                },
                            }
                            setRecognitionText(result.text);
                            console.log(recordReport)
                            setCurrentRecord(recordReport)
                            setDisplayText('');
                            setLoading(false)
                            setIsRecognizing(false)
                            break;
                        case speechsdk.ResultReason.NoMatch:
                            console.log("NOMATCH: Speech could not be recognized.");
                            console.error('Speech recognition error:');
                            setDisplayText('Not Hearing...Try again');
                            setLoading(false)
                            setIsRecognizing(false)
                            break;
                        case speechsdk.ResultReason.Canceled:
                            const cancellation = speechsdk.CancellationDetails.fromResult(result);
                            console.log(`CANCELED: Reason=${cancellation.reason}`);

                            if (cancellation.reason == speechsdk.CancellationReason.Error) {
                                console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                                console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                                console.log("CANCELED: Did you set the speech resource key and region values?");

                                setDisplayText('Not Hearing...Try again');
                                setLoading(false)
                                setIsRecognizing(false)
                            }
                            break;
                    }
                }
                )
            })


    }, [azureSpeechConfig])

    useEffect(() => {
        console.log('Get Current Record', currentRecord)
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

    //Handle Asr with Eval
    const handleSpeechToText2 = async () => {
        setDisplayText('Repeat After Me...');
        setLoading(true)
        setRecognitionText('');
        setIsRecognizing(true)
        asrOn.play()

        try {
            // 使用 MediaRecorder API 进行录音
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks: Blob[] = [];
            mediaRecorder.start();
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            const asrText = await sttFromMic() as string;

            setDisplayText('Reviewing...');
            setRecognitionText(asrText);
            mediaRecorder.stop();
            mediaRecorder.onstop = async () => {
                // 创建 Blob 保存音频文件
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                const wavBlob = await webm2Wav(audioBlob)
                const evalResult = await evalSpeechFromFile(thread[currentIndex].text, wavBlob) as EvalResult;
                const recordReport = {
                    index: currentIndex,
                    text: thread[currentIndex],
                    score: evalResult.pronunciation,
                    detail_score: {
                        accuracy: evalResult.accuracy,
                        fluency: evalResult.fluency,
                        completeness: evalResult.completeness,
                        prosody: evalResult.prosody,
                    },
                }
                console.log('Done Eval Speech')
                if (!currentRecord) {
                    setThreadRecord(prev => [
                        ...prev,
                        recordReport,
                    ]);
                } else {
                    setThreadRecord(prev => [
                        ...prev.slice(0, -1),
                        recordReport,
                    ])
                }
                setCurrentRecord(recordReport)
                setDisplayText('');
                // URL.revokeObjectURL(audioUrl);
                audioChunks = []; // 清空数组以释放内存」
                setLoading(false)
                setIsRecognizing(false)
            }
        } catch (error) {
            console.error('Speech recognition error:', error);
            setDisplayText('Not Hearing...Try again');
            setLoading(false)
            setIsRecognizing(false)

        }
    };



    const nextPage = () => {
        setCurrentRecord(null)
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
        }
        if (howlRef.current) {
            howlRef.current.unload();
        }

        if (currentIndex + 1 <= thread.length - 1) {
            setLoading(true)
            setAudioFile("")
            setDisplayText('')
            setRecognitionText('')
            setCurrentIndex(currentIndex + 1)

        } else {
            setSaveState('saving')
            const final_report = calculateAverages(threadRecord)
            setReport(final_report)
            saveWordRecord(userId, threadId, final_report.score, final_report, threadRecord)
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
        <div className="w-full flex flex-col items-center justify-center h-full">
            <div className="w-full text-2xl  mx-6 flex  flex-col h-full justify-center items-center">
                <audio ref={audioRef} className="sr-only">
                </audio>

                <Card className="w-5/6 z-50 p-4 pb-8 h-fit rounded-[36px]  font-medium text-center bg-white/75 ">
                    <div className="flex justify-center pb-4 w-full">
                        {recognitionText.length > 0 && !isRecognizing && threadRecord[currentIndex] && threadRecord[currentIndex].score ?
                            <Bravo score={threadRecord[currentIndex].score} />
                            :
                            <div>
                                <Button onClick={handleReplay} size='icon' variant='ghost' className="w-12 h-12" disabled={isPlaying || isRecognizing}>
                                    <Volume1Icon color="#42C83C" className="w-8 h-8"></Volume1Icon>
                                </Button>
                            </div>
                        }

                    </div>
                    <div className="w-full text-pretty text-ellipsis overflow-hidden flex flex-col justify-center items-center gap-2">
                        {!threadRecord[currentIndex] ?
                            <div className="w-full text-4xl font-bold p-2">
                                {thread[currentIndex].text}
                            </div>
                            :
                            <div className={`text-4xl text-primary font-bold p-2 ${threadRecord[currentIndex].score >= 70 ? 'text-primary' : 'text-red-600'}`}>
                                {thread[currentIndex].text}
                            </div>
                        }
                        <div className="text-lg text-muted-foreground">
                            {thread[currentIndex].symbol}
                        </div>
                        <div className="text-lg text-muted-foreground">
                            {thread[currentIndex].meaning}
                        </div>
                    </div>

                </Card>
            </div>

            <div className='w-full flex flex-col-reverse gap-8 h-full p-8'>
                <div className='grid grid-cols-3 object-center gap-4 justify-items-center items-center'>
                    <div></div>
                    <Button
                        type='button'
                        size={'icon'}
                        className={`h-fit p-6 bg-[#42C83C] w-fit rounded-full border-8 border-white ${isRecognizing === true ? 'animate-bounce' : ''}`}
                        onClick={() => handleSpeechToText(currentIndex)}
                        disabled={loading}
                    >   {
                            isRecognizing || isPlaying ?
                                <Mic width="60" height="60" />
                                :
                                <RefreshCwIcon width="60" height="60" />
                        }

                    </Button>
                    {recognitionText.length > 0 && !isRecognizing ?
                        <Button size="icon" className='rounded-full p-3 w-fit h-fit bg-[#42C83C] border-4 border-white ' onClick={() => nextPage()}>
                            <IconRightArrow className="w-6 h-6" />
                        </Button>
                        :
                        null
                    }
                </div>

                <div className=
                    {`
                 ${displayText == 'Repeat After Me...' ? 'animate-bounce text-3xl' : 'text-2xl'} 
                 ${displayText == 'Great!' ? 'text-4xl' : ''} 
                 ${loading == true ? '' : ''}
                w-full text-center text-white`
                    } style={{ textShadow: '2px 2px 2px #333' }}>
                    {displayText}
                </div>
            </div>
        </div>

    )
}