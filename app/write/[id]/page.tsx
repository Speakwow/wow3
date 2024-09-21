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
import { connect } from '@/lib/mongo';
import { DB } from '@/lib/constant';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

export async function generateStaticParams() {
    const mongo = await connect()
    const [writes, ] = await Promise.all([
      mongo.db(DB).collection('writes').find().toArray(),
  
    ])
    return writes.map((write) => (
        {
          id: write._id.toString(),
        }
      ))
  }
  


export default async function Write({ params }: { params: { id: string } }) {
    const { userId, orgId } = auth();

    const data = await getWriteById(params.id) as any
    // const recordId = await createTalkaboutRecord(params.threadId,userId as string)
    // if (thread) {
    //     redirect(`/talkabout/${params.threadId}/${recordId}`)
    // }
    // const recordId = '1'
    return (
        <div className="relative w-full h-full bg-muted p-2">
                <div className='flex flex-col md:flex-row gap-2 w-full mb-24'>
                    <div className=" ">
                        <Link href={"/"} className="z-10">
                            <Button size="icon" variant="outline">
                                <ArrowLeftIcon />
                            </Button>
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2 w-full pr-2">
                        <Card className=" h-fit relative w-full">
                            <CardHeader className="text-2xl text-primary">
                                <CardTitle className=''>
                                    {data.name}
                                </CardTitle>
                                <CardDescription className=''>
                                    <div>单词数：<div className='inline'>{data.word_count}</div> 词</div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='flex flex-col gap-2'>
                                <CardDescription>
                                    题目
                                </CardDescription>
                                <div className='text-pretty whitespace-pre-line text-sm'>
                                    {data.topic}
                                </div>
                                {
                                    data.image_url&&
                                    <div>
                                        <Image 
                                        src={data.image_url} 
                                        alt=''
                                        width={450}
                                        height={300}
                                        objectFit='cover' />
                                    </div>
                                }
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
                        <div className='flex flex-col gap-4 w-full py-4 text-center'>
                            <Separator />
                            <div className='text-xs text-muted-foreground'>我也是有底线的～</div>
                            
                        </div>
                    </div>
                </div>
        </div>

    )
}