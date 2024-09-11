import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getDictationById} from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'
import RepeatText from './text'
import { Badge } from '@/components/ui/badge'
import { connect } from '@/lib/mongo'
import { DB } from '@/lib/constant'





export default async function WordRepeat({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    const thread = await getDictationById(params.threadId) as any
    // 将thread.content数组打乱顺序
    const shuffledContent = thread.content.sort(() => Math.random() - 0.5);
    // 更新thread对象,使用打乱后的内容
    thread.content = shuffledContent;

    const bg_url = thread.background ?? 'https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/7287e3e4-1f5d-403f-e878-9fe8ca213d00/public'
    const bgImage = {
        // 设置背景图片
        backgroundImage: `url(${bg_url})`,
        // 设置背景图片放缩方式为cover，使其自动放缩填充div
        backgroundSize: 'cover'
    };



    if (!thread || !thread.content) {
        return (
            <div className='flex w-full h-full relative p-2 md:p-4 gap-12 bg-muted'>
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
            <Card style={bgImage} className="relative w-full flex  h-full rounded-[20px]" >
                <div className="absolute top-2 left-2">
                    <Button asChild size="icon" variant="outline">
                        <Link href="/">
                            <ChevronLeft />
                        </Link>
                    </Button>
                </div>
                <div className='w-full flex flex-col items-center justify-center mt-4'>
                    <Badge className='font-medium text-lg rounded-full px-8 ring-white/25 ring-2' variant="default">单词听写</Badge >
                    <div className='z-50  h-full w-full gap-6 '>
                        <RepeatText thread={JSON.parse(JSON.stringify(thread.content))} userId={userId as string} threadId={params.threadId} />
                    </div>
                </div>
            </Card>
        </div>

    )
}