

import { cn } from '@/lib/utils'

import { kv } from '@vercel/kv'
import RepeatText from './text'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getCharacterById, getRepeatPageByIndex,getStoryPageByIndex } from '@/lib/action/mongoIO'
import Image from 'next/image'

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


export default async function StoryPage({ params }: { params: { threadId: string, index: string,lessonId:string,characterId:string} }) {

    const section = await getStoryPageByIndex(params.threadId,+params.index)
    const characterDoc = await getCharacterById("6678f331182bc3734a14d856") as any
    const character = JSON.parse(JSON.stringify(characterDoc))

    if (!section) {
        redirect(`/`)
    }
    const bgImage = {
        // 设置背景图片
        backgroundImage: "url('/story_bg.png')",
        // 设置背景图片放缩方式为cover，使其自动放缩填充div
        backgroundSize: 'cover'
      };

    return (
        <div className='flex md:flex-row flex-col h-screen bg-muted relative  px-12 py-2 md:gap-12 gap-6' style={bgImage}>
            <div className="absolute top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>
            <div className='grid grid-cols-3 gap-4'>
            <Card className='w-full col-span-2 relative min-h-48 bg-center h-full flex-1 border-8 border-white rounded-[50px]'>
                <Image fill objectFit='cover' className='rounded-[50px]' src={section.image_url} alt="Loading..."/>
            </Card>
            <div className='relative  w-full flex flex-col h-full justify-between items-center  gap-6 '>
                <RepeatText text={section.text} index={section.index} character={character}/>
            </div>
            </div>
        </div>

    )
}