"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { saveListeningRecord, saveTranslationRecord, saveWriteRecord, updateScenario } from "@/lib/action/mongoIO"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { synthesizeSpeech } from "@/lib/speech/tts";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk"
import AzureConfig from "@/lib/speech/config";
import { useRouter } from "next/navigation"
import { Howl } from 'howler';
import { useEffect, useMemo, useState } from "react"
import { genListeningFeedback, genTranslationFeedback, genWriteFeedback, improveWriting } from "@/lib/action/gen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { countWords, Score2Grade } from "@/lib/tools"
import { TextWithHighlights } from "./correction"
import { Loader2Icon, PauseIcon, PlayIcon } from "lucide-react"
import { StopIcon } from "@radix-ui/react-icons"
import { Separator } from "@/components/ui/separator"




interface ListeningProps {
    _id: string,
    name: string,
    text: string,
    audio_url: string,
    questions: string[]
}


export function ListeningForm({ userId, listening }: { userId: string, listening: ListeningProps }) {
    const formSchema = z.object(
        Object.fromEntries(listening.questions.map((_, index) => [index.toString(), z.string().min(1, {
            message: "至少输入 1 个字符",
        })]))
    ).strict();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: Object.fromEntries(listening.questions.map((_, index) => [index.toString(), '']))
    })
    const router = useRouter()
    const [saveState, setSaveState] = useState('unsaved')
    const [result, setResult] = useState<boolean[]>([])
    const [report, setReport] = useState<any>()
    const [displayText, setDisplayText] = useState('')
    const [audioFile, setAudioFile] = useState('')
    const [isPlaying, setIsPlaying] = useState(false)
    const [sound, setSound] = useState<Howl>()
    const [playCountLeft, setPlayCountLeft] = useState(2)


    const handlePlay = () => {
        if (playCountLeft <= 0) {
            return
        }
        setPlayCountLeft(playCountLeft - 1)
        if (audioFile) {
            // 如果 audioFile 存在，直接播放
            console.log('Find Existing Audio, play now..')
            const existingSound = new Howl({
                src: [audioFile],
                format: ['wav'],
                autoplay: false,
                onload: function () {
                    setIsPlaying(true);
                },
                onend: function () {
                    setDisplayText('Press the button and Repeat');
                    setIsPlaying(false);
                    console.log('Playback finished');
                }
            });
            existingSound.play();
        } else {
            setIsPlaying(true)
            console.log('No Audio, synthesize now..')
            // 如果 audioFile 不存在，使用 TTS 合成
            setDisplayText('Listen carefully...');
            synthesizeSpeech(listening.text, audioData => {
                if (audioData) {
                    const audioBlob = new Blob([audioData], { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    setAudioFile(audioUrl);
                    var newSound = new Howl({
                        src: [audioUrl],
                        format: ['wav'],
                        autoplay: true,
                        onload: function () {
                            setIsPlaying(true);
                        },
                        onend: function () {
                            setDisplayText('Press the button and Repeat');
                            setIsPlaying(false);
                            console.log('Playback finished');
                        }
                    });
                    setSound(newSound);
                    newSound.play();
                } else {
                    console.error('Speech synthesis failed or returned no audio');
                }
            });
        }
    };






    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSaveState('saving')
        console.log(values)
        const result = await genListeningFeedback(listening.text, listening.questions, Object.values(values))
        if (!result) {
            setSaveState('error')
            return
        }
        setResult(result)
        const score = (result.filter(item => item).length / result.length) * 100
        setReport({ score, result })
        saveListeningRecord(userId, listening._id, score, Object.values(values), result).then(res => setSaveState('saved'))
        console.log('submit success')
    }


    if (saveState === 'saved') {
        return (
            <div className="flex flex-col gap-4 justify-center items-center">
                <Card className="w-full flex flex-row gap-2 p-6 items-center gap-8">
                    <div className="flex flex-col gap-4">
                        {listening.questions.map((item, index) => (
                            <div key={index} className={`flex flex-col p-4 `}>
                                <span>{`Q${index + 1} : ${item}`}</span>
                                <div className="flex flex-row gap-4 items-baseline">
                                    <span className="text-muted-foreground text-sm">你的回答: </span>
                                    <span className={`text-md font-medium ${result[index] ? 'text-green-200' : 'text-red-500'}`}>{Object.values(form.getValues())[index]}</span>
                                    <span>{result[index] ? '✅' : '❌'}</span></div>
                                
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="flex flow-row justify-center gap-4">
                    <Button size="lg" onClick={() => router.push('/')}>
                        完成练习
                    </Button>
                    {/* <Button onClick={() => router.push(`/scenario/`)}>
                        
                    </Button> */}
                </div>
            </div>
        )
    } else if (saveState === 'saving') {
        return (
            <div className="text-center py-24 text-xl text-primary font-black">
                <div className="animate-pulse">
                    🤖 AI评分中...
                </div>
                <div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
                <Button
                    type="button"
                    variant={isPlaying ? 'secondary' : playCountLeft <= 0 ? 'secondary' : 'default'}
                    onClick={playCountLeft > 0 && !isPlaying ? handlePlay : undefined}
                    className={playCountLeft <= 0 ? 'opacity-50 cursor-not-allowed' : isPlaying ? 'cursor-not-allowed opacity-50' : ''}
                    disabled={playCountLeft <= 0}
                >
                    {isPlaying ? (
                        <span className="animate-spin"><Loader2Icon /></span>
                    ) : (
                        playCountLeft > 0 ? <PlayIcon fill="white" /> : <PauseIcon fill="" />
                    )}
                </Button>
                <div className="text-xs text-muted-foreground/25 font-medium">
                    {`剩余播放次数 : ${playCountLeft}`}
                </div>
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
                        {listening.questions.map((item, index) => (
                            <div className="col-span-2 flex flex-col gap-4" key={index}>
                                <FormField
                                    control={form.control}
                                    name={`${index}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="">{`Q${index + 1} : ${item}`}</FormLabel>
                                            <FormControl>
                                                <Textarea className=" border-primary " placeholder="请输入..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                    <Button type="submit">提交</Button>
                </form>
            </Form>
        </div>
    )
}
