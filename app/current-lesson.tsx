'use client'
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { RefreshCcwIcon } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCharacterById, getAnyRecord, getAnyLesson } from "@/lib/action/mongoIO";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";




export default function CurrentLessonCard({ userId }: { userId: string }) {

    const router = useRouter()

    const [current, setCurrent] = useState<any>(null)
    const [currentLesson, setCurrentLesson] = useState<any>(null)
    const [currentRecord, setCurrentRecord] = useState<any>(null)
    const [character, setCharacter] = useState<any>(null)
    const fetchData = async () => {
        const res = await fetch('/api/getCurrent')
        const data = await res.json()
        if (data.id && data.type) { 
            setCurrent({ id: data.id, type: data.type })
            getAnyLesson(data.id, data.type).then(result => {
                setCurrentLesson(result)
            })
            getAnyRecord(userId, data.id, data.type).then(result => setCurrentRecord(result))
        }
        else {
            setCurrentLesson(null)
            setCurrentRecord(null)
            setCurrent(null)
        }
    }

    useEffect(() => {
        // const recordList = await kv.smembers('record@' + userId)
        getCharacterById("6650346b4b838ac30d19694c").then(result => {
            setCharacter(result)
        })
    }, [])

    useEffect(() => {
        fetchData()
        const intervalId = setInterval(fetchData, 10000); // 每10秒调用一次fetchData
        // 清除定时器
        return () => clearInterval(intervalId);
    }, [])


    return (
        <div className="flex justify-center flex-col items-center gap-6">
            {!current ?
                <div>当前无进行中课程</div> :
                currentRecord && currentRecord.isFinished ?
                    <Card className="border-[#42C83C] border-2 rounded-[40px] max-w-96">
                        <CardHeader>
                            <div className="flex  gap-2">
                                <div className="flex flex-col justify-center text-center gap-2">
                                    <CardTitle className="gap-2">
                                        <Badge className="text-md rounded-full px-8 py-2 bg-[#42C83C]">
                                            {current?.type == 'repeat' && <p>跟读练习</p>}
                                            {current?.type == 'scenario' && <p>情景对话</p>}
                                            {current?.type == 'talkabout' && <p>看图说话</p>}
                                            {current?.type == 'word' && <p> 词汇练习</p>}
                                        </Badge>
                                        <div className="text-3xl p-4">
                                            {currentLesson?.name}
                                        </div>
                                        <div className="flex justify-center p-4">
                                            <Avatar className="w-[150px] h-[150px]">
                                                <AvatarImage src={character?.avatar} alt={character?.name} />
                                            </Avatar>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        {currentLesson?.intro}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex p-6 flex-col border-t justify-center  gap-4">
                            {/* <Link href={`/${current.type}/${current.id}`}> */}
                            <Badge className="rounded-full text-3xl bg-[#42C83C] px-8">
                                {currentRecord.score}
                            </Badge>
                            <div className="text-sm text-[#42C83C]">
                                练习成绩
                            </div>
                            {/* </Link> */}
                        </CardFooter>
                    </Card>
                    :
                    <Card className="border-[#42C83C] border-2 rounded-[40px] max-w-96">
                        <CardHeader>
                            <div className="flex  gap-2">
                                <div className="flex flex-col justify-center text-center gap-2">
                                    <CardTitle className="gap-2">
                                        <Badge className="text-md rounded-full px-8 py-2 bg-[#42C83C]">
                                            {current?.type == 'repeat' && <p>跟读练习</p>}
                                            {current?.type == 'scenario' && <p>情景对话</p>}
                                            {current?.type == 'talkabout' && <p>看图说话</p>}
                                            {current?.type == 'word' && <p> 词汇练习</p>}
                                        </Badge>
                                        <div className="text-3xl p-4">
                                            {currentLesson?.name}
                                        </div>
                                        <div className="flex justify-center p-4">
                                            <Avatar className="w-[150px] h-[150px]">
                                                <AvatarImage src={character?.avatar} alt={character?.name} />
                                            </Avatar>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        {currentLesson?.intro}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex p-6  border-t justify-center">
                            <Button size="lg" className="rounded-full" onClick={() => router.push(`/${current.type}/${current.id}`)}>
                                开始学习
                            </Button>
                        </CardFooter>
                    </Card>
            }
            {current && currentRecord && currentRecord.isFinished &&
                <div className="text-white/50">
                    课程已完成，等待下一节课吧～
                </div>
            }
            <Button size="icon" variant="secondary" onClick={fetchData}>
                <RefreshCcwIcon />
            </Button>
        </div>
    )

}