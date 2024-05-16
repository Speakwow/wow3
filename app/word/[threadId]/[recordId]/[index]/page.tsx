import RepeatText from './text'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { finishWordRecord, getRepeatPageByIndex, getWordPageByIndex } from '@/lib/action/mongoIO'
import { RepeatReport } from '@/components/report'

interface RepeatBook {
    name: string,
    pages: string[]
}

interface RepeatPage {
    book: string, //从属的 book 对象名称
    index: string, //页码
    text: string,
    image_url: string,
}


export default async function Repeat({ params }: { params: { threadId: string, index: string,lessonId:string,recordId:string } }) {

    const section = await getWordPageByIndex(params.threadId,+params.index)
    if (!section) {
        const {final_score,current,duration} = await finishWordRecord(params.recordId)

        return (
            <div className='bg-[] h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%'>
                <RepeatReport score={final_score} length={current?.record.length} duration={duration}/>
            </div>
        )
    }

    return (
        <div className='flex w-full h-screen relative p-20 gap-12 bg-[#FFD44C]'
        style={{ backgroundImage: `url('${section.image_url}')`,backgroundSize: 'cover'}}>
            <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>

            <div className='w-full flex flex-col items-center justify-center'>
            <div className='z-50 mt-20 h-full  max-w-96 gap-6'>
                <RepeatText text={section.text} index={section.index} info={section.symbol} recordId={params.recordId}/>
            </div>
            </div>
        </div>

    )
}