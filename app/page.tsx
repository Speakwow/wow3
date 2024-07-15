import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"

import CurrentLessonCard from "./current-lesson";
import { Input } from "@/components/ui/input";
import { getAllLessons, getPublicData, getUserData } from "@/lib/action/mongoIO";
import { getAllLessonsByLessonId } from "@/lib/action/mongoIO-client";
import { Badge } from "@/components/ui/badge";
import SideBar from "@/components/side-bar";
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
import { LessonCard } from "../components/lessonInfo";


export default async function Home() {
    const { userId, orgId } = auth();
    const publicLessonListId = "666009c2fc4cf7e1bbd4629b"
    // const publicLessonList = await getAllLessonsByLessonId(publicLessonListId)
    const [publicLessonList ,userData]= await Promise.all([getPublicData(), getUserData(userId as string)])
    // console.log(publicLessonList)
    return (

        <div className="h-screen flex flex-col gap-4 lg:p-8 md:p-6 p-6 bg-[#F5F5F5]">
            <div className="grid grid-cols-2">
                <div className=" w-full text-xl text-primary">
                    欢迎回来
                </div>
                {/* <Input className=" w-full text-xl bg-white" placeholder="..." /> */}
            </div>
            <div>
                为您推荐
            </div>
            <ScrollArea className="w-full h-full">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">

                    {
                        //@ts-ignore
                        publicLessonList.map(item => (
                            <LessonCard
                                userId={userId as string}
                                userData={userData}
                                name={item.name}
                                type={item.type}
                                tag={item.tag}
                                id={item._id}
                                intro={item.intro}
                                key={item._id}
                                cover='' />
                        )
                        )
                    }

                </div>
            </ScrollArea>
        </div>
    )
}


