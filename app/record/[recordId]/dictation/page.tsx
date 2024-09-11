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



export default async function RecordInfo({ params }: { params: { recordId: string } }) {


    const mongo = await connect()

    let record;
    let thread;
    let assignmentName: string = '';
    let overallScore: any[] = [];
    let detailScore: any[][] = [];
    let stuName = '未命名用户'

    try {

        const database = mongo.db(DB);
        const records = database.collection('dictation_records');
        record = await records.findOne({ _id: new ObjectId(params.recordId) })

        if (record !== null) {
            const threads = database.collection('dictation_threads');
            const exthreadId = record.threadId as string
            const userId = record.userId as string
            try {
                const user = await clerkClient().users.getUser(userId)
                stuName = user.fullName ?? 'Null'
            } catch (error) {

            }

            thread = await threads.findOne({ _id: new ObjectId(exthreadId) });
            if (thread !== null) {
                assignmentName = thread.name;
            }


    
        }

    } catch (error) {
        
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
                                    听写练习
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
                                    {record?.score}
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                    <div className="pt-6 h-screen w-full">
                        <Card className="h-fit w-full">
                            <CardHeader className="p-4 pb-6">
                                <CardTitle className="text-lg font-bold">{stuName}</CardTitle> {/* 學生名稱 */}
                                <CardDescription className="text-xs">
                                    听写练习 - 詳細分析
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>單詞</TableHead>
                                        <TableHead>學生回答</TableHead>
                                        <TableHead>是否正確</TableHead>

                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {record?.record.map((item:any, index:any) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-md max-w-64 ">{item.text}</TableCell>
                                            <TableCell className="text-md max-w-64 text-muted-foreground">{item.input}</TableCell>
                                            <TableCell className={`text-lg font-bold text-primary ${item.isCorrect?"text-green-500":"text-red-500"}`}>{item.isCorrect?"正確":"錯誤"}</TableCell>

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