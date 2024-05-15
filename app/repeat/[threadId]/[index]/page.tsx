import RepeatText from './text'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getRepeatPageByIndex } from '@/lib/action/mongoIO'

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


export default async function Repeat({ params }: { params: { threadId: string, index: string,lessonId:string } }) {

    const section = await getRepeatPageByIndex(params.threadId,+params.index)
    if (!section) {
        redirect('/chat')
    }

    return (
        <div className='flex md:flex-row flex-col w-full h-screen relative p-20 gap-12 bg-[#FFD44C]'>
            <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>
            <Card className='relative bg-cover min-h-48 bg-center h-full flex-1 border-8 border-white rounded-[50px] w-min-48' style={{ backgroundImage: `url('${section.image_url}')` }}>
            </Card>
            <div className='relative flex flex-col h-full justify-between min-w-96 gap-6 w-1/2'>
                <RepeatText text={section.text} index={section.index} />
            </div>
        </div>

    )
}