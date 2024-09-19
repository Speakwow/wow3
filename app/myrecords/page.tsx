'use server'
import { Header } from "@/components/student-nav";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { TableHeader, TableRow, TableHead, TableBody, Table } from "@/components/ui/table";
import { getAllRecordsByUserId, getOrgStudents, getRecordsForAssignment } from "@/lib/action/mongoIO";
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
import { Separator } from "@/components/ui/separator";


export default async function MyRecords() {
    const { userId, orgId } = auth();
    if (!userId) {
        return (
            <div>
                Unauthorized
            </div>
        )
    }
    const records = await getAllRecordsByUserId(userId)
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


    return (
        <div className="flex h-full w-full flex-col">
            <Header activePage="myrecords" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted h-full">
                {/* <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard/assignment">概览</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{assignmentData.info.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb> */}

                    <div className="w-full h-full flex flex-col gap-8 ">

                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">


                            <Card className="col-span-4 h-full">
                                <CardHeader className="flex flex-row items-center">
                                    <div className="grid gap-2">
                                        <CardTitle>练习记录</CardTitle>
                                        <CardDescription>
                                            每种类型仅统计最近10次记录
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
                        <div className="flex flex-col gap-4 py-4">
                                    <Separator/>
                                    <div className="text-center text-xs text-muted-foreground">我也是有底线的～</div>
                                </div>
                    </div>


            </main>
        </div>
    )
}