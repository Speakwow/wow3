'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { delFromUserLessonList, getMyLessons, getUserData } from "@/lib/action/mongoIO"
import { MenuIcon, MenuSquareIcon, MoreHorizontalIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react";


export function MyLessons ({lessonList,userId}:{lessonList:any[],userId:string}){
    const [listData,setListData] = useState(lessonList)
    console.log(listData)

    function deleteLessonFromList(userId:string,lessonId:string){
        delFromUserLessonList(userId,lessonId)
        .then(res=>setListData(prevList => prevList.filter(lesson => lesson._id !== lessonId)))
    }

    return (
        <div>
            <div className="text-muted-foreground text-xs font-medium py-2 px-2">
                最近使用
            </div>
            <div>
                {listData.map((item: any) =>
                    <Button asChild className="w-full py-2" variant="ghost" key={item.name}>
                        <div className="flex flex-row justify-between">
                            <Link href={`/${item.type}/${item._id}`}>
                                <div className="flex flex-row flex-1 items-left gap-2">
                                    {/* <Image
                                 className="rounded-full"
                                 alt='Frank'
                                 width={30}
                                 height={30}
                                 src="https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar" /> */}
                                    <div className="text-foreground texl-xl">
                                        {item.name}
                                    </div>
                                </div>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger className=" hover:bg-black/25 active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 rounded-full z-10" >
                                    <MoreHorizontalIcon className="w-4 h-4" color="background" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={()=>deleteLessonFromList(userId,item._id)}>删除记录</DropdownMenuItem>
                                    {/* <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Button>

                )}

            </div>
        </div>
    )

}

export  function lessonRecord(lesson: any,userId:string) {
    return (
        <Button asChild className="w-full py-2" variant="ghost" key={lesson.name}>
        <div className="flex flex-row justify-between">
            <Link href={`/${lesson.type}/${lesson._id}`}>
                <div className="flex flex-row flex-1 items-left gap-2">
                    <div className="text-foreground texl-xl">
                        {lesson.name}
                    </div>
                </div>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger className=" hover:bg-black/25 active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 rounded-full z-10" >
                    <MoreHorizontalIcon className="w-4 h-4" color="background" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={()=>delFromUserLessonList(userId,lesson._id)}>删除记录</DropdownMenuItem>
                    {/* <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </Button>
    )
}