import { Header } from "@/components/student-nav";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";


export default async function Home() {
    const { userId, orgId, redirectToSignIn,has } = auth();
    if (!userId) {
        redirectToSignIn()
        return null
    }
    const currentTextbookId = await kv.hget(userId,'textbook')
    if (!currentTextbookId) {
        redirect('/inclass/gallery')
    } else {
        redirect(`/inclass/${currentTextbookId}`)
    }

}