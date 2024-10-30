'use server'
import { Header } from "@/components/dashboard-nav";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, Table } from "@/components/ui/table";
import { getAllRecordsByUserId, getLatestRecordsByUserId, getOrgAssignments, getOrgStudents, getRecordsByOrgId, getRecordsForAssignment } from "@/lib/action/mongoIO";
import { reformatRecords } from "@/lib/dashboard";
import { calculateAverageScore, findLowestScoreDoc, findHighestScoreDoc, hoursUntil, Score2Grade } from "@/lib/tools";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { DollarSign, Users, CreditCard, ChevronLeft } from "lucide-react";
import {  columns } from "./columns"
import { DataTable } from "./date-table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { connect } from "@/lib/mongo";
import { DB } from "@/lib/constant";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReportRadar from "./radar-chart";
import { genReportAdvice } from "@/lib/action/gen";


export default async function MyRecords({params}:{params:{studentId:string}}) {
    const { userId, orgId } = auth();
    if (!userId||!orgId) {
        return (
            <div>
                Unauthorized
            </div>
        )
    }
    const user = await clerkClient().users.getUser(params.studentId)
    const [records, myAssignments,orgRecords] = await Promise.all([
        getLatestRecordsByUserId(params.studentId),
        getOrgAssignments(orgId),
        getRecordsByOrgId(orgId)
    ])
    const userRecords = orgRecords.filter((record: any) => record.userId === params.studentId);
    const userScore = userRecords.reduce((acc: number, record: any) => acc + record.score, 0);
    
    const totalScores = orgRecords.map((record: any) => record.score);
    totalScores.push(userScore); // 将当前用户的分数添加到总分数中

    const sortedScores = totalScores.sort((a:number, b:number) => b - a); // 按分数降序排序
    const userRank = sortedScores.indexOf(userScore) + 1; // 获取用户排名（从1开始）


    const reformatedRecord = records.map((item: any )=>{
        return{
            name:item.info.name,
            type:item.type,
            tag:item.tag,
            score:item.score,
            grade:Score2Grade(item.score),
            finishAt:item.finishAt,
            id:item._id
        }
    })
    const durationMap = {
        'write':180,
        'dictation':180,
        'scenario':300,
        'reading':180,
        'repeat':120,
        'word':120,
        'talkabout':300,
    }

    const calGrammarScore = (reformatedRecord:any[])=>{
        const writeRecords = reformatedRecord.filter((item:any)=>item.type==='write')
        const talkaboutRecords = reformatedRecord.filter((item:any)=>item.type==='talkabout')
        const writeScore = writeRecords.reduce((acc:number, item:any)=>{if(item.report?.language_score) return acc+item.report.language_score ;else return acc+60},0)/writeRecords.length
        const talkaboutScore = talkaboutRecords.reduce((acc:number, item:any)=>{if(item.report?.grammarScore) return acc+item.report.grammarScore ;else return acc+60},0)/talkaboutRecords.length
        
        return (writeScore+talkaboutScore)/2
    }
    const calThinkingScore = (reformatedRecord:any[])=>{
        const writeRecords = reformatedRecord.filter((item:any)=>item.type==='write')
        const talkaboutRecords = reformatedRecord.filter((item:any)=>item.type==='talkabout')
        const writeScore = writeRecords.reduce((acc:number, item:any)=>acc+item.report?.communicativeachievement_score,0)/writeRecords.length
        const talkaboutScore = talkaboutRecords.reduce((acc:number, item:any)=>acc+item.report?.themeScore,0)/talkaboutRecords.length
        
        return (writeScore+talkaboutScore)/2
    }
    const radarData = {
        writing:calculateAverageScore(reformatedRecord.filter((item:any)=>item.type==='write')),
        speaking:calculateAverageScore(reformatedRecord.filter((item:any)=>item.type==='scenario'||item.type==='talkabout')),
        grammar:calGrammarScore(reformatedRecord),
        pronunciation:calculateAverageScore(reformatedRecord.filter((item:any)=>item.type==='scenario'||item.type==='repeat'||item.type==='word')),
        thinking:calThinkingScore(reformatedRecord),
    }
    const totalDuration = reformatedRecord.reduce((acc:number, item:any)=>{
        return acc + durationMap[item.type as keyof typeof durationMap] 
    },0)
    const minutes = Math.floor(totalDuration / 60);
    const averageScore = calculateAverageScore(reformatedRecord)
    const advice = await genReportAdvice(radarData.speaking,radarData.writing,radarData.pronunciation,radarData.grammar,radarData.thinking)




    return (
        <div className="flex h-full w-full flex-col">
            <Header activePage="analytics" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted h-full">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/assignment">概览</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/analytics">成绩分析</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{user.username}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ScrollArea className="w-full h-full flex flex-col gap-8">
                    <div className="w-full h-full flex flex-col gap-8 mb-24">

                        <div className="grid gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
                            <Card className=" h-full">
                                <CardHeader>
                                    <CardTitle>{reformatedRecord.length}/{myAssignments.length}</CardTitle>
                                    <CardDescription>作业完成数</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className=" h-full">
                                <CardHeader>
                                    <CardTitle>{minutes} min</CardTitle>
                                    <CardDescription>总练习时长</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className=" h-full">
                                <CardHeader>
                                    <CardTitle>{averageScore.toFixed(1)} </CardTitle>
                                    <CardDescription>平均分</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className=" h-full">
                                <CardHeader>
                                    <CardTitle>{userRank}/ {orgRecords.length}</CardTitle>
                                    <CardDescription>班级排名</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="h-full col-span-2">
                            <CardHeader className="w-full text-center">
                                    <CardDescription className="text-center w-full">五維能力模型</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ReportRadar data={radarData} />
                                </CardContent>

                            </Card>
                            <Card className="h-full col-span-2">
                            <CardHeader className="w-full text-center">
                                    <CardDescription className="text-center w-full">智能建議</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm">
                                        {advice}
                                    </div>
                                </CardContent>

                            </Card>


                            <Card className="col-span-4 h-full">
                                <CardHeader className="flex flex-row items-center">
                                    <div className="grid gap-2">
                                        <CardTitle>练习记录</CardTitle>
                                        <CardDescription>
                                            仅统计最近3个月的记录
                                        </CardDescription>
                                    </div>
                                    <div className="ml-auto flex flex-row gap-2">
                                        {/* <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
                                    <Link href="#">
                                        查看全部
                                    </Link>
                                </Button> */}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <DataTable columns={columns} data={reformatedRecord} />
                                </CardContent>

                            </Card>

                        </div>
                    </div>
                </ScrollArea>


            </main>
        </div>
    )
}