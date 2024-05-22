import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createTalkaboutRecord, getRepeatPageByIndex, getTalkaboutById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'

// const data = {
//     image_url:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/8947d447-2d0d-48c9-afa9-39b6c2884500/public",
//     rule:"在接下来的环节中，你将看到一张图片，你需要使用连续不间断的英语描述图片中发生了什么，你可以描述图片中出现的人物、时间、地点、事件、物品。",
//     instruction:`
//     - 小女孩先是在哪里、做什么\n
//     - 然后小女孩去了哪里、做了什么 \n
//     - 小女孩做了什么好事，帮助了谁\n
//     `,
//     prepare_time:180000,
//     answer_time:30000    
// }

export default async function Talkabout({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();

    const data = await getTalkaboutById(params.threadId) as any
    const recordId = await createTalkaboutRecord(params.threadId,userId as string)
    // if (thread) {
    //     redirect(`/talkabout/${params.threadId}/${recordId}`)
    // }
    // const recordId = '1'
    return(
        <div className='h-screen flex items-center justify-center p-10 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%'>
            <Card className='md:w-1/2 xs:w-full p-4'>
                <CardHeader>
                    <CardTitle className='text-center text-4xl p-6 font-bold text-[#42C83C]'>
                        看图说话
                    </CardTitle>
                    <CardDescription className='text-center text-xl flex flex-row justify-center gap-8'>
                        <div>准备时间：<span className='text-[#42C83C] text-4xl'>{data.prepare_time}</span> 秒</div>   <div>练习时间：<span className='text-[#42C83C] text-4xl'>{data.answer_time}</span> 秒</div>  
                    </CardDescription>
                </CardHeader>
                <CardContent className='text-xl'>
                    {data.rule}
                </CardContent>
                <CardFooter className='p-6 flex justify-center'>
                    <Link href={`/talkabout/${params.threadId}/${recordId}`}>
                    <Button size="lg" className='px-12 py-6 rounded-full text-2xl bg-[#42C83C]'>
                        开始练习
                        </Button>
                        </Link>
                </CardFooter>
            </Card>
        </div>

    )
}