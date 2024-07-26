'use client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IconRightArrow } from "@/components/ui/icons"
import { evalSpeechFromFile, evalSpeechWithTopicFromFile } from "@/lib/speech/eval";
import { webm2Wav } from "@/lib/speech/wav";
import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { Badge } from "@/components/ui/badge";
import { finishTalkaboutRecord } from "@/lib/action/mongoIO-client";
import Image from 'next/image'

// function HighlightWords({ story }: { story: any }) {
//     return story.section.telling_word_timestamps.map((item: any, index: number) => <span key={index} className={story.audioPlayTime >= item.start && story.audioPlayTime < item.end ? "text-primary" : ''}>{item.word} </span>)
// }

export default function Talkabout({ image_url, recordId, prepare_time, answer_time, instruction,topic }: { image_url: any, recordId: string, prepare_time: number, answer_time: number, instruction: string ,topic:string}) {

    const [recognitionText, setRecognitionText] = useState(''); // 存储语音识别的文本
    const [displayText, setDisplayText] = useState('');
    const [isRecognizing, setIsRecognizing] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
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
            startSpeechToText();
            setStep('practice')
        }
        else if (countdown === 0 && isRecording && step == 'practice') {
            stopSpeechToText();
            setStep('end')
        }

        return () => clearInterval(countdownInterval);
    }, [countdown, isRecording]);


    async function handleSkipPrepare(){
        setCountdown(answer_time);
        startSpeechToText();
        setStep('practice')
    }

    const [finishFeedback, setFinishFeedback] = useState(false)
    //Handle Correct
    const [feedback, setFeedback] = useState('')
    const [themeScore, setThemeScore] = useState(0)
    const [vocabScore, setVocabScore] = useState(0)
    const [grammarScore, setGrammarScore] = useState(0)
    const [contentScore, setContentScore] = useState(0)
    async function handleFeedback(image_url: string, user_answer: string,pronResult:any) {
        const res = await fetch('/api/talkabout/feedback',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image_url: image_url, user_answer: user_answer })
            })
        const feedbackData = await res.json()

        // console.log(data.message)
        setThemeScore(feedbackData.theme_relevance_score)
        setVocabScore(feedbackData.vocabulary_score)
        setGrammarScore(feedbackData.grammarza_syntax_score)
        setFeedback(feedbackData.feedback)
        setContentScore(feedbackData.score)
        setFinishFeedback(true)
        setIsSaving(true)
        const finalScore = feedbackData.score * 0.6 + pronResult.accuracy*0.28+ pronResult.fluency*0.12
        finishTalkaboutRecord(recordId, +finalScore.toFixed(0), {
            user_answer:pronResult.text,
            themeScore: feedbackData.theme_relevance_score,
            vocabScore: feedbackData.vocabulary_score,
            grammarScore: feedbackData.grammarza_syntax_score,
            feedback: feedbackData.feedback,
            overallContentScore: feedbackData.score,
            overallPronScore: pronResult.accuracy *0.7 + pronResult.fluency*0.3,
            accuracy: pronResult.accuracy,
            fluency: pronResult.fluency
        }).then(()=>setIsSaving(false)).finally(()=>setIsSaving(false))
    }


    useEffect(() => {
        if (typeof window !== 'undefined' && navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
                        audioChunksRef.current.push(event.data);
                    };
                    mediaRecorderRef.current.onstop = () => {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        stream.getTracks().forEach(track => track.stop());
                        webm2Wav(audioBlob).then(wavBlob => {
                            evalSpeechWithTopicFromFile(instruction, wavBlob).then(evalResult => {
                                setPronResult(evalResult as any)
                                //@ts-ignore
                                handleFeedback(image_url, evalResult.text, evalResult)
                                console.log(evalResult)
                            })
                        }
                        )
                        audioChunksRef.current = [];
                    };
                })
                .catch(error => {
                    console.error('Error accessing media devices.', error);
                });
        }
    }, []);


    //Handle Asr with Eval
    const startSpeechToText = async () => {
        var sound = new Howl({
            src: ['/sound/asr-on.wav'],
            format: ['wav'],
            autoplay: true,
        });
        sound.play();
        setDisplayText('正在练习中')
        setIsRecording(true);
        mediaRecorderRef.current?.start();
    }
    //Handle Asr with Eval
    const stopSpeechToText = async () => {
        var sound = new Howl({
            src: ['/sound/asr-off.wav'],
            format: ['wav'],
            autoplay: true,
        });
        sound.play();
        setIsRecording(false);
        setStep('end')
        mediaRecorderRef.current?.stop();
    }

    const [isSaving, setIsSaving] = useState(false)
    const finishLesson = async () => {

        router.push('/')
    }



    return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Card className={`p-2 text-center flex flex-row justify-center  items-center  gap-4 rounded-[36px] w-[250px] whitespace-pre-line ${step == "end" && 'text-white bg-[#42C83C]'} ${step == "practice" && 'border-2 border-[#42C83C]'}`}>
                {step == "prepare" && <p>准备时间剩余 ： <span className="text-3xl  text-[#42C83C]">{Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</span></p>}
                {step == "practice" && <p>作答时间剩余 ： <span className="text-3xl  text-[#42C83C]">{Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</span></p>}
                {step == "end" && <p className="text-xl">🎉 练习已完成</p>}
                {step == "prepare" && <Button variant="secondary" size="sm" onClick={handleSkipPrepare}>跳过</Button>}
            </Card>
            <div className="w-full relative text-3xl  mx-6 flex justify-center items-center">
                <audio ref={audioRef} className="sr-only">
                </audio>

                <div className="z-50 rounded-[36px]  sticky font-semibold text-center bg-white/75">
                    <Image
                        src={image_url} // 外部图片 URL
                        alt="Reference Image"
                        width={800}
                        height={400}
                        style={{
                            objectFit: 'contain', // cover, contain, none
                        }}

                        className={`rounded-[36px] border-4 border-white ${step == 'end' ? "h-[400px]" : "h-[400px]"}`}
                    />
                </div>
            </div>

            {
                step == 'prepare'||step=='practice' &&
                <div className="flex flex-col gap-4 justify-center items-center">
                    <Card className="rounded-[36px] w-[800px] whitespace-pre-line">
                        <CardHeader className="p-4">
                            <CardTitle className="text-center text-xl text-[#42C83C]">
                                思路提示
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            {instruction}
                        </CardContent>
                        <CardFooter className="flex justify-center text-xs items-center">
                            <div className="text-center text-black/50">
                                做好笔记哟～
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            }
            {
                step == 'end' &&
                <div className="flex flex-col gap-4 justify-center items-center">
                    <Card className="rounded-[36px] w-[800px] whitespace-pre-line">
                        <CardHeader className="p-4">
                            <CardTitle className="text-center text-xl text-[#42C83C]">
                                你的回答
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            {pronResult&&pronResult.text}
                        </CardContent>
                    </Card>
                </div>
            }
            {step == 'practice' &&
                <div className='w-full flex flex-col gap-8 h-full p-8'>
                    <div className='grid grid-cols-3 object-center gap-4 justify-items-center items-center'>
                        <div></div>
                        {
                            !isRecording ?
                                <Button
                                    type='button'
                                    size={'icon'}
                                    className={`h-fit p-6 bg-[#3F51B5] w-fit rounded-full border-8 border-white}`}
                                    onClick={startSpeechToText}
                                    disabled={isRecording}
                                >
                                    <Mic width="60" height="60" />

                                </Button>
                                :
                                <Button
                                    type='button'
                                    size={'icon'}
                                    variant="destructive"
                                    className={`h-fit p-6 w-fit rounded-full border-8 border-white ${isRecording === true ? 'animate-bounce' : ''}`}
                                    onClick={stopSpeechToText}
                                    disabled={isRecording}
                                >
                                    <Mic width="60" height="60" />
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
                        {`
                 ${displayText == 'Repeat After Me...' ? 'animate-bounce text-3xl' : 'text-2xl'} 
                 ${displayText == 'Great!' ? 'text-4xl' : ''} 
                w-full text-center text-white`
                        } style={{ textShadow: '2px 2px 2px #333' }}>
                        {displayText}
                    </div>
                </div>
            }
            {step == 'end' &&
                <div className="flex flex-col gap-4 justify-center items-center">
                    <Card className="rounded-[36px] w-[800px] whitespace-pre-line">
                        <CardHeader className="p-4">

                        </CardHeader>
                        {!finishFeedback ?
                            <CardContent className="animate-pulse text-center grid grid-cols-3 gap-4 text-primary">
                                🐸 Frank 正在写评语...
                            </CardContent>
                            :
                            <CardContent className="text-center grid grid-cols-4 gap-4">
                                <div className="col-span-4">
                                    <Badge className="rounded-full px-6  border-[#42C83C]" variant="outline">
                                        总分：<span className="text-[#42C83C] text-3xl">{(contentScore * 0.6 + pronResult.accuracy*0.2 + pronResult.fluency*0.2).toFixed(0)}</span>
                                    </Badge>
                                </div>
                                <div className="col-span-4 px-6 text-xl text-[#42C83C] mb-4">
                                    {feedback}
                                </div>
                                <div>
                                    内容相关度：<span className="text-[#42C83C] text-3xl">{contentScore}</span>
                                </div>
                                <div>
                                    语言丰富度：<span className="text-[#42C83C] text-3xl">{grammarScore*0.5+vocabScore*0.5}</span>
                                </div>
                                <div>
                                    发音准确度：<span className="text-[#42C83C] text-3xl">{pronResult?.accuracy}</span>
                                </div>
                                <div>
                                    表达流利度：<span className="text-[#42C83C] text-3xl">{pronResult?.fluency}</span>
                                </div>
                            </CardContent>
                        }
                        <CardFooter className="flex justify-center text-xs items-center border-t p-6">
                            <Button className="text-xl rounded-full w-1/2 py-6 bg-[#42C83C] text-white" onClick={finishLesson} disabled={isSaving}>
                                完成练习
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

            }
        </div>

    )
}