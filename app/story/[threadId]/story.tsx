'use client'
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card";
import { IconPause, IconPlay,IconRightArrow,  } from "@/components/ui/icons"
import { sttFromMic, sttFromMicWithAssess } from "@/lib/speech/asr";
import { EvalResult, evalSpeechFromFile } from "@/lib/speech/eval";
import { synthesizeSpeech, synthesizeSpeechWithVoice } from "@/lib/speech/tts";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from 'react';
import { Howl, Howler } from 'howler';

// function HighlightWords({ story }: { story: any }) {
//     return story.section.telling_word_timestamps.map((item: any, index: number) => <span key={index} className={story.audioPlayTime >= item.start && story.audioPlayTime < item.end ? "text-primary" : ''}>{item.word} </span>)
// }

export default function Story({ story ,character}: { story: any,character:any }) {
    
    const [audioFile, setAudioFile] = useState('')
    const [index,setIndex] = useState(1)
    const [text,setText] = useState('')
    const [imageUrl,setImageUrl] = useState('')

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

            },
            onend: function () {
                console.log('Playback finished');
                setIsCompleted(true);
            }
        });
    }
    const [isCompleted, setIsCompleted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const router = useRouter()


    //Welcome Messgae TTS
    useEffect(() => {
        synthesizeSpeechWithVoice(text,character.voice_id, audioData => {
            if (audioData) {
                handleAudioPlay(audioData)
            } else {
                console.error('Speech synthesis failed or returned no audio');
            }
        })
    }, []);


    //Welcome Messgae TTS
    useEffect(() => {
        synthesizeSpeechWithVoice(text,character.voice_id, audioData => {
            if (audioData) {
                handleAudioPlay(audioData)
            } else {
                console.error('Speech synthesis failed or returned no audio');
            }
        })
    }, [index]);

    //Welcome Messgae TTS
    useEffect(() => {
        synthesizeSpeechWithVoice(text,character.voice_id, audioData => {
            if (audioData) {
                handleAudioPlay(audioData)
            } else {
                console.error('Speech synthesis failed or returned no audio');
            }
        })
    }, [index]);

    

    const nextPage = () => {
        var sound = new Howl({
            src: ['/sound/button.mp3'],
            format: ['mp3'],
            autoplay: true,
        });
        sound.play();
        setIndex(index+1)
    }

    const lastPage = () => {
        var sound = new Howl({
            src: ['/sound/button.mp3'],
            format: ['mp3'],
            autoplay: true,
        });
        sound.play();
        setIndex(index-1)
    }

    return (
        <div className="flex flex-col items-center justify-between h-full">
            <div className="w-full relative text-3xl  mx-6 flex">
                <audio ref={audioRef} className="sr-only">
                </audio>

                <Card className="z-50 p-4 rounded-[36px] w-full sticky font-semibold text-center">
                    <div className="flex justify-center pb-4">

                    </div>
                    <div className="leading-8 text-primary text-2xl text-left indent-8">{text}</div>
                    <div className='flex justify-center text-base text-black/50 mt-4'>
                        {index} / 13
                    </div>

                </Card>
            </div>
            <div className="py-20">
            <Button 
            size="icon" 
            className={`rounded-full p-6 w-fit h-fit bg-[#00D422] border-4 border-white ${!isCompleted?'animated-pulse':null}`}
            onClick={() => nextPage()}
            disabled={!isCompleted}>
                <IconRightArrow className="w-12 h-12" />
            </Button>
            </div>
        </div>

    )
}