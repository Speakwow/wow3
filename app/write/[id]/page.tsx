import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeftIcon, Edit2Icon, SwitchCameraIcon } from "lucide-react";
import { createTalkaboutRecord, getRepeatPageByIndex, getTalkaboutById, getWriteById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea';
import { WriteForm } from './write';

export default async function Talkabout({ params }: { params: { id: string } }) {
    const { userId, orgId } = auth();

    const data = await getWriteById(params.id) as any
    // const recordId = await createTalkaboutRecord(params.threadId,userId as string)
    // if (thread) {
    //     redirect(`/talkabout/${params.threadId}/${recordId}`)
    // }
    // const recordId = '1'
    console.log(data.topic)
    return (
        <div className="relative w-full h-screen bg-muted">
            <ScrollArea className="h-full overflow-hidden">
                <div className="absolute top-2 left-2">
                    <Link href={"/"} className="z-10">
                        <Button size="icon" variant="outline">
                            <ArrowLeftIcon />
                        </Button>
                    </Link>
                </div>
                <div className="py-2 px-16 flex flex-col gap-4">
                    <Card className="p-6 h-fit relative">
                        <CardHeader className="text-2xl text-primary">
                            <CardTitle className=''>
                                写作练习
                            </CardTitle>
                            <CardDescription className=''>
                                <div>单词数：<div className='inline'>{data.word_count}</div> 词</div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='flex flex-col gap-2'>
                        <CardDescription>
                                题目
                            </CardDescription>
                            <div className='text-pretty whitespace-pre-line'>
                                {data.topic}
                            </div>
                        </CardContent>
                        {/* <div className='flex flex-col gap-2 text-left px-6'>
                            <CardDescription>
                                注意事项
                            </CardDescription>
                            <div>
                                {data.rule}
                            </div>
                        </div> */}
                    </Card>
                    <Card className="p-6 h-fit relative">
                        <WriteForm userId={userId as string} write={data} />
                    </Card>
                </div>
            </ScrollArea>
        </div>

    )
}