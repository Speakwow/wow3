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
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/nextjs/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChineseName } from "@/lib/tools";
import { fetchRecordData } from "@/lib/action/mongoIO";



export default async function RecordInfo({ params }: { params: { recordId: string } }) {



    let assignmentName: string = '';
    let overallScore: any[] = [];
    let detailScore: any[][] = [];
    let stuName:string = '未命名用户';
    const result = await fetchRecordData(params.recordId, 'word');
    if (result !== null) {
        const { record, info, userData } = result;
        if(userData.chineseName){
            stuName = userData.chineseName
        }
        assignmentName = info?.name || '';
        const tScore = record?.score;
        const tAccuracy = record.report.detailScore.accuracy;
        const tFluency = record.report.detailScore.fluency;
        const tCompleteness = record.report.detailScore.completeness;
        const tProsody = record.report.detailScore.prosody;
        overallScore = [tScore, tAccuracy, tFluency, tCompleteness, tProsody];

        for (let i = 0; i < record.record.length; i++) {
            detailScore[i] = [];
            detailScore[i][0] = record.record[i].text.text;
            detailScore[i][1] = record.record[i].score;
            detailScore[i][2] = record.record[i].detail_score.accuracy;
            detailScore[i][3] = record.record[i].detail_score.fluency;
            detailScore[i][4] = record.record[i].detail_score.completeness;
            detailScore[i][5] = record.record[i].detail_score.prosody;
        }
    }else{
        return redirect('/404')
    }


    // const stuName = "Chen Tai Ming"


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
                <div className="p-4 h-full flex flex-col mb-10">


                    <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
                        <Card className="w-full col-span-2  h-fit pb-2 border-primary">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md ">学生姓名</CardTitle>
                                <CardDescription className="text-xs">
                                    Student Name
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-primary">
                                    {stuName}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-full col-span-2  h-fit pb-2 border-primary">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md ">課程名稱</CardTitle>
                                <CardDescription className="text-xs">
                                    詞彙練習
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-primary">
                                    {assignmentName}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-full h-fit pb-2 border-primary">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md ">總分</CardTitle>
                                <CardDescription className="text-xs">
                                    Overall
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none text-primary">
                                    {Math.round(overallScore[0])}
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                    <div className="pt-6 h-screen w-full">
                        <Card className="h-fit w-full">
                            <CardHeader className="p-4 pb-6">
                                <CardTitle className="text-lg font-bold">{stuName}</CardTitle> {/* 學生名稱 */}
                                <CardDescription className="text-xs">
                                    詞彙練習 - 詳細分析
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>單詞</TableHead>
                                        <TableHead>得分</TableHead>

                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detailScore.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-md max-w-64 text-muted-foreground">{row[0]}</TableCell>
                                            <TableCell className={`text-lg font-bold ${row[1]>75?'text-primary':'text-red-500'}`}>{row[1]}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                </div>
            </ScrollArea>
        </div>

    )
}