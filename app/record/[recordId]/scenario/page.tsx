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
import { ChevronLeft } from "lucide-react";
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { getChineseName } from "@/lib/tools";
import { fetchRecordData } from "@/lib/action/mongoIO";


export default async function RecordInfo({ params }: { params: { recordId: string } }) {


    const result = await fetchRecordData(params.recordId, 'scenario');
    if (!result) {
        console.log(result)
        return redirect('/404')
    }
    const { record, info, userData } = result;

    let assignmentName: string = '';
    let topic: string = '';
    let minutes: number;
    let seconds: number;
    let stuName = userData.chineseName ?? "未命名用户"
    let level: string = '';
    let len: string = '';
    let overallScore: any[] = [];
    let detailScore: any[][] = [];

    try {
        if (record !== null) {
            if (info !== null) {
                assignmentName = info.name;
                topic = info.topic;
                len = info.length;
                level = info.level;
            }
            const tScore = record.score;
            const tAccuracy = record.report.accuracy;
            const tFluency = record.report.fluency;
            // const tCompleteness = record.report.detailScore.completeness;
            // const tProsody = record.report.detailScore.prosody;
            const tDuration = record.report.duration;
            if (tDuration >= 60) {
                minutes = (tDuration) / 60;
                seconds = (tDuration) % 60;
            }
            else {
                minutes = 0;
                seconds = tDuration;
            }
            const tRound = record.report.round;
            overallScore = [tScore, tAccuracy, tFluency, minutes, seconds, tRound];
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
                <div className="p-4 h-full flex flex-col bg-neutral-100 mb-20">
                    <div className=" grid auto-rows-max grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
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
                                        <div className="text-sm text-muted-foreground">length</div>
                                        <div className="flex items-baseline gap-1 text-lg font-bold tabular-nums leading-none pt-3">
                                            {len}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                round(s)
                                            </span>
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
                                <CardTitle className="text-md text-primary">总分</CardTitle>
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
                                <CardTitle className="text-md">准确度</CardTitle>
                                <CardDescription className="text-xs">
                                    Accuracy
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
                                <CardTitle className="text-md">流畅度</CardTitle>
                                <CardDescription className="text-xs">
                                    Fluency
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
                                <CardTitle className="text-md">练习时长</CardTitle>
                                <CardDescription className="text-xs">
                                    Duration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                    {Math.round(overallScore[3])}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        mins
                                    </span>
                                    {Math.round(overallScore[4])}
                                    <span className="text-sm font-normal text-muted-foreground">
                                        sec
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-full pb-2">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md">对话轮次</CardTitle>
                                <CardDescription className="text-xs">
                                    Round(s)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                    {Math.round(overallScore[5])}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}