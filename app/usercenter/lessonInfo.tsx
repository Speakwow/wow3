'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { ArrowLeftIcon, EditIcon, MoreHorizontalIcon } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { deleteLesson, getCharacterById, getRepeatThreadById, getScenarioById } from "@/lib/action/mongoIO";
import { Label } from "@radix-ui/react-label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnterIcon } from "@radix-ui/react-icons";
import { useRouter } from 'next/navigation';
import { useState } from "react";

export async function LessonInfo(params: { type: string, id: string, name: string, character: any, userId: string }) {

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
                <CardFooter>
                    {/* <DropdownMenu>
                        <DropdownMenuTrigger className=" " >
                            <MoreHorizontalIcon className="w-4 h-4" color="" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => deleteLesson(params.userId, params.id)}>删除记录</DropdownMenuItem>
                            {/* <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                    {/* </DropdownMenuContent>
                    </DropdownMenu> */}
                </CardFooter>
            </Card>
        </Link>
    )

}



export function LessonCard({ userId, name, type, id, intro, cover, tag }: { userId: string, name: string, type: string, id: string, intro: string, cover: string, tag: string }) {
    let coverImg = ''
    if (!cover) {
        coverImg = 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar'
    } else {
        coverImg = cover
    }

    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    function handleDeleteLesson(userId:string, id:string, type:string) {
        setIsDeleting(true);
        try {
            deleteLesson(userId, id, type).then(res=>router.refresh())
        } catch (error) {
            console.error('Failed to delete lesson:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (

            <Card className={`bg-white rounded-[10px] ${isDeleting?'disabled':''}`}>
                <CardContent className="flex flex-row w-full p-0">
                    <div className="h-full p-3 w-[100px]">
                        <Image
                            alt='SC'
                            width={200}
                            height={50}
                            objectFit="cover"
                            className="rounded-[10px]"
                            src={coverImg} />
                    </div>
                    <div className=" text-pretty truncate w-full col-span-2 p-3 flex flex-col gap-2">
                        <div className="font-semibold text-sm">
                            {name}
                        </div>
                        <Badge className="text-xs w-fit" variant="outline">
                            {tag}
                        </Badge>
                        <div className="line-clamp-2 text-xs text-pretty truncate">
                            {intro}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-row justify-end gap-2 border-t p-2">
                    <Button className="hover:muted active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 h-6 w-6 p-1 rounded-full z-10" variant="ghost" asChild>
                    <Link href={`/${type}/${id}`}>
                        <EnterIcon className="w-6 h-6" color="black" />
                        </Link>
                    </Button>
                    {/* <Button className="hover:muted active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 h-6 w-6 p-1 rounded-full z-10" variant="ghost">
                        <EditIcon className="w-6 h-6" color="black" />
                    </Button> */}
                    <DropdownMenu>
                        
                        <Button className="hover:muted active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 h-6 w-6 p-1 rounded-full z-10" variant="ghost" asChild>
                        <DropdownMenuTrigger >
                            <MoreHorizontalIcon className="w-6 h-6" color="black" />
                            </DropdownMenuTrigger>
                            </Button>

                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={()=>handleDeleteLesson(userId,id,type)} className="text-[#D21F1F] font-medium">删除课程</DropdownMenuItem>
                            {/* <DropdownMenuSeparator />
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuItem>Team</DropdownMenuItem>
                                <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>

    )

}