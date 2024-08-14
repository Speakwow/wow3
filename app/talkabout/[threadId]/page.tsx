import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createTalkaboutRecord, getRepeatPageByIndex, getTalkaboutById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'
import { connect } from '@/lib/mongo'
import { DB } from '@/lib/constant'

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
// export async function generateStaticParams() {
//     const mongo = await connect()
//     const [datas, ] = await Promise.all([
//       mongo.db(DB).collection('talkabouts').find().toArray(),
  
//     ])
//     return datas.map((data) => (
//         {
//           threadId: data._id.toString(),
//         }
//       ))
//   }
  


export default async function Talkabout({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();

    const [data,recordId ] = await Promise.all([getTalkaboutById(params.threadId) ,createTalkaboutRecord(params.threadId, userId as string)])
    // if (thread) {
    //     redirect(`/talkabout/${params.threadId}/${recordId}`)
    // }
    // const recordId = '1'
    return (
        <div className='relative h-full flex items-center justify-center p-4 bg-muted'>
            <div className="absolute top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>
            <Card className='w-fit  p-2'>
                <CardHeader>
                    <CardTitle className='text-center text-2xl p-2 font-bold text-[#42C83C]'>
                        看图说话
                    </CardTitle>
                    <CardDescription className='text-center  flex flex-col md:flex-row justify-center gap-2 md:gap-8'>
                        <div>准备时间：<span className='text-[#42C83C] text-2xl'>{data?.prepare_time}</span> 秒</div>   <div>练习时间：<span className='text-[#42C83C] text-2xl'>{data?.answer_time}</span> 秒</div>
                    </CardDescription>
                </CardHeader>
                <CardContent className=''>
                    {data?.rule}
                </CardContent>
                <CardFooter className='p-4 flex justify-center'>
                    <Link href={`/talkabout/${params.threadId}/${recordId}`}>
                        <Button size="lg" className='px-12 py-6 rounded-full text-xl bg-[#42C83C]'>
                            开始练习
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>

    )
}