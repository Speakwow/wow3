'use client'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Score2Grade, adjustScore } from "@/lib/tools";
import { Separator } from "@/components/ui/separator";


export function DictationReport({ threadRecord }: { threadRecord: any[] }) {
    const router = useRouter()
    // 统计isCorrect的数量
    const correctCount = threadRecord.filter(record => record.isCorrect).length;
    const score = (correctCount / threadRecord.length) * 100;
    // 提取isCorrect == false的对象构成array
    const incorrectRecords = threadRecord.filter(record => !record.isCorrect);
    return (
        <Card className="p-4 min-w-[400px]">
            <CardHeader className="flex justify-center items-center">
                <div className='text-center text-xl'>
                    You did it！本次得分
                </div>
            </CardHeader>
            <CardContent>
                <div className='flex flex-col'>
                    <div className='text-center text-[#42C83C] text-6xl font-bold'>
                        {score.toFixed(0)}
                    </div>
                </div>
                <div className='grid grid-cols-2 text-center gap-4 py-6'>
                    <div className='flex flex-col'>
                        <div>
                            已学单词
                        </div>
                        <div className='text-5xl font-bold'>
                            {threadRecord.length}
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <div>
                            共答对
                        </div>
                        <div className=' text-primary text-5xl font-bold'>
                            {correctCount}
                        </div>
                    </div>
                    <div className='col-span-2 flex flex-col'>
                        <Separator className="my-4"/>
                        <div>
                            错题记录
                        </div>
                        <div className='text-red-500 text-xl font-bold flex flex-wrap items-center justify-center'>
                            {incorrectRecords.map((record, index) => (
                                <div key={index} className="text-center px-2">
                                    {record.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 py-4">
                <Button onClick={() => router.push('/')}  className="bg-[#42C83C]  rounded-full">
                    完成练习
                </Button>
                <Button onClick={() => window.location.reload()}  variant="secondary" className=" rounded-full">
                    再次挑战
                </Button>
            </CardFooter>
        </Card>
    )
}


