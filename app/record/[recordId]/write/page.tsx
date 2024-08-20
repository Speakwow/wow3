import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MongoClient, ObjectId } from "mongodb";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Link } from "lucide-react";
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/nextjs/server";


export default async function RecordInfo({ params }: { params: { recordId: string } }) {


    const client = await connect()

    let record;
    let assignmentName: string = '';
    let topic: string = '';
    let comment: string = '';
    let stuEssay: string = '';
    let polished: string = '';
    let stuName = "未命名用户"
    let level: string = '';
    let wordCount: string = '';
    let overallScore: any[] = [];
    let detailScore: any[][] = [];  

    try {
        const database = client.db(DB);
        const records = database.collection('write_records');
        record = await records.findOne({ _id: new ObjectId(params.recordId)})

        if (record !== null) {
            const threads = database.collection('writes');
            const exthreadId = record.threadId;
            const userId = record.userId as string
            try {
                const user = await clerkClient().users.getUser(userId)
                console.log(user)
                stuName = user.username ?? 'Null'
            } catch (error) {

            }
            const thread = await threads.findOne({_id: new ObjectId(exthreadId)});
            if (thread !== null){
                assignmentName = thread.name;
                topic = thread.topic;
                wordCount = thread.word_count;
                level = thread.level;
            }
            const tScore = record.report.score;
            const tContent = record.report.content_score;
            const tCommun = record.report.communicativeachievement_score;
            const tOrgan = record.report.organisation_score;
            const tLang = record.report.language_score;
            comment =  record.report.w_feedback;
            stuEssay = record.content;
            polished = record.report.polished;
            overallScore = [tScore,tContent,tCommun,tOrgan,tLang,stuEssay,polished,comment];

            // for (let i=0; i<record.record.length; i++){
            //         detailScore[i] = [];
            //         detailScore[i][0] = record.record[i].text;
            //         detailScore[i][1] = record.record[i].score;
            //         detailScore[i][2] = record.record[i].detail_score.accuracy;
            //         detailScore[i][3] = record.record[i].detail_score.fluency;
            //         detailScore[i][4] = record.record[i].detail_score.completeness;
            //         detailScore[i][5] = record.record[i].detail_score.prosody;
            // }
        }

      } finally {
        // Ensures that the client will close when you finish/error

      }


    return (
        <div className="relative w-full h-full flex flex-col bg-neutral-100">
        <div className="p-4 flex flex-row gap-4 items-center">
            <Button asChild size="icon" variant="outline">
                <Link href="javascript:history.back()">
                    <ChevronLeft />
                </Link>
            </Button>
            <div className="text-muted-foreground text-sm">返回上一页</div>
        </div>
        <ScrollArea className="w-full h-full mb-4">
        <div className="p-8 h-screen flex flex-col bg-neutral-100">

                <div className=" grid auto-rows-max grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4 mb-10">
                <Card className=" col-span-2 row-span-2 w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-2xl text-primary">{assignmentName}</CardTitle>
                            <CardDescription className="text-xs">
                                {stuName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4 p-4">
                            <div className="grid items-center gap-2">
                            <div className="grid flex-1 auto-rows-min gap-0.5">
                                <div className="text-sm text-muted-foreground">Topic</div>
                                <div className="flex items-baseline gap-1 text-lg font-bold tabular-nums leading-none pt-3">
                                {topic}
                                </div>
                            </div>
                            <div className="grid flex-1 auto-rows-min gap-0.5">
                                <div className="text-sm text-muted-foreground">Level</div>
                                <div className="flex items-baseline gap-1 text-lg font-bold tabular-nums leading-none pt-3">
                                    {level}
                                </div>
                            </div>
                            <div className="grid flex-1 auto-rows-min gap-0.5">
                                <div className="text-sm text-muted-foreground">Word Count</div>
                                <div className="flex items-baseline gap-1 text-lg font-bold tabular-nums leading-none pt-3">
                                    {wordCount}
                                </div>
                            </div>
                            </div>
                        </CardContent>
                        {/* <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                                {topic}
                            </div>
                            <div className="grid flex-1 auto-rows-min gap-0.5"></div>
                            <div className="text-sm text-muted-foreground">Level</div>
                                    <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none">
                                        {level}
                                    </div>

                        </CardContent> */}
                    </Card>
                    <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md text-primary">總分</CardTitle>
                            <CardDescription className="text-xs">
                                Overall
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[0])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">内容</CardTitle>
                            <CardDescription className="text-xs">
                                Content
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[1])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">溝通</CardTitle>
                            <CardDescription className="text-xs">
                                Communicative Achievement
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[2])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">結構</CardTitle>
                            <CardDescription className="text-xs">
                                Organisation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[3])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">語言</CardTitle>
                            <CardDescription className="text-xs">
                                Language
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[4])}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-10">
                <Card className=" w-full pb-2 mt-4">
                    <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">學生原文</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                        <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                            {overallScore[5]}
                        </div>
                    </CardContent>
                </Card>
                <Card className=" w-full pb-2 mt-4">
                    <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">AI升級文章</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                        <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                            {overallScore[6]}
                        </div>
                    </CardContent>
                </Card>
                <Card className=" w-full pb-2 mt-4">
                    <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">AI評語</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                        <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                            {overallScore[7]}
                        </div>
                    </CardContent>
                </Card>
                </div>
        </div>  
        </ScrollArea>
        </div>
    )
}