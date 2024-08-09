import { auth } from "@clerk/nextjs/server";

import { getMyAssignments, getPublicData, getUserData } from "@/lib/action/mongoIO";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonCard } from "../components/lessonInfo";
import { Type2Tag } from "@/lib/db/db";
import { Separator } from "@/components/ui/separator";


export default async function Home() {
    const { userId, orgId } = auth();


    if (orgId) {
        const [myAssignments, userData] = await Promise.all([getMyAssignments(orgId, userId), getUserData(userId as string)])
        // 获取当前时间
        const currentTime = new Date();
        const notStarted: any[] = [];
        const ongoing: any[] = [];
        const ended: any[] = [];
        // 分组逻辑
        for (const assignment of myAssignments) {
            const startAt = new Date(assignment.startAt);
            const endAt = new Date(assignment.endAt);

            if (currentTime < startAt) {
                notStarted.push(assignment);
            } else if (currentTime >= startAt && currentTime <= endAt) {
                ongoing.push(assignment);
            } else {
                ended.push(assignment);
            }
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
                    博学笃志，行稳致远
                </div>
                <ScrollArea className="w-full h-full">
                    <div className="flex flex-col gap-6">
                    <Separator/>
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
                                        <LessonCard
                                            userId={userId as string}
                                            userData={userData}
                                            name={assginment.info.name}
                                            type={assginment.type}
                                            tag={Type2Tag(assginment.type) as string}
                                            id={assginment.threadId}
                                            intro={assginment.info.intro}
                                            key={assginment.threadId}
                                            cover=''
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                        <Separator/>
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
                                        <LessonCard
                                            userId={userId as string}
                                            userData={userData}
                                            name={assginment.info.name}
                                            type={assginment.type}
                                            tag={Type2Tag(assginment.type) as string}
                                            id={assginment.threadId}
                                            intro={assginment.info.intro}
                                            key={assginment.threadId}
                                            cover=''
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                        <Separator/>
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
                                        <LessonCard
                                            userId={userId as string}
                                            userData={userData}
                                            name={assginment.info.name}
                                            type={assginment.type}
                                            tag={Type2Tag(assginment.type) as string}
                                            id={assginment.threadId}
                                            intro={assginment.info.intro}
                                            key={assginment.threadId}
                                            cover=''
                                        />
                                    )
                                    )
                                }
                            </div>
                        </div>
                        <Separator/>
                    </div>
                </ScrollArea>
            </div>

        )

    }
    const publicLessonListId = "666009c2fc4cf7e1bbd4629b"
    // const publicLessonList = await getAllLessonsByLessonId(publicLessonListId)
    const [publicLessonList, userData] = await Promise.all([getPublicData(), getUserData(userId as string)])
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


