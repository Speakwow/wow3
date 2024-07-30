import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth,  currentUser } from "@clerk/nextjs/server";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

import { Input } from "@/components/ui/input";
import { getAllLessons } from "@/lib/action/mongoIO";
import { getAllLessonsByLessonId } from "@/lib/action/mongoIO-client";
import { Badge } from "@/components/ui/badge";
import SideBar from "@/components/side-bar";
import { Container } from "lucide-react";




const types = [
    {
        'type': 'scenario',
        'name': '情景对话',
        'intro': '指定情景话题下的实时对话，AI引导学生探讨相关话题。',
        'banner': 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/1d0c20b7-ac42-4961-b476-b1f769d5cd00/avatar'
    }
    ,
    {
        'type': 'vocab',
        'name': '词句练习',
        'intro': '与 AI 一同复习目标词汇与句型',
        'banner': 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/4592e163-cf97-4cf4-5c41-9a55dedf5100/avatar'
    }
    ,
    {
        'type': 'repeat',
        'name': '跟读练习',
        'intro': '一起读一读单词和句子吧',
        'banner': 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/249ec15a-b7ea-4292-8236-e675a3596300/avatar'
    }
    ,
    {
        'type': 'story',
        'name': '文字冒险',
        'intro': '与 AI 展开一场生动有趣的文字冒险故事',
        'banner': 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/060a7a04-6c6a-4de6-408c-dffee9638b00/avatar'
    }
    ,
    {
        'type': 'write',
        'name': '写作练习',
        'intro': '与 AI 一同提高你的写作技巧，通过有趣的写作任务和及时反馈来增强你的表达能力。',
        'banner': 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/060a7a04-6c6a-4de6-408c-dffee9638b00/avatar'
    }
    ,
    {
        'type': 'talkabout',
        'name': '看图说话',
        'intro': '创建一个看图说话练习',
        'banner': 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/060a7a04-6c6a-4de6-408c-dffee9638b00/avatar'
    }
];

export default async function CreateBoard() {
    return (
        <div className="h-screen flex flex-col gap-4 lg:p-8 md:p-6 p-6 bg-muted">
            <div className="flex flex-col p-8 text-center">
                <div className=" w-full text-3xl font-bold text-primary">
                    你想要如何设计今日的教学活动？
                </div>
               
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    //@ts-ignore
                    types.map(type => {
                        const key = Object.keys(type)[0];; // 获取对象的键
                        return (
                            <Link href={`./create/${type.type}`} key={key}>
                                <VocabularyCard title={type.name} intro={type.intro} cover={type.banner} />
                            </Link>
                        )
                    })
                }
            </div>
        </div>
    )
}

const VocabularyCard = ({ title, intro, cover }: { title: string, intro: string, cover: string }) => {
    return (
        <Card className="overflow-hidden relative flex flex-col p-0 bg-white rounded-[10px] border hover:ring hover:ring-[#42C83C] focus:outline-none focus:ring focus:ring-[#42C83C]">
            <div className="relative w-full h-26 flex overflow-hidden items-center">
                <img
                    alt='SC'
                    className="object-cover object-center"
                    src={cover} />
            </div>
            <div className=" text-pretty truncate w-full col-span-2 p-3 flex flex-col gap-2">
                <div className="font-semibold text-sm">
                    {title}
                </div>
                <div className="line-clamp-2 w-full text-xs text-pretty truncate">
                    {intro}
                </div>
            </div>
        </Card>
    );
};