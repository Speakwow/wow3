'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IconRightArrow } from "@/components/ui/icons"
import { evalSpeechFromFile, evalSpeechWithTopicFromFile } from "@/lib/speech/eval";
import { webm2Wav } from "@/lib/speech/wav";
import { LoaderIcon, Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUnmount } from 'usehooks-ts'
import { Howl } from 'howler';
import { Badge } from "@/components/ui/badge";
import { finishTalkaboutRecord } from "@/lib/action/mongoIO";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import Image from 'next/image'
import AzureConfig from "@/lib/speech/config";
import _ from "lodash";
import { Score2Grade } from "@/lib/tools"
// function HighlightWords({ story }: { story: any }) {
//     return story.section.telling_word_timestamps.map((item: any, index: number) => <span key={index} className={story.audioPlayTime >= item.start && story.audioPlayTime < item.end ? "text-primary" : ''}>{item.word} </span>)
// }

export default function Talkabout({ image_url, threadId, recordId, prepare_time, answer_time, instruction, topic, examplar }: { image_url: any, threadId: string, recordId: string, prepare_time: number, answer_time: number, instruction: string, topic: string, examplar: string }) {

    const [recognitionText, setRecognitionText] = useState(''); // 存储语音识别的文本
    const [displayText, setDisplayText] = useState('');
    const [isRecognizing, setIsRecognizing] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter()
    const [isRecording, setIsRecording] = useState(false);
    const [step, setStep] = useState('prepare');
    const [countdown, setCountdown] = useState<number>(prepare_time); // 3 minutes countdown

    const [pronResult, setPronResult] = useState<any>();


    useEffect(() => {
        let countdownInterval: NodeJS.Timeout;

        if (countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown(prevCountdown => prevCountdown - 1);
            }, 1000);
        } else if (countdown === 0 && !isRecording && step == 'prepare') {
            setCountdown(answer_time);

            var asrOn = new Howl({
                src: ['/sound/asr-on.wav'],
                format: ['wav'],
                autoplay: false,
                onend: function () {
                    startListen()
                }
            });
            asrOn.play()

            setStep('practice')
        }
        else if (countdown === 0 && isRecording && step == 'practice') {
            stopListen();
            setStep('end')
        }

        return () => clearInterval(countdownInterval);
    }, [countdown, isRecording]);


    async function handleSkipPrepare() {
        var asrOn = new Howl({
            src: ['/sound/asr-on.wav'],
            format: ['wav'],
            autoplay: false,
            onend: function () {
                startListen()
            }
        });

        asrOn.play()
        setCountdown(answer_time);
        startListen();
        setStep('practice')
    }

    const [finishFeedback, setFinishFeedback] = useState(false)
    //Handle Correct
    const [feedback, setFeedback] = useState('')
    const [contentScore, setContentScore] = useState(0)
    const [languageScore, setLanguageScore] = useState(0)
    const [finalScore, setFinalScore] = useState(0)
    const [saveState, setSaveState] = useState('unsaved')

    async function handleFeedback(image_url: string, user_answer: string, pronResult: any) {
        setSaveState('saving')
        sttRef?.current?.close()
        const res = await fetch('/api/talkabout/feedback',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ threadId: threadId, user_answer: user_answer })
            })
        const feedbackData = await res.json()

        // console.log(data.message)
        setFeedback(feedbackData.feedback)
        setContentScore(feedbackData.content_score)
        setLanguageScore(feedbackData.language_score)
        setFinishFeedback(true)
        const finalScore = feedbackData.content_score * 0.4 + feedbackData.language_score * 0.2 + feedbackData.speed_score * 0.13 + pronResult.accuracy * 0.14 + pronResult.fluency * 0.13
        setFinalScore(finalScore)

        finishTalkaboutRecord(recordId, +finalScore.toFixed(0), {
            user_answer: pronResult.text,
            themeScore: feedbackData.theme_relevance_score,
            vocabScore: feedbackData.vocabulary_score,
            grammarScore: feedbackData.grammarza_syntax_score,
            speedScore: feedbackData.speed_score,
            feedback: feedbackData.feedback,
            overallContentScore: feedbackData.content_score,
            overallLanguageScore: feedbackData.language_score,
            overallPronScore: pronResult.accuracy * 0.34 + pronResult.fluency * 0.33 + feedbackData.speed_score * 0.33,
            accuracy: pronResult.accuracy,
            fluency: pronResult.fluency
        }).then(res => {
            if (res) {
                setSaveState('saved')
            } else {
                setSaveState('failed')
            }
        })
    }


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
        const speechConfig = speechsdk.SpeechConfig.fromSubscription('470509c377dd414bb2f3d3d61c314e2c', 'eastasia');
        speechConfig.speechRecognitionLanguage = 'en-US'
        // speechConfig.setProperty('SpeechServiceConnection_InitialSilenceTimeoutMs', "12201")
        // speechConfig.setProperty('SpeechServiceConnection_EndSilenceTimeoutMs', '3201')

        return { speechConfig }
    }, [])




    const startListen = useCallback(() => {
        asrOn.play()
        if (azureSpeechConfig === null) return
        setDisplayText('正在练习中')
        setIsRecording(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream: MediaStream) => {
                mediaStreamRef.current = stream
                const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
                const audioConfig = speechsdk.AudioConfig.fromStreamInput(stream)
                audioConfigRef.current = audioConfig
                sttRef.current = new speechsdk.SpeechRecognizer(speechConfig, audioConfig)
                const pronunciationAssessmentConfig = new speechsdk.PronunciationAssessmentConfig(
                    "",
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
                            total_score.pron += result.NBest[0].Words.length * result.NBest[0].PronunciationAssessment.PronScore
                        }
                    })
                    const finalResult = {
                        text: recognizedText,
                        accuracy: +(total_score.accuracy / word_count).toFixed(0),
                        fluency: +(total_score.fluency / word_count).toFixed(0),
                        pron: +(total_score.pron / word_count).toFixed(0),
                        prosody: +(total_score.prosody / word_count).toFixed(0)
                    }
                    console.log(finalResult)

                    handleFeedback(image_url, recognizedText, finalResult)
                    setPronResult({
                        text: results[results.length - 1].text,
                        accuracy: finalResult.accuracy,
                        fluency: finalResult.fluency,
                        prosody: finalResult.prosody,
                        overall_pronunciation: finalResult.pron
                    })
                }

                sttRef.current.canceled = function (s, e) {
                    if (e.reason === speechsdk.CancellationReason.Error) {
                        var str = "(cancel) Reason: " + speechsdk.CancellationReason[e.reason] + ": " + e.errorDetails;
                        console.log(str);
                    }
                    sttRef.current?.stopContinuousRecognitionAsync();
                };

                sttRef.current.sessionStopped = function (s, e) {
                    setIsRecording(false);
                    setStep('end')
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


    const stopListen = useCallback(() => {
        asrOff.play()
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



    const finishLesson = async () => {

        router.push('/')
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

    useEffect(() => {
        if (enableInput) {
            startListen()
        } else {
            if (!listeningRef.current) return
            if (audioConfigRef.current) {
                audioConfigRef.current.close()
                audioConfigRef.current = undefined
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getAudioTracks().forEach(track => track.stop())
                mediaStreamRef.current = undefined
            }
            if (sttRef.current) {
                sttRef.current.close()
                sttRef.current = undefined
            }
        }
    }, [enableInput])





    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 mb-32">
            <Card className={`px-4 py-2 text-center text-xm flex flex-row justify-center  items-center  gap-4 whitespace-pre-line ${step == "end" && 'text-white bg-[#42C83C]'} ${step == "practice" && 'border-2 border-[#42C83C]'}`}>
                {step == "prepare" && <div>准备时间剩余 ： <span className="text-2xl  text-[#42C83C]">{Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</span></div>}
                {step == "practice" && <div>作答时间剩余 ： <span className="text-2xl  text-[#42C83C]">{Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</span></div>}
                {step == "end" && <div className="text-xl">🎉 练习已完成</div>}
                {step == "prepare" && <Button variant="secondary" size="sm" onClick={handleSkipPrepare}>跳过</Button>}
            </Card>
            <div className="w-full relative text-3xl   flex justify-center items-center">
                <audio ref={audioRef} className="sr-only">
                </audio>
                <div className="z-50 rounded-[36px]  sticky font-semibold text-center">
                    <Image
                        src={image_url} // 外部图片 URL
                        alt="Reference Image"
                        width={450}
                        height={300}
                        style={{
                            objectFit: 'cover', // cover, contain, none
                        }}

                        className={` ${step == 'end' ? "h-64" : "h-64"}`}
                    />
                </div>
            </div>
            {
                step == 'prepare' || step == 'practice' ?
                    <div className="flex w-fit flex-col gap-4 justify-center items-center">
                        <Card className="w-full whitespace-pre-line">
                            <CardHeader className="p-4">
                                <CardTitle className="text-center text-xl text-[#42C83C]">
                                    思路提示
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-left">
                                {instruction}
                            </CardContent>
                        </Card>
                    </div>
                    :
                    null
            }
            {/* {
                step == 'end' &&
                <div className="flex flex-col gap-4 justify-center items-center">
                    <Card className=" w-[800px] whitespace-pre-line">
                        <CardHeader className="p-4">
                            <CardTitle className="text-center text-xl text-[#42C83C]">
                                你的回答
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            {pronResult && pronResult.text}
                        </CardContent>
                    </Card>
                </div>
            } */}
            {step == 'practice' &&
                <div className='w-full flex flex-col  h-full p-8'>
                    <div className='grid grid-cols-3 object-center gap-4 justify-items-center items-center'>
                        <div></div>
                        {
                            !isRecording ?
                                <Button
                                    type='button'
                                    size={'icon'}
                                    className={`h-fit p-6 bg-[#3F51B5] w-fit rounded-full border-4 border-white}`}
                                    onClick={startListen}
                                    disabled={isRecording}
                                >
                                    <Mic width="40" height="40" />

                                </Button>
                                :
                                <Button
                                    type='button'
                                    size={'icon'}
                                    variant="destructive"
                                    className={`h-fit p-6 w-fit rounded-full border-4 border-white ${isRecording === true ? 'animate-bounce' : ''}`}
                                    onClick={stopListen}
                                    disabled={isRecording}
                                >
                                    <Mic width="40" height="40" />
                                </Button>
                        }
                        {recognitionText.length > 0 && !isRecognizing ?
                            <Button size="icon" className='rounded-full p-3 w-fit h-fit bg-[#42C83C] border-4 border-white '>
                                <IconRightArrow className="w-6 h-6" />
                            </Button>
                            :
                            null
                        }
                    </div>

                    <div className=
                        {`text-lg
                 ${displayText == 'Repeat After Me...' ? 'animate-bounce text-3xl' : 'text-2xl'} 
                 ${displayText == 'Great!' ? 'text-4xl' : ''} 
                w-full text-center text-white`
                        } style={{ textShadow: '2px 2px 2px #333' }}>
                        {displayText}
                    </div>
                </div>
            }
            {step == 'end' &&
                <div className="flex flex-col gap-4 justify-center items-center w-full">
                    <Card className=" w-full whitespace-pre-line">
                        <CardHeader className="p-4">

                        </CardHeader>
                        {!finishFeedback ?
                            <CardContent className="animate-pulse text-center w-full gap-4 text-primary">
                                {saveState == 'failed' ? '😭 抱歉，Frank 没听清楚' : '🐸 Frank 正在写评语...'}
                            </CardContent>
                            :
                            <CardContent className="text-center grid grid-cols-4 gap-4">
                                <div className="col-span-4">
                                    <Badge className="rounded-full px-6  border-[#42C83C]" variant="outline">
                                        总分：<span className="text-[#42C83C] text-3xl">{Score2Grade(finalScore)}</span>
                                    </Badge>
                                </div>
                                <div className="col-span-4 px-6 text-xl text-[#42C83C] mb-4">
                                    {feedback}
                                </div>
                                <div>
                                    内容相关度：<span className="text-[#42C83C] text-3xl">{Score2Grade(contentScore)}</span>
                                </div>
                                <div>
                                    语言丰富度：<span className="text-[#42C83C] text-3xl">{Score2Grade(languageScore)}</span>
                                </div>
                                <div>
                                    发音准确度：<span className="text-[#42C83C] text-3xl">{Score2Grade(pronResult?.accuracy)}</span>
                                </div>
                                <div>
                                    表达流利度：<span className="text-[#42C83C] text-3xl">{Score2Grade(pronResult?.fluency)}</span>
                                </div>
                            </CardContent>
                        }
                        <CardFooter className="flex justify-center text-xs items-center border-t p-6">
                            {saveState == 'saved' ?
                                <Button variant="default" className=" w-1/2 py-6 text-white" onClick={finishLesson}>
                                    完成练习
                                </Button> :
                                saveState == 'failed' ?
                                    <div className="flex flex-row gap-4">
                                        <Button variant="outline" className=" " onClick={() => router.push('/')} >
                                            返回首页
                                        </Button>
                                    </div>
                                    :
                                    <Button variant='secondary' disabled={saveState == 'saving'}>
                                        <LoaderIcon className="animate-spin" />
                                    </Button>
                            }
                        </CardFooter>
                    </Card>
                </div>

            }
        </div>

    )
}