'use server'
import { Header } from "@/components/dashboard-nav";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, Table } from "@/components/ui/table";
import { getAllRecordsByUserId, getLatestRecordsByUserId, getOrgAssignments, getOrgStudents, getRecordsByOrgId, getRecordsForAssignment } from "@/lib/action/mongoIO";
import { reformatRecords } from "@/lib/dashboard";
import { calculateAverageScore, findLowestScoreDoc, findHighestScoreDoc, hoursUntil, Score2Grade, getFullName } from "@/lib/tools";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { DollarSign, Users, CreditCard, ChevronLeft } from "lucide-react";
import { columns } from "./columns"
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
import { Type2Tag, typeMap } from "@/lib/db/db";
import { random } from "lodash";
import { MyChart } from "./bar-chart";


interface OrgData {
    orgId: string,
    orgName: string,
    RecordCount: number,
    AverageScore: number,
    WeakestType: string,
    TotalDuration: number,

}

export default async function AdminPage() {

    const orgList = [
        {
            id: 'org_2kuwhBnHqigXKCMbO103v9Ib6pa',
            name: '601'
        },
        {
            id: 'org_2kuwnjRIs435tZsJ0PbbMm1DrRo',
            name: '602603'
        },
        {
            id: 'org_2kuwp6wVnjRo8wGQ4rxGDcGrh5X',
            name: '604605'
        }
    ]
    // await getOrgStudents
    const orgData: OrgData[] = await Promise.all(
        orgList.map(async (org) => {
            const orgRecords = await getRecordsByOrgId(org.id)

            // 计算记录总数
            const RecordCount = orgRecords.length

            // 计算平均分
            const AverageScore = calculateAverageScore(orgRecords)

            // 计算最弱类型
            const typeScores = orgRecords.reduce((acc: any, record: any) => {
                if (!acc[record.type]) {
                    acc[record.type] = { total: 0, count: 0 }
                }
                acc[record.type].total += record.score
                acc[record.type].count += 1
                return acc
            }, {})

            const WeakestType = Object.entries(typeScores).reduce((min: any, [type, data]: any) => {
                const average = data.total / data.count
                return !min || average < min.average ? { type, average } : min
            }, null)?.type || ''

            // 计算总时长
            const durationMap = {
                'write': 180,
                'dictation': 180,
                'scenario': 300,
                'reading': 180,
                'repeat': 120,
                'word': 120,
                'talkabout': 300,
            }
            const TotalDuration = orgRecords.reduce((acc: number, record: any) => {
                return acc + (durationMap[record.type as keyof typeof durationMap] || 0)
            }, 0)

            return {
                orgId: org.id,
                orgName: org.name,
                RecordCount,
                AverageScore,
                WeakestType,
                TotalDuration,
            }
        })
    )






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
                            <BreadcrumbLink href="/dashboard/analytics">校园数据看板</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{'TBDS'}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ScrollArea className="w-full h-full flex flex-col gap-8">
                    <div className="w-full h-full flex flex-col gap-8 mb-24">
                        <div className="grid gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
                            <Card className="h-full col-span-2">
                                <CardContent>
                                    <MyChart data={orgData} dataKey="RecordCount" />
                                </CardContent>
                                <CardHeader className="w-full text-center">
                                    <CardDescription className="text-center w-full">完成数对比</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="h-full col-span-2">
                                <CardContent>
                                    <MyChart data={orgData} dataKey="AverageScore" />
                                </CardContent>
                                <CardHeader className="w-full text-center">
                                    <CardDescription className="text-center w-full">平均分对比</CardDescription>
                                </CardHeader>
                            </Card>
                            <Card className="h-full col-span-2 grid grid-cols-3">
                                {orgData.map(org =>
                                    <Card key={org.orgId}>
                                        <CardHeader>
                                            <CardTitle>
                                                {org.WeakestType}
                                            </CardTitle>
                                            <CardDescription>
                                                {org.orgName}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>


                                )}

                            </Card>
                        </div>
                    </div>
                </ScrollArea>


            </main>
        </div>
    )
}