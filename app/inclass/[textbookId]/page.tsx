
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
import { Header } from "@/components/student-nav"
import { getOrgStudents, getTextbookData } from "@/lib/action/mongoIO"
import { auth } from "@clerk/nextjs/server"
import {  TextbookLoading, TextbookRow } from "./dataRow"
import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { redirect } from "next/navigation"


export default async function InClassPlan({params}:{params:{textbookId:string}}) {
    const today = new Date()
    const { userId, has } = auth();
    const textbookId = params.textbookId
    const data = await getTextbookData(textbookId)

    return (
        <div className="flex h-screen w-full flex-col bg-muted">
            <ScrollArea className="h-full">
                <Header activePage="inclass" />
                <main className="flex flex-1 flex-col gap-2 p-4 md:gap-8 md:p-8 ">
                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                        <Card className="col-span-4 h-full">
                            <CardHeader className="flex flex-row items-center">
                                <div className="grid gap-2">
                                    <CardTitle>{data?.name ?? '无课程'}</CardTitle>
                                    <CardDescription>
                                        当前课程
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
                                                成绩
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
                                                                <Suspense key={lesson.id} fallback={
                                                                    <TextbookLoading
                                                                        unit={unit.unit}
                                                                        name={lesson.data.name}
                                                                        type={lesson.type}
                                                                        threadId={lesson.id}
                                                                        textbookId={textbookId}
                                                                        userId={userId as string}
                                                                    />}>
                                                                    <TextbookRow
                                                                        unit={unit.unit}
                                                                        name={lesson.data.name}
                                                                        type={lesson.type}
                                                                        threadId={lesson.id}
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


