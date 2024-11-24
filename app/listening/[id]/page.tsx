import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeftIcon, Edit2Icon, SwitchCameraIcon } from "lucide-react";
import {  getListeningById, getTranslationById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'

import { ListeningForm } from './listening';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

  


export default async function Listening({ params }: { params: { id: string } }) {
    const { userId, orgId } = auth();

    const data = await getListeningById(params.id) as any
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
                                    <div>{`请仔细聆听录音，并回答以下问题。请注意，该录音只播放一次。点击按钮，开始播放录音。`}</div>
                                </CardDescription>
                            </CardHeader>

                            {/* <div className='flex flex-col gap-2 text-left px-6'>
                            <CardDescription>
                                注意事项
                            </CardDescription>
                            <div>
                                {data.rule}
                            </div>
                        </div> */}
                        <CardContent>

                            <ListeningForm userId={userId as string} listening={data} />
                            </CardContent>
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