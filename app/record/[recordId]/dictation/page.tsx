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
import { connect, connectCore } from "@/lib/mongo";
import { DB, DB_CORE } from "@/lib/constant";
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/nextjs/server";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getChineseName } from "@/lib/tools";



export default async function RecordInfo({ params }: { params: { recordId: string } }) {

    // 连接到MongoDB数据库
    const client = await connect()
    const core = await connectCore()

    // 从dictation_records集合中查找指定ID的记录
    const record = await client
        .db(DB)
        .collection('dictation_records')
        .findOne({ _id: new ObjectId(params.recordId) })
    
    // 如果记录不存在，重定向到404页面
    if (record === null) return redirect('/404')

    // 并行获取听写练习线程和用户信息
    const [thread, user] = await Promise.all([
        // 从dictation_threads集合中查找对应的听写练习线程
        core
            .db(DB_CORE)
            .collection('dictation_threads')
            .findOne({ _id: new ObjectId(record.threadId as string) }),
        // 获取用户信息
        clerkClient()
            .users
            .getUser(record.userId)
    ])
    // 获取学生中文名，如果不存在则使用默认名称
    const stuName = getChineseName(user) ?? '未命名用户'


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
                                <CardTitle className="text-md ">课程名称</CardTitle>
                                <CardDescription className="text-xs">
                                    听写练习
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-xl font-bold tabular-nums leading-none text-primary">
                                    {thread?.name ?? '未命名课程'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="w-full h-fit pb-2 border-primary">
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-md ">总分</CardTitle>
                                <CardDescription className="text-xs">
                                    Overall
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-0 mt-2">
                                <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none text-primary">
                                    {record?.score}
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                    <div className="pt-6 h-screen w-full">
                        <Card className="h-fit w-full">
                            <CardHeader className="p-4 pb-6">
                                <CardTitle className="text-lg font-bold">{stuName}</CardTitle> 
                                <CardDescription className="text-xs">
                                    听写练习 - 详细分析
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>单词</TableHead>
                                        <TableHead>学生回答</TableHead>
                                        <TableHead>是否正确</TableHead>

                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {record?.record.map((item: any, index: any) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-md max-w-64 ">{item.text}</TableCell>
                                            <TableCell className="text-md max-w-64 text-muted-foreground">{item.input}</TableCell>
                                            <TableCell className={`text-lg font-bold text-primary ${item.isCorrect ? "text-green-500" : "text-red-500"}`}>{item.isCorrect ? "正确" : "错误"}</TableCell>
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