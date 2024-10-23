import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { connect, connectCore } from "@/lib/mongo";
import { DB, DB_CORE } from "@/lib/constant";
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { getChineseName } from "@/lib/tools";
import { fetchRecordData } from "@/lib/action/mongoIO";


export default async function RecordInfo({ params }: { params: { recordId: string } }) {
    const result = await fetchRecordData(params.recordId, 'talkabout');
    if (!result) {
        console.log(result)
        return redirect('/404')
    }
    const { record, info, userData } = result;
    const stuName = userData.chineseName ?? "未命名用户";

    const assignmentName = info?.name ?? '';
    const topic = info?.rule ?? '';
    const prepTime = info?.prepare_time ?? '';
    const ansTime = info?.answer_time ?? '';
    const level = info?.level ?? '';

    const tSpeed = record?.report.speedScore ?? 0;
    const comment = record?.report.feedback ?? '';
    const stuAns = record?.report.user_answer ?? '';
    const overallScore = record ? [
        record.score,
        record.report.accuracy,
        record.report.fluency,
        record.report.grammarScore,
        record.report.overallContentScore,
        record.report.overallPronScore,
        record.report.themeScore,
        record.report.vocabScore,
        stuAns,
        comment
    ] : [];


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
            <ScrollArea className="w-full h-full  p-4">
                <div className="h-full grid auto-rows-max grid-cols-1 md:grid-cols-4 xl:grid-cols-6 gap-4 ">
                    <Card className=" col-span-2 row-span-2 w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-2xl text-primary">{assignmentName}</CardTitle>
                            <CardDescription className="text-lg">
                                {stuName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4 p-4">
                            <div className="grid items-center gap-2">
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-sm text-muted-foreground">Topic</div>
                                    <div className="flex items-baseline gap-1  tabular-nums leading-none pt-3">
                                        {topic}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-row border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Level</div>
                                    <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                                        {level}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Prepare Time</div>
                                    <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                                        {prepTime}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Answer Time</div>
                                    <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                                        {ansTime}
                                    </div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                    <Card className="w-full pb-2 col-span-2 border-primary">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md text-primary">总分</CardTitle>
                            <CardDescription className="text-xs">
                                Overall
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline text-primary gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[0])}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="w-full pb-2 col-span-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">内容总分</CardTitle>
                            <CardDescription className="text-xs">
                                Language
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[4])}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-row border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Theme 切题</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[6])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Grammar 语法</div>
                                    <div className="flex items-baseline gap-1 text-xl tabular-nums leading-none">
                                        {Math.round(overallScore[3])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Vocabulary 词汇</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[7])}
                                    </div>
                                </div>

                            </div>
                        </CardFooter>
                    </Card>
                    <Card className="w-full pb-2 col-span-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">发音总分</CardTitle>
                            <CardDescription className="text-xs">
                                Language
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[5])}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-row border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Accuracy 准确度</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[1])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Fluency 流畅度</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[2])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Speed 语速</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(tSpeed)}
                                    </div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4  mb-24">
                    <Card className=" w-full mt-4">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xl">学生回答</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                                {overallScore[8]}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className=" w-full pb-2 mt-4">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xl">AI 评语</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                                {overallScore[9]}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </ScrollArea>
        </div>
    )
}