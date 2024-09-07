import { auth } from "@clerk/nextjs/server";

import { getMyAssignments, getPublicData, getUserData } from "@/lib/action/mongoIO";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonCard } from "@/components/lessonInfo";
import { Type2Tag } from "@/lib/db/db";
import { Separator } from "@/components/ui/separator";
import { getBeijingTime } from "@/lib/tools";
import { isAfter, isBefore, isWithinInterval } from "date-fns";
import { redirect } from "next/navigation";
import { AssignCardServer } from "@/components/assignment-card-server";
import { Header } from "@/components/student-nav";
import { kv } from "@vercel/kv";


export default async function Home() {
    const { userId, orgId, redirectToSignIn,has } = auth();
    if (!userId) {
        redirectToSignIn()
        return null
    }

    const currentTextbookId = await kv.hget(userId,'textbook')
    // const publicLessonList = await getAllLessonsByLessonId(publicLessonListId)
    const [publicLessonList, userData] = await Promise.all([getPublicData(), getUserData(userId as string)])
    // console.log(publicLessonList)
    return (

        <div className="h-screen flex flex-col  bg-[#F5F5F5]">
            <Header activePage="afterclass"/>
            <div className="flex flex-col gap-4 lg:p-8 md:p-6 p-6">

            <ScrollArea className="w-full h-full flex flex-col gap-4">
            <div>
                为您推荐
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
            </ScrollArea>
            </div>
        </div>
    )
}


