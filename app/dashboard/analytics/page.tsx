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


export default async function AssginmentInfo() {
    const { userId, orgId } = auth();
    if (!orgId || !userId) {
        return (
            <div>
                Unauthorized
            </div>
        )
    }
    const studentIds = await getOrgStudents(orgId)
    const students = await Promise.all(studentIds.map(async id => {
        const user = await clerkClient().users.getUser(id)
        return { userId: id, username:  getFullName(user) ?? '-' }
    }))


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
                            <BreadcrumbPage>{'成绩分析'}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ScrollArea className="w-full h-full flex flex-col gap-8">
                    <div className="w-full h-full flex flex-col gap-8 mb-24">


                        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">


                            <Card className="col-span-4 h-full">
                                <CardHeader className="flex flex-row items-center">
                                    <div className="ml-auto flex flex-row gap-2">
                                        {/* <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
                                    <Link href="#">
                                        查看全部
                                    </Link>
                                </Button> */}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <DataTable columns={columns} data={students} />
                                </CardContent>

                            </Card>

                        </div>
                    </div>
                </ScrollArea>


            </main>
        </div>
    )
}