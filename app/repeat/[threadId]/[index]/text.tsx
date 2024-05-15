'use client'
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card";
import { IconPause, IconPlay, IconRefLeft, IconRefRight, IconRight, IconRightArrow, IconRollback } from "@/components/ui/icons"
import { sttFromMic, sttFromMicWithAssess } from "@/lib/speech/asr";
import { EvalResult, evalSpeechFromFile } from "@/lib/speech/eval";
import { synthesizeSpeech } from "@/lib/speech/tts";
import { webm2Wav } from "@/lib/speech/wav";
import { AudioWaveformIcon, Mic, Recycle, Redo, Redo2, Redo2Icon, RedoDotIcon, RedoIcon, RefreshCcw, RefreshCwIcon, RefreshCwOffIcon, ReplyAllIcon, Volume1Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';
import TextWithHighlights from "./correct";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { Bravo } from "./bravo";

// function HighlightWords({ story }: { story: any }) {
//     return story.section.telling_word_timestamps.map((item: any, index: number) => <span key={index} className={story.audioPlayTime >= item.start && story.audioPlayTime < item.end ? "text-primary" : ''}>{item.word} </span>)
// }

export default function RepeatText({ text, index }: { text: any, index: number }) {

    const [audioFile, setAudioFile] = useState('')

    //Handle Playing Audio
    function handleAudioPlay(audioData: ArrayBuffer) {
        const audioBlob = new Blob([audioData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioFile(audioUrl)
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
                handleSpeechToText()
            }
        });
        sound.play();
    }
    const [recognitionText, setRecognitionText] = useState(''); // 存储语音识别的文本
    const [displayText, setDisplayText] = useState('');
    const [resultText, setResultText] = useState('')

    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [completed, setIsCompleted] = useState(false);
    const [isRecognizing, setIsRecognizing] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter()
    const [mistakeCount, setMistakeCount] = useState(0)
    const [pronResult, setPronResult] = useState(
        {
            accuray: 0,
            fluency: 0,
            completeness: 0,
            prosody: 0,
            sum: 0,
        });


    //Welcome Messgae TTS
    useEffect(() => {
        setDisplayText('Listen carefully...')
        synthesizeSpeech(text, audioData => {
            if (audioData) {
                handleAudioPlay(audioData)
            } else {
                console.error('Speech synthesis failed or returned no audio');
            }
        })
    }, []);

    //handle Play
    const handleReplay = async () => {
        setCorrect('')
        setDisplayText('Replaying...');
        setRecognitionText('')
        var sound = new Howl({
            src: [audioFile],
            format: ['wav'],
            autoplay: true,
            onload: function () {
                setLoading(true);
                setIsPlaying(true)
            },
            onend: function () {
                setDisplayText('Take a try!');
                setIsPlaying(false)
                setLoading(false);
                console.log('Playback finished');
            }
        });
        sound.play();
    }

    //Handle Correct
    const [correct, setCorrect] = useState('')
    async function handleCorrect(reference: string, result: string) {
        const res = await fetch('/api/correct',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reference: reference, result: result })
            })
        const data = await res.json()
        setCorrect(data.message)
    }


    //Handle Asr with Eval
    const handleSpeechToText = async () => {
        setCorrect('')
        setDisplayText('Repeat After Me...');
        setLoading(true)
        setRecognitionText('');
        setIsRecognizing(true)
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
            handleCorrect(text, asrText)
            setDisplayText('Reviewing...');
            setRecognitionText(asrText);
            mediaRecorder.stop();
            mediaRecorder.onstop = async () => {
                // 创建 Blob 保存音频文件
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                const wavBlob = await webm2Wav(audioBlob)
                // const audioUrl = URL.createObjectURL(wavBlob);
                // downloadWavFile(wavBlob, 'output.wav');
                const evalResult = await evalSpeechFromFile(text, wavBlob) as EvalResult;
                setPronResult({
                    accuray: evalResult.accuracy,
                    fluency: evalResult.fluency,
                    completeness: evalResult.completeness,
                    prosody: evalResult.prosody,
                    sum: evalResult.pronunciation
                })
                setDisplayText('');
                console.log(evalResult)
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
        router.push('./' + (index + 1))
    }

    return (
        <div className="flex flex-col items-center justify-between h-full">
            <div className="w-full relative text-3xl  mx-6 flex">
                <audio ref={audioRef} className="sr-only">
                </audio>

                <Card className="z-50 p-8 rounded-[36px] w-full sticky font-semibold text-center ">
                    <div className="flex justify-center pb-4">
                        {recognitionText.length > 0 && correct && !isRecognizing ?
                            <Bravo score={90} mistakeCount={mistakeCount} />
                            :
                            <div>
                                <Button onClick={handleReplay} size='icon' variant='ghost' className="w-12 h-12" disabled={isPlaying}>
                                    <Volume1Icon color="#42C83C" className="w-8 h-8"></Volume1Icon>
                                </Button>
                            </div>
                        }

                    </div>

                    {!recognitionText ?
                        <div>{text}</div>
                        :
                        !correct ? <div>{recognitionText}</div> :
                            <div className="text-[#19B700]">
                                <TextWithHighlights text={correct} setMistakeCount={setMistakeCount} />
                            </div>
                    }
                    <div className='flex justify-center text-xl text-black/50 mt-8'>
                        {index} / 6
                    </div>

                </Card>
            </div>

            <div className='w-full flex flex-col-reverse gap-8 h-full p-8'>
                <div className='grid grid-cols-3 object-center gap-4 justify-items-center items-center'>
                    <div></div>
                    <Button
                        type='button'
                        size={'icon'}
                        className={`h-fit p-6 bg-[#3F51B5] w-fit rounded-full border-8 border-white ${isRecognizing === true ? 'animate-bounce' : ''}`}
                        onClick={handleSpeechToText}
                        disabled={loading}
                    >   {
                            isRecognizing || isPlaying ?
                                <Mic width="60" height="60" />
                                :
                                <RefreshCwIcon width="60" height="60" />
                        }

                    </Button>
                    {recognitionText.length > 0 && !isRecognizing ?
                        <Button size="icon" className='rounded-full p-3 w-fit h-fit bg-[#00D422] border-4 border-white ' onClick={() => nextPage()}>
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