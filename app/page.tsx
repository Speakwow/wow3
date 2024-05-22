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
import CurrentLessonCard from "./current-lesson";



export default async function Home() {
    const { userId, orgId } = auth();
    // const current = await kv.hgetall('current@' + 'hailing')

    // // const recordList = await kv.smembers('record@' + userId)
    // let currentLesson;
    // let currentCharacter = await getCharacterById("66435c61fd8764b993a473f4")
    // let currentRecord = null;

    // if (!current || !current.id) {
    //     currentLesson == null
    // } else if (current.type == 'repeat') {
    //     currentLesson = await getRepeatThreadById(current.id as string)
    //     currentRecord = await getRepeatRecordByUserId(userId as string)
    // } else if (current.type == 'scenario') {
    //     currentLesson = await getScenarioById(current.id as string)
    //     currentRecord = await getScenarioRecordByUserId(userId as string)
    // } else if (current.type == 'word') {
    //     currentLesson = await getWordThreadById(current.id as string)
    //     currentRecord = await getWordRecordByUserId(userId as string)
    // }


    return (
        <div className="h-screen flex flex-col gap-12 lg:p-24 md:p-16 p-6 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
            <div className="text-center text-white w-full text-5xl">
                开口蛙 EnglishWOW
            </div>
            <CurrentLessonCard userId={userId as string}/>

        </div>
    )
}