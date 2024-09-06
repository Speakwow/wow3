import { auth } from "@clerk/nextjs/server";

import { getCurrentTextbookData, getMyAssignments, getPublicData, getUserData } from "@/lib/action/mongoIO";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonCard } from "../components/lessonInfo";
import { Type2Tag } from "@/lib/db/db";
import { Separator } from "@/components/ui/separator";
import { getBeijingTime } from "@/lib/tools";
import { isAfter, isBefore, isWithinInterval } from "date-fns";
import { redirect } from "next/navigation";
import { AssignCardServer } from "@/components/assignment-card-server";
import { Header } from "@/components/student-nav";
import { getCurrentTextbook } from "@/lib/action/kv";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


export default async function Home() {
    const { userId, orgId, redirectToSignIn, has } = auth();
    if (!userId) {
        redirectToSignIn()
        return null
    }
    if (has({ role: "org:admin" })) {
        redirect('/dashboard')
    }

    if (orgId) {
        const [myAssignments, userData] = await Promise.all([getMyAssignments(orgId, userId), getUserData(userId)])
        // 获取当前时间
        const today = new Date()
        const notStarted: any[] = [];
        const ongoing: any[] = [];
        const ended: any[] = [];
        // 分组逻辑
        for (const assignment of myAssignments) {
            const startAt = assignment.startAt;
            const endAt = assignment.endAt;

            if (isWithinInterval(today, { start: startAt, end: endAt })) {
                ongoing.push(assignment);
            } else if (isBefore(today, startAt)) {
                notStarted.push(assignment);
            } else if (isAfter(today, endAt))
                ended.push(assignment);
        }


        return (
            <div className="h-screen flex flex-col gap-4 lg:p-8 md:p-6 p-6 bg-[#F5F5F5]">
                <div className="grid grid-cols-2">
                    <div className=" w-full text-xl text-primary font-bold">
                        我的练习
                    </div>
                    {/* <Input className=" w-full text-xl bg-white" placeholder="..." /> */}
                </div>
                <div className="text-xs text-muted-foreground">
                    梦想无限，开口实现
                </div>
                <ScrollArea className="w-full h-full">
                    <div className="flex flex-col gap-6">
                        <Separator />
                        <div className="flex flex-col gap-2">
                            <div>
                                <Badge>
                                    进行中
                                </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                {
                                    //@ts-ignore
                                    ongoing.map(assginment => (
                                        <AssignCardServer
                                            userId={userId as string}
                                            orgId={orgId as string}
                                            userData={userData}
                                            name={assginment.info.name}
                                            type={assginment.type}
                                            tag={Type2Tag(assginment.type) as string}
                                            threadId={assginment.threadId}
                                            intro={assginment.info.intro}
                                            key={assginment.threadId}
                                            cover=''
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-2">
                            <div>
                                <Badge variant="outline">
                                    待开始
                                </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                {
                                    //@ts-ignore
                                    notStarted.map(assginment => (
                                        <AssignCardServer
                                            userId={userId as string}
                                            orgId={orgId as string}
                                            userData={userData}
                                            name={assginment.info.name}
                                            type={assginment.type}
                                            tag={Type2Tag(assginment.type) as string}
                                            threadId={assginment.threadId}
                                            intro={assginment.info.intro}
                                            key={assginment.threadId}
                                            cover=''
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-2">
                            <div>
                                <Badge variant="outline" className=" text-muted-foreground">
                                    已截止
                                </Badge>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                                {
                                    //@ts-ignore
                                    ended.map(assginment => (
                                        <AssignCardServer
                                            userId={userId as string}
                                            orgId={orgId as string}
                                            userData={userData}
                                            name={assginment.info.name}
                                            type={assginment.type}
                                            tag={Type2Tag(assginment.type) as string}
                                            threadId={assginment.threadId}
                                            intro={assginment.info.intro}
                                            key={assginment.threadId}
                                            cover=''
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                        <Separator />
                    </div>
                </ScrollArea>
            </div>

        )

    }
    const publicLessonListId = "666009c2fc4cf7e1bbd4629b"
    // const publicLessonList = await getAllLessonsByLessonId(publicLessonListId)
    const [publicLessonList, userData, currentTextbook] = await Promise.all([getPublicData(), getUserData(userId as string), getCurrentTextbookData(userId)])
    // console.log(publicLessonList)
    return (

        <div className="h-screen flex flex-col  bg-[#F5F5F5]">
            <Header activePage="/" />
            <div className=" lg:p-8 md:p-6 p-6">
                <ScrollArea className="w-full h-full">
                    <div className="w-full h-full mb-24 flex flex-col gap-4">
                        <div className=" w-full text-xl text-primary">
                            欢迎回来
                        </div>
                        {/* <Input className=" w-full text-xl bg-white" placeholder="..." /> */}    

                    
                    <div>
                        当前课程
                    </div>
                    {currentTextbook?
                     <div className="">
                     <Card className="flex flex-row justify-between items-center border-primary border-2">
                         <div>
                         <CardHeader>
                             <CardTitle>
                                 {currentTextbook.name}
                             </CardTitle>
                             <CardDescription>
                                 {currentTextbook.level}
                             </CardDescription>
                             
                         </CardHeader>
                         </div>
                         <div className="px-4 py-8">
                         <Button asChild >
                             <Link href='/inclass'>
                             进入课程
                             </Link>
                         </Button>
                         </div>
                     </Card>
                 </div>:
                 <div>
                    暂无课程
                    </div>
                    
                }
                   
                    <div>
                        课外推荐
                    </div>
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
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}


