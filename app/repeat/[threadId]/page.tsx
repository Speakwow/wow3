
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getRepeatPageByIndex, getRepeatThreadById } from '@/lib/action/mongoIO'


export default async function Repeat({ params }: { params: { threadId: string } }) {

    // const section = await kv.hgetall('repeatPage@' +params.bookid + ':' params.id) as unknown as RepeatPage
    const thread = await getRepeatThreadById(params.threadId)
    if (thread) {
        redirect(`/repeat/${params.threadId}/1`)
    }
}