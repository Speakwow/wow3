import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getRepeatById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'
import RepeatText from './text'
import { Badge } from '@/components/ui/badge'


export default async function Repeat({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    // const section = await kv.hgetall('repeatPage@' +params.bookid + ':' params.id) as unknown as RepeatPage
    const repeat_data = await getRepeatById(params.threadId)
    if(!repeat_data||!repeat_data.content){
        return(
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
    return(
        <div className='flex w-full h-screen relative p-4 gap-12 bg-muted'>
            <div className="absolute top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>

            <div className='w-full flex flex-col items-center justify-center'>
                <Badge className='font-medium text-lg rounded-full px-8' variant="outline"> 跟读练习</Badge >
            <div className='z-50  h-full w-full gap-6 p-'>
                <RepeatText thread={repeat_data.content} userId={userId as string} threadId={params.threadId}/>
            </div>
            </div>
        </div>

    )
}