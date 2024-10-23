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

    const result = await fetchRecordData(params.recordId, 'write');
    if (!result) return redirect('/404');

    const { record, info, userData } = result;
    const stuName = userData.chineseName ?? "未命名用户";

    // 初始化变量并提取信息
    const {
        name: assignmentName = '',
        topic = '',
        word_count: wordCount = '',
        level = ''
    } = info as any;
    const { score, content_score, communicativeachievement_score, organisation_score, language_score, w_feedback: comment, polished: polished } = record.report;
    const content = record.content;

    const overallScore = [
        score,
        content_score,
        communicativeachievement_score,
        organisation_score,
        language_score,
        content,
        polished,
        comment
    ];



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
                <div className="flex flex-col p-4">

                    <div className=" grid auto-rows-max grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
                        <Card className=" col-span-2 md:col-span-3 row-span-3 w-full pb-2">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-2xl text-primary">{assignmentName}</CardTitle>
                                <CardDescription className="text-lg">
                                    {stuName}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex gap-4 p-4">
                                <div className="flex flex-col items-left gap-4">
                                    <div className="grid flex-1 auto-rows-min gap-0.5">
                                        <div className="text-sm text-muted-foreground">Topic</div>
                                        <div className="flex items-baseline gap-1   tabular-nums leading-none text-pretty whitespace-pre-line  pt-3">
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
                        <Card className="col-span-2 row-span-1 w-full pb-2 border-primary">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md text-primary">总分</CardTitle>
                                <CardDescription className="text-xs">
                                    Overall
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-3xl font-bold text-primary tabular-nums leading-none">
                                    {Math.round(overallScore[0])}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-1 row-span-1 w-full pb-2">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md">內容切题</CardTitle>
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
                        <Card className="col-span-1 row-span-1 w-full pb-2">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md">表达得当</CardTitle>
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
                        <Card className="col-span-1 row-span-1 w-full pb-2">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md">语言结构</CardTitle>
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
                        <Card className="col-span-1 row-span-1 w-full pb-2">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md">词汇及语法</CardTitle>
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
                                <CardTitle className="text-xl">学生原文</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                                    {overallScore[5]}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className=" w-full pb-2 mt-4">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-xl">AI 升级文章</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                                    {overallScore[6]}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className=" w-full pb-2 mt-4">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-xl">AI 評語</CardTitle>
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