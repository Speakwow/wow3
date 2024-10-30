'use server'
import { Header } from "@/components/dashboard-nav";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, Table } from "@/components/ui/table";
import { getOrgStudents, getRecordsForAssignment } from "@/lib/action/mongoIO";
import { reformatRecords } from "@/lib/dashboard";
import { calculateAverageScore, findLowestScoreDoc, findHighestScoreDoc, hoursUntil, getFullName } from "@/lib/tools";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { DollarSign, Users, CreditCard, ChevronLeft } from "lucide-react";
import { AssignmentRecord, columns } from "./columns"
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


export default async function AssginmentInfo({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    if (!orgId || !userId) {
        return (
            <div>
                Unauthorized
            </div>
        )
    }
    const studentIds = await getOrgStudents(orgId)
    const assignmentData = await getRecordsForAssignment(params.threadId, orgId, studentIds)
    const records = assignmentData.records
    const averageScore = calculateAverageScore(records);
    const lowestScoreDoc = findLowestScoreDoc(records);
    const highestScoreDoc = findHighestScoreDoc(records);
    let bestUser, worstUser
    if (records.length > 0) {
        bestUser = await clerkClient().users.getUser(highestScoreDoc?.userId as string);
        worstUser = await clerkClient().users.getUser(lowestScoreDoc?.userId as string);
    } else {
        bestUser = { username: '-' }
        worstUser = { username: '-' }
    }
    let hoursleft = hoursUntil(assignmentData.endAt)
    if (hoursleft < 0) {
        hoursleft = 0
    } else {
        hoursleft = +hoursleft.toFixed(0)
    }

    const data = await reformatRecords(records, studentIds, assignmentData.type)
    return (
        <div className="flex h-full w-full flex-col">
            <Header activePage="assignment" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted h-full">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/assignment">概览</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{assignmentData.info?.name ?? ''}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ScrollArea className="w-full h-full flex flex-col gap-8">
                    <div className="w-full h-full flex flex-col gap-8 mb-24">
                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        本次作业均分
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold"> {averageScore.toFixed(1)}</div>
                                    <p className="text-xs text-muted-foreground">

                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        本次作业最高分
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{highestScoreDoc?.score.toFixed(1)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        学生：{ getFullName(bestUser)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">本次作业最低分</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{lowestScoreDoc?.score.toFixed(1)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        学生：{getFullName(worstUser)}
                                    </p>
                                </CardContent>
                            </Card>

                        </div>

                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">


                            <Card className="col-span-4 h-full">
                                <CardHeader className="flex flex-row items-center">
                                    <div className="grid gap-2">
                                        <CardTitle>{assignmentData.info?.name ?? ''}</CardTitle>
                                        <CardDescription>
                                            成绩详情
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
                                    <DataTable columns={columns} data={data} />
                                </CardContent>

                            </Card>

                        </div>
                    </div>
                </ScrollArea>


            </main>
        </div>
    )
}