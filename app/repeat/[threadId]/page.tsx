import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getRepeatById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'
import RepeatText from './text'
import { Badge } from '@/components/ui/badge'
import { connect } from '@/lib/mongo'
import { DB } from '@/lib/constant'


export async function generateStaticParams() {
    const mongo = await connect()
    const [repeats, ] = await Promise.all([
      mongo.db(DB).collection('repeats').find().toArray(),
  
    ])
    return repeats.map((repeat) => (
        {
          threadId: repeat._id.toString(),
        }
      ))
  }

export default async function Repeat({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    // const section = await kv.hgetall('repeatPage@' +params.bookid + ':' params.id) as unknown as RepeatPage
    const repeat_data = await getRepeatById(params.threadId)

    let bg_url
    if(repeat_data&&repeat_data.background){
    bg_url = repeat_data.background ?? 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/7287e3e4-1f5d-403f-e878-9fe8ca213d00/public'
    }else{
        bg_url='https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/7287e3e4-1f5d-403f-e878-9fe8ca213d00/public'
    }
    const bgImage = {
        // 设置背景图片
        backgroundImage: `url(${bg_url})`,
        // 设置背景图片放缩方式为cover，使其自动放缩填充div
        backgroundSize: 'cover'
    };



    if (!repeat_data || !repeat_data.content) {
        return (
            <div className='flex w-full h-screen relative p-4 gap-12 bg-muted'>
                <div className="absolute top-2 left-2">
                    <Button asChild size="icon" variant="outline">
                        <Link href="/">
                            <ChevronLeft />
                        </Link>
                    </Button>
                </div>

                <div className='w-full flex flex-col items-center justify-center gap-8'>
                    <Badge className='font-medium text-lg rounded-full px-8' variant="outline">
                        404 当前课程不存在
                    </Badge >
                    <Button>
                        <Link href='/'>
                            返回首页
                        </Link>
                    </Button>

                </div>
            </div>

        )
    }
    return (
        <div className='flex w-full h-full relative p-2  gap-12 bg-muted'>
            <Card style={bgImage} className="relative w-full flex rounded-[20px]" >
                <div className="absolute top-2 left-2">
                    <Button asChild size="icon" variant="outline">
                        <Link href="/">
                            <ChevronLeft />
                        </Link>
                    </Button>
                </div>
                <div className='w-full h-full flex flex-col gap-4 items-center justify-center mt-4'>
                    <Badge className='font-medium text-lg rounded-full px-8' variant="secondary"> 跟读练习</Badge >
                    <div className='z-50  h-full w-full '>
                        <RepeatText thread={repeat_data.content} userId={userId as string} threadId={params.threadId} />
                    </div>
                </div>
            </Card>
        </div>

    )
}