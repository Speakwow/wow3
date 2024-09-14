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
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";


export default async function RecordInfo({ params }: { params: { recordId: string } }) {

    const client = await connect()
    let record;
    let assignmentName: string = '';
    let topic: string = '';
    let comment: string = '';
    let stuAns: string = '';
    let stuName = "未命名用户"
    let level: string = '';
    let prepTime: string = '';
    let ansTime: string = '';
    let tSpeed = 0
    let overallScore: any[] = [];
    let detailScore: any[][] = [];

    try {

        const database = client.db(DB);
        const records = database.collection('talkabout_records');
        record = await records.findOne({ _id: new ObjectId(params.recordId) })

        if (record !== null) {
            const threads = database.collection('talkabouts');
            const exthreadId = record.threadId;
            const userId = record.userId as string
            try {
                const user = await clerkClient().users.getUser(userId)
                console.log(user)
                stuName = `${user.lastName??user.username??'no name'}${user.firstName}`
            } catch (error) {

            }
            const thread = await threads.findOne({ _id: new ObjectId(exthreadId) });
            if (thread !== null) {
                assignmentName = thread.name;
                topic = thread.rule;
                prepTime = thread.prepare_time;
                ansTime = thread.answer_time;
                level = thread.level;
            }
            const tScore = record.score;
            const tAccuracy = record.report.accuracy;
            const tFluency = record.report.fluency;
            const tGram = record.report.grammarScore;
            const tContent = record.report.overallContentScore;
            const tPron = record.report.overallPronScore;
            const tTheme = record.report.themeScore;
            const tVocab = record.report.vocabScore;
            tSpeed = record.report.speedScore;

            comment = record.report.feedback;
            stuAns = record.report.user_answer;
            overallScore = [tScore, tAccuracy, tFluency, tGram, tContent, tPron, tTheme, tVocab, stuAns, comment];

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
                            <CardTitle className="text-md text-primary">總分</CardTitle>
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
                            <CardTitle className="text-md">内容總分</CardTitle>
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
                                    <div className="text-xs text-muted-foreground">Theme 切題</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[6])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Grammar 語法</div>
                                    <div className="flex items-baseline gap-1 text-xl tabular-nums leading-none">
                                        {Math.round(overallScore[3])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Vocabulary 詞彙</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[7])}
                                    </div>
                                </div>

                            </div>
                        </CardFooter>
                    </Card>
                    <Card className="w-full pb-2 col-span-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">發音總分</CardTitle>
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
                                    <div className="text-xs text-muted-foreground">Accuracy 準確度</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[1])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Fluency 流暢度</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(overallScore[2])}
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                                <div className="grid flex-1 auto-rows-min gap-0.5">
                                    <div className="text-xs text-muted-foreground">Speed 語速</div>
                                    <div className="flex items-baseline gap-1 text-xl  tabular-nums leading-none">
                                        {Math.round(tSpeed)}
                                    </div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                    {/* <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">貼題</CardTitle>
                            <CardDescription className="text-xs">
                                Theme
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[6])}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="w-full pb-2">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-md">詞匯</CardTitle>
                            <CardDescription className="text-xs">
                                Vocabulary
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
                                {Math.round(overallScore[7])}
                            </div>
                        </CardContent>
                    </Card> */}
                </div>
                <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4  mb-24">
                    <Card className=" w-full mt-4">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xl">學生回答</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                            <div className="flex items-baseline gap-1 text-md tabular-nums leading-none">
                                {overallScore[8]}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className=" w-full pb-2 mt-4">
                        <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-xl">AI 評語</CardTitle>
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