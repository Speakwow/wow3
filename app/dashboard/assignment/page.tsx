
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Header } from "@/components/dashboard-nav"
import { getOrgStudents, getTextbookData } from "@/lib/action/mongoIO"
import { auth } from "@clerk/nextjs/server"
import { AssignmentRow, AssignmentRowLoading } from "./dataRow"
import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { kv } from "@vercel/kv"


export default async function Plan() {
    const today = new Date()
    const { userId, orgId, has } = auth();
    if (!orgId) {
        redirect('/')
    }
    if (!has({ role: "org:admin" })) {
        redirect('/404/unauthoried')
    }
    const textbookId = await kv.hget('org:'+orgId,"textbook") as string
    if(!textbookId){
        redirect('/dashboard/textbook')
    }
    const [data, studentIds] = await Promise.all([getTextbookData(textbookId), getOrgStudents(orgId as string)])

    return (
        <div className="flex h-screen w-full flex-col bg-muted">
            <ScrollArea className="h-full">
                <Header activePage="assignment" />
                <main className="flex flex-1 flex-col gap-2 p-4 md:gap-8 md:p-8 ">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>概览</BreadcrumbPage>
                            </BreadcrumbItem>

                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <Card className="col-span-4 h-full">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>
                                        {data?.name ?? '无课程'}
                                        </CardTitle>
                                    <CardDescription>
                                        课程导览
                                    </CardDescription>
                                </div>
                                <div className="ml-auto flex flex-row gap-2">
                                    <Button asChild size="sm" className="ml-auto gap-1" variant="outline">
                                    <Link href="/dashboard/textbook">
                                        更改教材
                                    </Link>
                                </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                单元
                                            </TableHead>
                                            <TableHead>
                                                作业
                                            </TableHead>
                                            <TableHead>
                                                类型
                                            </TableHead>
                                            <TableHead>
                                                状态
                                            </TableHead>
                                            <TableHead>
                                                截止日期
                                            </TableHead>
                                            <TableHead className="text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {data ?
                                            data.units.map((unit: { unit: number, lessons: any[] }) => {
                                                return unit.lessons.map(
                                                    lesson => {
                                                        if (lesson.data) {
                                                            return (
                                                                <Suspense key={lesson.type+lesson.id} fallback={
                                                                    <AssignmentRowLoading
                                                                        unit={unit.unit}
                                                                        name={lesson.data.name}
                                                                        type={lesson.type}
                                                                        threadId={lesson.id}
                                                                        orgId={orgId as string}
                                                                        studentIds={studentIds}
                                                                        textbookId={textbookId}
                                                                        userId={userId as string}
                                                                    />}>

                                                                    <AssignmentRow
                                                                        unit={unit.unit}
                                                                        name={lesson.data.name}
                                                                        type={lesson.type}
                                                                        threadId={lesson.id}
                                                                        orgId={orgId as string}
                                                                        studentIds={studentIds}
                                                                        textbookId={textbookId}
                                                                        userId={userId as string}
                                                                    />
                                                                </Suspense>
                                                            )
                                                        }
                                                        return null
                                                    }
                                                )
                                            })
                                            :
                                            <div className="p-4">
                                                暂无数据
                                            </div>

                                        }

                                    </TableBody>

                                </Table>
                            </CardContent>

                        </Card>





                    </div>
                </main>
            </ScrollArea>
        </div>
    )
}


