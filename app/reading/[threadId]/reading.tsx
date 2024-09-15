'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IconRightArrow } from "@/components/ui/icons"
import { synthesizeSpeech } from "@/lib/speech/tts";
import { Mic, RefreshCwIcon, Volume1Icon } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Howl } from 'howler';
import { Bravo } from "./bravo";
import { saveRepeatRecord } from "@/lib/action/mongoIO";
import { LessonReport } from "@/components/report";
import { StopIcon } from "@radix-ui/react-icons";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import AzureConfig from "@/lib/speech/config";
import _ from "lodash";
import { useUnmount } from "usehooks-ts";
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useRouter } from "next/navigation";
import stringSimilarity from "string-similarity"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";


export default function Reading({ thread, userId, threadId }: { thread: any, userId: string, threadId: string }) {

    const text = thread.text
    const intro = thread.intro
    const questions = thread.questions


    const router = useRouter()
    const { toast } = useToast()

    //是否开始问题
    const [startQuestion, setStartQuestion] = useState(false)

    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentRecord, setCurrentRecord] = useState<any>()
    const [threadRecord, setThreadRecord] = useState<any[]>([])

    const [report, setReport] = useState<any>()
    const [saveState, setSaveState] = useState('unsaved')
    const [currentAnswer, setCurrentAnswer] = useState(''); // 存储语音识别的文本
    const [displayText, setDisplayText] = useState('');

    //是否在识别
    const [isRecognizing, setIsRecognizing] = useState(false)
    //是否在识别
    const [isReviewing, setIsReviewing] = useState(false)
    //是否有结果
    const [isFinish, setIsFinish] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null);
    const [sound, setSound] = useState<Howl | null>(null);

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
    var correct = new Howl({
        src: ['/sound/game_correct.mp3'],
        format: ['mp3'],
        autoplay: false,
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

    const listeningRef = useRef(false)
    const sttRef = useRef<speechsdk.SpeechRecognizer>()
    const audioConfigRef = useRef<speechsdk.AudioConfig>()
    const mediaStreamRef = useRef<MediaStream>()


    useUnmount(() => {
        try {
            listeningRef.current = false
            setIsRecognizing(false)
            if (sttRef.current) sttRef.current.close()
        } catch { }
    })



    const azureSpeechConfig = useMemo(() => {
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(AzureConfig.key, AzureConfig.region);
        speechConfig.speechRecognitionLanguage = 'en-US'
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
                var results: any[] = [];
                var recognizedText = "";

                sttRef.current.recognized = function (s, e) {
                    var jo = JSON.parse(e.result.properties.getProperty(speechsdk.PropertyId.SpeechServiceResponse_JsonResult));
                    if (jo.DisplayText != ".") {
                        console.log(`Recognizing: ${jo.DisplayText}`);
                        if (jo.DisplayText.length > 0 && jo.DisplayText != 'undefined') {
                            recognizedText += jo.DisplayText + " ";
                            setCurrentAnswer(recognizedText)
                        }
                    }
                    console.log(jo)
                    results.push(jo);
                }

                function onRecognizedResult() {
                    console.log(`Recognized text: ${recognizedText}`);
                    setCurrentAnswer(recognizedText)

                    if (recognizedText) {
                        setDisplayText('');
                        setIsRecognizing(false);
                        setIsReviewing(true)
                        fetch('/api/reading/review', {
                            method: 'POST',
                            body: JSON.stringify({
                                article: text,
                                question: questions[index].question,
                                suggested_answer: questions[index].answer,
                                stu_answer: recognizedText
                            })
                        })
                            .then(res => res.json())
                            .then(data => {
                                setCurrentRecord({
                                    question: questions[index],
                                    answer: recognizedText,
                                    score: data
                                })
                                setIsReviewing(false)
                            }).catch(error => {
                                setSaveState('failed')
                                setDisplayText('review failed, try again');
                                setIsRecognizing(false);
                                setIsReviewing(false)
                                console.error('Error accessing media devices.', error);
                            })
                    } else {
                        setDisplayText('Not hearing, try again');
                        setIsRecognizing(false);
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
                setDisplayText('load failed, try again');
                setIsRecognizing(false);
                setIsReviewing(false)
                console.error('Error accessing media devices.', error);
            });
    }, [azureSpeechConfig])

    useEffect(() => {
        console.log('Get Record', currentRecord)

        if (currentRecord) {
            correct.play()
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

    // const handleRetry = useCallback(() => {
    //     setIsRecognizing(false);
    //     setIsFinish(false);
    //     setIsPlaying(false);
    //     setDisplayText('Press the button and try agian')
    //     setRecognitionText('')
    // }, []);




    const nextPage = () => {
        setCurrentRecord(null)
        if (currentIndex + 1 <= thread.questions.length - 1) {
            setIsRecognizing(false);
            setCurrentAnswer('')
            setCurrentRecord(null)
            setIsFinish(false);
            setDisplayText('')
            setCurrentIndex(currentIndex + 1)
        } else {
            setIsRecognizing(false);
            setIsFinish(false);
            setCurrentAnswer('')
            setCurrentRecord(null)
            setSaveState('saving')
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
        <div className="w-full h-full flex flex-col items-center justify-between p-2 gap-4 pb-4">
            <Card className="max-h-[500px] w-full grow flex flex-col gap-2 bg-white/75 backdrop-blur py-6">

                <CardDescription className="px-6">
                    {thread.intro}
                </CardDescription>
                <div className="flex grow overflow-auto py-0 px-6">
                    <div className="flex flex-col h-full gap-4">
                        <p className="w-full h-fit text-pretty text-ellipsis whitespace-pre-line">
                            {text}
                        </p>
                        <p className="text-center text-xs p-4 text-muted-foreground">
                            - 阅读完毕 -
                        </p>
                    </div>

                </div>
            </Card>

            <Card className=" w-full flex p-4 flex-row justify-between bg-white/75 backdrop-blur">
                <div className="flex flex-col">
                    <div className="flex flex-row gap-2 items-center">
                <div className="text-muted-foreground text-sm font-medium">{currentIndex + 1} / {questions.length}</div>
                    <div className="text-xl font-medium">
                        {questions[currentIndex].question}
                    </div>
                    </div>
                    {currentAnswer && currentAnswer.length > 0 ?
                        <div className={`text-pretty ${currentRecord && currentRecord.score > 0.6 ? 'text-primary ' : 'text-red-500'}`}>
                            <p className="inline">{!isReviewing && currentRecord.score > 0.6 ? ' ✅ ' : ' ❌ '}</p>
                            {currentAnswer}
                        </div>
                        :
                        <div className="text-muted-foreground animate-pulse text-xs">
                            等待作答
                        </div>
                    }
                </div>
                <div className='flex flex-row  mt-auto '>
                    {currentRecord ?
                        <div>
                            <Button size="icon" className='rounded-full p-3 w-fit h-fit bg-[#42C83C] border-4 border-white ' onClick={() => nextPage()}>
                                <IconRightArrow className="w-6 h-6" />
                            </Button>
                        </div>
                        :
                        isRecognizing ?
                            <Button
                                type='button'
                                size={'icon'}
                                className={`h-fit p-2 bg-red-500 hover:bg-red-900 w-fit rounded-full border-4 border-white animate-pulse`}
                                onClick={handleStopRecording}
                                disabled={isReviewing}
                            >
                                <StopIcon width="30" height="30" />
                            </Button>
                            :
                            <Button
                                type='button'
                                size={'icon'}
                                className={`h-fit p-2 bg-[#42C83C] w-fit rounded-full border-4 border-white }`}
                                onClick={() => handleStartRecording(currentIndex)}
                                disabled={isReviewing}
                            >
                                <Mic width="30" height="30" />
                            </Button>

                    }
                    {/* <div className=
                        {` text-xl md:text-2xl
                 ${displayText == 'Repeat After Me...' ? 'animate-bounce ' : ''} 
                w-full text-center text-white`
                        } style={{ textShadow: '2px 2px 2px #333' }}>
                        {displayText}
                    </div> */}
                </div>
            </Card>
        </div>

    )
}