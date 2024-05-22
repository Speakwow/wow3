import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { ArrowLeftIcon, RefreshCcwIcon } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCharacterById, getWordThreadById, getRepeatThreadById, getScenarioById, getScenarioRecordByUserId, getRepeatRecordByUserId, getWordRecordByUserId } from "@/lib/action/mongoIO";
import { Badge } from "@/components/ui/badge";
import RefreshButton from "./current-lesson";



export default async function Home() {
    const { userId, orgId } = auth();
    const current = await kv.hgetall('current@' + 'hailing')

    // const recordList = await kv.smembers('record@' + userId)
    let currentLesson;
    let currentCharacter = await getCharacterById("66435c61fd8764b993a473f4")
    let currentRecord = null;

    if (!current || !current.id) {
        currentLesson == null
    } else if (current.type == 'repeat') {
        currentLesson = await getRepeatThreadById(current.id as string)
        currentRecord = await getRepeatRecordByUserId(userId as string)
    } else if (current.type == 'scenario') {
        currentLesson = await getScenarioById(current.id as string)
        currentRecord = await getScenarioRecordByUserId(userId as string)
    } else if (current.type == 'word') {
        currentLesson = await getWordThreadById(current.id as string)
        currentRecord = await getWordRecordByUserId(userId as string)
    }


    return (
        <div className="h-screen flex flex-col gap-12 lg:p-24 md:p-16 p-6 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
            <div className="text-center text-white w-full text-5xl">
                开口蛙 EnglishWOW
            </div>
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
                                                {current?.type == 'repeat' ? <p>跟读练习</p> : 'scenario' ? <p>情景对话</p> : <div></div>}
                                            </Badge>
                                            <div className="text-3xl p-4">
                                                {currentLesson?.name}
                                            </div>
                                            <div className="flex justify-center p-4">
                                                <Avatar className="w-[150px] h-[150px]">
                                                    <AvatarImage src={currentCharacter?.avatar} alt={currentCharacter?.name} />
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
                                                {current?.type == 'repeat' ? <p>跟读练习</p> : 'scenario' ? <p>情景对话</p> : 'talkabout' ? <p>看图说话</p> : <p></p>}
                                            </Badge>
                                            <div className="text-3xl p-4">
                                                {currentLesson?.name}
                                            </div>
                                            <div className="flex justify-center p-4">
                                                <Avatar className="w-[150px] h-[150px]">
                                                    <AvatarImage src={currentCharacter?.avatar} alt={currentCharacter?.name} />
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

            </div>

        </div>
    )
}