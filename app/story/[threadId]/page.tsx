

import { useEffect, useState } from 'react'
import { getCharacterById } from '@/lib/action/mongoIO'
import { redirect } from 'next/navigation'


export default async function StoryPage({params}: {params:{ threadId: string,characterId:string }} ) {
    const character = await getCharacterById(params.characterId)
    redirect(`./${params.threadId}/1`)

}