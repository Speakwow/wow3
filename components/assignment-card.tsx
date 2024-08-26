'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { addFavourite, deleteFavourite } from "@/lib/action/mongoIO";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HeartIcon, MoreHorizontalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useRouter } from "next/navigation"
import { Separator } from "./ui/separator";
import { getBeijingTime, hoursUntil, Score2Grade } from "@/lib/tools";
import { isAfter, isBefore } from "date-fns";





export function AssignCard({ userId, startAt, endAt, name, type, id, intro, cover, tag, record }:
    { userId: string, startAt: Date, endAt: Date, name: string, type: string, id: string, intro: string, cover: string, tag: string, record: any }) {
    let coverImg = ''
    if (!cover) {
        coverImg = 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar'
    } else {
        coverImg = cover
    }


    const router = useRouter()
    let hoursleft = hoursUntil(endAt)
    if (hoursleft < 0) {
        hoursleft = 0
    } else {
        hoursleft = +hoursleft.toFixed(0)
    }

    function toBeijingTime(date: Date): string {
        return date.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // 使用 24 小时制
        }).replace(/\//g, '-'); // 将日期中的 '/' 替换为 '-'
    }

    const today = getBeijingTime()
    let active = true
    if(isAfter(today, endAt)||isBefore(today,startAt)){
        active = false
    }

    return (
        <div className="relative w-full h-fit">
            {/* <DropdownMenu>
                <DropdownMenuTrigger className="absolute right-1 top-1 hover:bg-muted active:bg-muted focus:bg-black/25 h-6 w-6 p-1 rounded-full z-10" >
                    <MoreHorizontalIcon className="w-4 h-4" color="gray" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {record ?
                        <DropdownMenuItem onClick={()=>router.push(`record/${record._id}/${type}`)}>
                            查看详情
                        </DropdownMenuItem>
                        :
                        <DropdownMenuItem disabled={true}>
                            暂无成绩
                        </DropdownMenuItem>
                    }
                </DropdownMenuContent>
            </DropdownMenu> */}
            <Link href={active?`/${type}/${id}`:'#'}>
                <Card className={`relative flex flex-col bg-white rounded-[10px] border hover:ring focus:outline-none focus:ring p-2 gap-2  ${active?"focus:ring-[#42C83C] hover:ring-[#42C83C]":"hover:ring-gray-200 focus:ring-gray-200"}`}>
                    <div className="flex flex-row gap-3">
                        <div className="h-full w-[100px]">
                            <Image
                                alt='SC'
                                width={200}
                                height={50}
                                objectFit="cover"
                                className="rounded-[10px]"
                                src={coverImg} />
                        </div>

                        <div className="text-pretty truncate w-full col-span-2 flex flex-col gap-1">
                            <div className="font-semibold text-sm">
                                {name}
                            </div>
                            <Badge className="text-xxs w-fit" variant="outline">
                                {tag}
                            </Badge>
                            <div className="line-clamp-2 text-xs text-pretty truncate">
                                {intro}
                            </div>


                        </div>
                    </div>
                    <Separator />
                    <div className="flex flex-col w-full ">
                        
                        <div className="flex flex-row items-center justify-between p-2">
                            <div className="text-sm text-muted-foreground">
                                成绩
                            </div>
                            {
                                record ?
                                    <Badge className="text-sm px-4 font-bold">
                                        {Score2Grade(record.score)}
                                    </Badge>
                                    :
                                    <Badge className="text-sm px-4 font-bold" variant="secondary">
                                        未完成
                                    </Badge>
                            }
                        </div>
                        <div className="flex flex-row items-center justify-between p-2">
                            <div className="text-sm text-muted-foreground">
                                截止时间
                            </div>


                            <Badge className="text-sm px-4 font-bold" variant="secondary">
                                {toBeijingTime(endAt)}
                            </Badge>

                        </div>
                    </div>
                </Card>
            </Link>
        </div>

    )

}