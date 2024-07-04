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
import { getAllLessons, getPublicData } from "@/lib/action/mongoIO";
import { getAllLessonsByLessonId } from "@/lib/action/mongoIO-client";
import { Badge } from "@/components/ui/badge";
import SideBar from "@/components/side-bar";
import { ScrollArea } from "@/components/ui/scroll-area";


export default async function Home() {
    const { userId, orgId } = auth();
    const publicLessonListId = "666009c2fc4cf7e1bbd4629b"
    // const publicLessonList = await getAllLessonsByLessonId(publicLessonListId)
    const publicLessonList = await getPublicData()
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        {
                            //@ts-ignore
                            publicLessonList.map(item => (
                                <LessonCard 
                                name={item.name} 
                                type={item.type} 
                                tag={item.tag}
                                id={item._id} 
                                intro={item.intro} 
                                key={item._id} 
                                cover=''/>
                            )
                            )
                        }
                        
                    </div>
                    </ScrollArea>
                </div>
    )
}


function LessonCard({ name, type, id, intro,cover ,tag}: { name: string, type: string, id: string, intro: string ,cover:string,tag:string}) {
    let coverImg = ''
    if(!cover){
        coverImg='https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar'
    }else{
        coverImg = cover
    }
    return (
        <Link href={`/${type}/${id}`}>
            <Card className="flex flex-row bg-white rounded-[10px] border hover:ring hover:ring-[#42C83C] focus:outline-none focus:ring focus:ring-[#42C83C]">
                <div className="h-full p-3 w-[100px]">
                    <Image
                        alt='SC'
                        width={200}
                        height={50}
                        objectFit="cover"
                        className="rounded-[10px]"
                        src={coverImg} />
                </div>
                <div className=" text-pretty truncate w-[200px] col-span-2 p-3 flex flex-col gap-2">
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
            </Card>
        </Link>

    )

}