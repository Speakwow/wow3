
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createWordRecord, getRepeatPageByIndex, getRepeatThreadById, getWordThreadById } from '@/lib/action/mongoIO'
import { auth } from '@clerk/nextjs/server'


export default async function Repeat({ params }: { params: { threadId: string } }) {
    const { userId, orgId } = auth();
    // const section = await kv.hgetall('repeatPage@' +params.bookid + ':' params.id) as unknown as RepeatPage
    const thread = await getWordThreadById(params.threadId)
    const recordId = await createWordRecord(params.threadId,userId as string)
    if (thread) {
        redirect(`/word/${params.threadId}/${recordId}/1`)
    }
}