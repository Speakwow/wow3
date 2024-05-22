
import Talkabout from './text'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { finishRepeatRecord, getTalkaboutById } from '@/lib/action/mongoIO'
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


// const data = {
//     image_url:"https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/45500db1-cda0-4933-f9c3-b339edab4a00/public",
//     rule:"在接下来的环节中，你将看到一张图片，你需要使用连续不间断的英语描述图片中发生了什么，你可以描述图片中出现的人物、时间、地点、事件、物品。",
//     instruction:`小女孩先是在哪里、做什么？
//     然后小女孩去了哪里、做了什么？
//     小女孩做了什么好事，帮助了谁？
//     `,
//     prepare_time:180,
//     answer_time:30,
//     topic:`
//     Tell a story about a girl looked around her home and noticed she had many toys scattered everywhere, almost filling up the room. She thought to herself, "Maybe I don't need so many toys. I could give some of them to those in need." So, she grabbed a bag and started gathering up her old toys to donate. 
// The next day, she went to an orphanage and distributed her old toys to the children there. It‘s kind/compassionate/caring of the girl to donate her old toys to the children in the orphanage. The toys also found a better home.`    
// }

export default async function Page({ params }: { params: { threadId: string,recordId:string} }) {

    const data = await getTalkaboutById(params.threadId) as any

    return (
        <div className='flex w-full h-screen justify-center relative p-10 gap-12 bg-[#FFD44C]'>
            <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>
            <Talkabout image_url={data.image_url} intro={data.instruction} recordId={params.recordId} prepare_time={data.prepare_time} answer_time={data.answer_time} topic={data.title}/>
        </div>

    )
}