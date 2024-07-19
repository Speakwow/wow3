import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createRepeatRecord, getRepeatPageByIndex, getRepeatThreadById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'


export default async function Repeat({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    // const section = await kv.hgetall('repeatPage@' +params.bookid + ':' params.id) as unknown as RepeatPage
    const thread = await getRepeatThreadById(params.threadId)
    const recordId = await createRepeatRecord(params.threadId,userId as string)
    if (thread) {
        redirect(`/repeat/${params.threadId}/${recordId}/1`)
    }
}