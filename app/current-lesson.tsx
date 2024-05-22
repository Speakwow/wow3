'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { ArrowLeftIcon, RefreshCcwIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getTalkaboutById,getTalkaboutRecordByUserId,getCharacterById, getWordThreadById, getRepeatThreadById, getScenarioById, getScenarioRecordByUserId, getRepeatRecordByUserId, getWordRecordByUserId } from "@/lib/action/mongoIO-client";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getCurrentLesson } from "@/lib/action/learn";


export default function CurrentLessonCard({userId}:{userId:string}) {

    const router = useRouter()

    const [current, setCurrent] = useState<any>(null)
    const [currentLesson, setCurrentLesson] = useState<any>(null)
    const [currentRecord, setCurrentRecord] = useState<any>(null)
    const [character, setCharacter] = useState<any>(null)
    const fetchData = async () => {
        const res = await fetch('/api/getCurrent')
        const data = await res.json()
        console.log(data)
        setCurrent({id:data.id,type:data.type})

    }


    useEffect(() => {
        // const recordList = await kv.smembers('record@' + userId)
        getCharacterById("66435c61fd8764b993a473f4").then(result => {
            setCharacter(result)
        })
        fetchData()
    }, [])

    useEffect(() => {

        if (!current || !current.id) {
            setCurrentLesson == null
            setCurrentRecord == null
        } else if (current.type == 'repeat') {
            getRepeatThreadById(current.id as string).then(lesson =>{
                setCurrentLesson(lesson)
                getRepeatRecordByUserId(userId as string).then(result=>{
                    setCurrentRecord(result)
                })
            })
        } else if (current.type == 'scenario') {
            getScenarioById(current.id as string).then(lesson=>{
                setCurrentLesson(lesson)
                getRepeatRecordByUserId(userId).then(result=>{
                    setCurrentRecord(result)
                })
            })
        } else if (current.type == 'word') {
            getWordThreadById(current.id as string).then(lesson=>{
                setCurrentLesson(lesson)
                getWordRecordByUserId(userId as string).then(result=>{
                    setCurrentRecord(result)
                })
            })
        }
        else if (current.type == 'talkabout') {
            getTalkaboutById(current.id as string).then(lesson=>{
                setCurrentLesson(lesson)
                getTalkaboutRecordByUserId(userId as string).then(result=>{
                    setCurrentRecord(result)
                })
            })
        }
    }, [current])


    return (
        <div className="flex justify-center flex-col items-center gap-6">
            {!current ?
                <div>当前无进行中课程</div> :
                currentRecord && currentRecord.isFinished ?
                    <Card className="border-[#42C83C] border-2 rounded-[40px] w-[150px]">
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
                        <CardFooter className="flex p-6 flex-col border-t justify-center">
                            {/* <Link href={`/${current.type}/${current.id}`}> */}
                            <Badge className="rounded-full text-3xl">
                                {currentRecord.score}
                            </Badge>
                            <div>
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
                            <Link href={`/${current.type}/${current.id}`}>
                                <Button size="lg" className="rounded-full">
                                    开始学习
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>


            }
            <Button size="icon" variant="secondary" onClick={fetchData}>
                <RefreshCcwIcon />
            </Button>
        </div>

    )

}