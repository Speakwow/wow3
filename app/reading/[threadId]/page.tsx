import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getReadingById, getRepeatById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'
import RepeatText from './reading'
import { Badge } from '@/components/ui/badge'
import { connect } from '@/lib/mongo'
import { DB } from '@/lib/constant'
import Reading from './reading'


export async function generateStaticParams() {
    const mongo = await connect()
    const [repeats,] = await Promise.all([
        mongo.db(DB).collection('repeats').find().toArray(),

    ])
    return repeats.map((repeat) => (
        {
            threadId: repeat._id.toString(),
        }
    ))
}

export default async function ReadingPage({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    // const section = await kv.hgetall('repeatPage@' +params.bookid + ':' params.id) as unknown as RepeatPage
    const reading_data = await getReadingById(params.threadId)

    let bg_url
    if (reading_data && reading_data.background) {
        bg_url = reading_data.background ?? 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/7287e3e4-1f5d-403f-e878-9fe8ca213d00/public'
    } else {
        bg_url = 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/7287e3e4-1f5d-403f-e878-9fe8ca213d00/public'
    }
    const bgImage = {
        // 设置背景图片
        backgroundImage: `url(${bg_url})`,
        // 设置背景图片放缩方式为cover，使其自动放缩填充div
        backgroundSize: 'cover'
    };



    if (!reading_data || !reading_data.name) {
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
        <div className='flex w-full h-full relative p-2 gap-12 bg-muted'>
            <Card style={bgImage} className="relative overflow-hidden w-full h-full flex rounded-[20px]" >
                <div className='w-full h-full flex flex-col gap-4 items-center mt-2'>
                    <div className="relative w-full flex items-center justify-center">
                        <Button asChild size="icon" variant="outline" className='absolute left-2 top-0'>
                            <Link href="/">
                                <ChevronLeft />
                            </Link>
                        </Button>
                        <Badge className='max-w-[250px] truncate overflow-hidden font-medium text-sm md:text-md h-10 bg-white/75 backdrop-blur px-4' variant="secondary"> {reading_data.name}</Badge >
                    </div>
                    <div className='w-full h-full'>
                        <Reading thread={JSON.parse(JSON.stringify(reading_data))} userId={userId as string} threadId={params.threadId} />
                    </div>
                </div>
            </Card>
        </div>

    )
}