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
import  {useRouter}  from "next/navigation"


export async function LessonInfo(params: { type: string, id: string, name: string, character: any }) {
    console.log(params.character)

    return (
        <Link href={`/${params.type}/${params.id}`}>
            <Card className="border-[#42C83C] border-2">
                <CardHeader>
                    <div className="flex flex-row gap-2">
                        <div>
                            <Avatar>
                                <AvatarImage src={params.character.avatar} alt={params.character.name} />
                            </Avatar>
                        </div>
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-">
                                {params.name}
                            </CardTitle>
                            <CardDescription className="text- font-light">
                                <Label>
                                    {params.type}
                                </Label>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )

}


export function LessonCard({ userId, userData, name, type, id, intro, cover, tag }:
     { userId: string, userData: any, name: string, type: string, id: string, intro: string, cover: string, tag: string}) {
    let coverImg = ''
    if (!cover) {
        coverImg = 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar'
    } else {
        coverImg = cover
    }
    const inFavourite = (lessonId: string, userData: any): boolean => {
        return userData.favourite.some((lesson: any) => lesson.id === lessonId);
    }

    const [isFavourite, setIsFavourite] = useState(inFavourite(id, userData))
    const router = useRouter()


    const handleAddFavourite = () => {
        setIsFavourite(true)
        addFavourite(userId, id, name, type)
        router.refresh()
    }
    const handleDeleteFavourite = () => {
        setIsFavourite(false)
        deleteFavourite(userId, id)
        router.refresh()
        
    }

    return (
        <div className="relative w-full h-fit">
            <DropdownMenu>
                <DropdownMenuTrigger className="absolute right-1 top-1 hover:bg-muted active:bg-muted focus:bg-black/25 h-6 w-6 p-1 rounded-full z-10" >
                    <MoreHorizontalIcon className="w-4 h-4" color="gray" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {/* <DropdownMenuItem>添加到“最近使用”</DropdownMenuItem> */}
                    {isFavourite ?
                        <DropdownMenuItem onClick={handleDeleteFavourite}>已收藏 <HeartIcon className="w-3 h-3 ml-2" color="pink" /></DropdownMenuItem>
                        :
                        <DropdownMenuItem onClick={handleAddFavourite}>收藏 <HeartIcon className="w-3 h-3 ml-2" color="gray" /></DropdownMenuItem>
                    }
                    {/* <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                </DropdownMenuContent>
            </DropdownMenu>
            <Link href={`/${type}/${id}`}>
                <Card className={`relative flex flex-row bg-white rounded-[10px] border hover:ring focus:outline-none focus:ring focus:ring-[#42C83C] p-2 gap-3 hover:ring-[#42C83C]`}>

                    <div className="h-full w-[100px]">
                        <img
                            alt='SC'
                            width={200}
                            height={50}
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
                </Card>
            </Link>
        </div>

    )

}