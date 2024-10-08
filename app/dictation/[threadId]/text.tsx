'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { IconRightArrow } from "@/components/ui/icons"
import { sttFromMic } from "@/lib/speech/asr";
import { EvalResult, evalSpeechFromFile } from "@/lib/speech/eval";
import { synthesizeSpeech } from "@/lib/speech/tts";
import { webm2Wav } from "@/lib/speech/wav";
import { Mic, RefreshCwIcon, SendIcon, Volume1Icon } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Howl } from 'howler';
import { Bravo } from "@/components/bravo";
import { saveDictationRecord, saveWordRecord } from "@/lib/action/mongoIO";
import { LessonReport } from "@/components/report";
import { useUnmount } from "usehooks-ts";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import Image from 'next/image'
import AzureConfig from "@/lib/speech/config";
import _ from "lodash";
import { Score2Grade } from "@/lib/tools"
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form, FormField } from "@/components/ui/form";
import { DictationReport } from "./report";


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


    const [currentIndex, setCurrentIndex] = useState(0)
    const [threadRecord, setThreadRecord] = useState<any[]>([])
    const [currentRecord, setCurrentRecord] = useState<any>()
    const [report, setReport] = useState<any>()
    const [saveState, setSaveState] = useState('unsaved')
    const [displayText, setDisplayText] = useState('');

    //是否在播放
    const [audioFile, setAudioFile] = useState('')
    const [isPlaying, setIsPlaying] = useState(false);

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

        var sound = new Howl({
            src: [audioUrl],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setIsPlaying(true)
            },
            onend: function () {
                setIsPlaying(false)
                setDisplayText('Type your answer');
                console.log('Playback finished');
            }
        });
        howlRef.current = sound;
        sound.play();
    }

    const { toast } = useToast()

    function HowlerSuspend() {
        try {
            Howler.ctx?.suspend();
        } catch (e) {
            console.log('HowlerSuspend error', e);
        }
    }
    function getPlatform() {
        if (/iPhone|iPad/i.test(navigator.userAgent)) {
            return ('ios')
        }
        else if (/Mobi|Android/i.test(navigator.userAgent)) {
            return ('android')
        }
        else {
            console.log('pc')
            return ('pc')
        }
    }

    /// 监听页面可见性变化事件
    document.addEventListener('visibilitychange', function () {
        if (getPlatform() === 'ios' && document.visibilityState === 'visible') {
            toast({
                title: "请重新开始练习",
                description: "练习中途不要退出开小差喔！",
                action: <ToastAction autoFocus altText="刷新" onClick={() => window.location.reload()}>刷新</ToastAction>,
            })
            HowlerSuspend()
        } else if (getPlatform() === 'ios' && document.visibilityState === 'hidden') {
            setIsPlaying(false);
            setDisplayText('Press the button and try agian')
        }
    });

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
        var sound = new Howl({
            src: [audioFile],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setIsPlaying(true)
            },
            onend: function () {
                setDisplayText('Type your answer');
                setIsPlaying(false)
            }
        });
        howlRef.current = sound;
        sound.play();
    }


    const formSchema = z.object({
        input: z.string().min(1, {
            message: "不可为空",
        }),
    })
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            input: ''
        }
    })
    const [input, setInput] = useState('')
    const [submitted, setSubmitted] = useState(false)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const isCorrect = values.input === thread[currentIndex].text;
        let score=0
        if(isCorrect) score=100
        const dictationReport = {
            index: currentIndex,
            text: thread[currentIndex].text,
            input: values.input,
            isCorrect: isCorrect,
            score: score,
        }
        if(!currentRecord)setThreadRecord(prev => [...prev, dictationReport])
        else setThreadRecord(prev => prev.map(item => item.text=== currentRecord.text ? dictationReport : item))
        setCurrentRecord(dictationReport)
        setSubmitted(true)
        setDisplayText('')
        form.setValue('input', '')
    }


    const nextPage = () => {
        setSubmitted(false)
        setCurrentRecord(null)
        console.log(threadRecord)
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
        }
        if (currentIndex + 1 <= thread.length - 1) {
            setAudioFile("")
            setDisplayText('')
            setCurrentIndex(currentIndex + 1)

        } else {
            setSaveState('saving')
            const correctCount = threadRecord.filter(record => record.isCorrect).length;
            const score = (correctCount / threadRecord.length) * 100;
            const final_report = {
                score: score,
                correctCount: correctCount,
            }
            setReport(final_report)
            saveDictationRecord(userId, threadId, final_report.score, final_report, threadRecord)
                .then(() => setSaveState('saved'))
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
                <DictationReport threadRecord={threadRecord} />
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
                        {submitted ?
                            <Bravo score={threadRecord[currentIndex].score} />
                            :
                            <div>
                                <Button onClick={handleReplay} size='icon' variant='ghost' className="w-12 h-12">
                                    <Volume1Icon color="#42C83C" className="w-8 h-8"></Volume1Icon>
                                </Button>
                            </div>
                        }

                    </div>
                    <div className="w-full text-pretty text-ellipsis  flex flex-col justify-center items-center gap-2">
                        <div className={`flex flex-col gap-2 overflow-hidden ${submitted ? '' : 'blur'}`}>
                            <div className={`text-4xl font-bold p-2 ${currentRecord ? currentRecord?.isCorrect === true ? 'text-primary' : 'text-red-600' : ''}`}>
                                {thread[currentIndex].text}
                            </div>
                            {
                                currentRecord?.isCorrect === false &&
                                <div className="text-lg text-muted-foreground">
                                    <div className="inline text-sm">你的回答: </div> 
                                    <div className="inline font-bold">{currentRecord?.input}</div>
                                </div>
                            }
                            <div className="text-lg text-muted-foreground">
                                {thread[currentIndex].symbol}
                            </div>
                            <div className="text-lg text-muted-foreground">
                                {thread[currentIndex].meaning}
                            </div>
                        </div>
                    </div>

                </Card>
            </div>

            <div className='w-full flex flex-col-reverse gap-4 h-full p-8'>
                <div className='grid grid-cols-3 object-center gap-4 justify-items-center items-center'>
                    <div>

                    </div>
                    {submitted ?
                        <Button size="icon" className='rounded-full p-3 w-fit h-fit bg-[#42C83C] border-4 border-white ' onClick={() => nextPage()}>
                            <IconRightArrow className="w-8 h-8" />
                        </Button>
                        :
                        <div className='relative w-full flex flex-col gap-2 items-center'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="w-[300px] space-y-6">
                                <div className='flex flex-row gap-4 justify-between max-w-md'>
                                    <div className='relative w-full flex flex-row gap-2 items-center'>
                                        <FormField
                                            control={form.control}
                                            name="input"
                                            render={({ field }) => (
                                                <Input
                                                    className="flex-1 w-full text-xl text-center"
                                                    autoComplete="off"
                                                    {...field}
                                                />)}
                                        />
                                        <div className=''>
                                            <Button size='icon' type="submit"><SendIcon /></Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                    }
                </div>

                <div className=
                    {`
                 ${displayText == 'Repeat After Me...' ? 'animate-bounce text-3xl' : 'text-2xl'} 
                 ${displayText == 'Great!' ? 'text-4xl' : ''} 
                w-full text-center text-white`
                    } style={{ textShadow: '2px 2px 2px #333' }}>
                    {displayText}
                </div>
            </div>
        </div>

    )
}