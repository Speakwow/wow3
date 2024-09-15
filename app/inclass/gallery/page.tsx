import { Header } from "@/components/student-nav";
import { DB, DB_CORE } from "@/lib/constant";
import { connectCore} from "@/lib/mongo";
import { auth } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { redirect } from "next/navigation";
import TextbookSelector from "./textbookSelector";
import { ScrollArea } from "@/components/ui/scroll-area";





export default async function Home() {
    const { userId, orgId, redirectToSignIn, has } = auth();
    if (!userId) {
        redirectToSignIn()
        return null
    }
    if (orgId) {
        redirect('/')
    }
    const mongo = await connectCore()
    const [rawTextbooks, currentBookId] = await Promise.all([mongo.db(DB_CORE).collection('textbooks').find({ access: 'public' }).toArray(), kv.hget(userId, 'textbook')])
    const textbooks = JSON.parse(JSON.stringify(rawTextbooks))


    return (
        <div className="flex h-full w-full flex-col">
            <Header activePage="inclasss" />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted h-full">
                <div>
                    请选择你的教材：
                </div>
                <ScrollArea className="w-full h-full flex flex-col gap-8">
                    <div className="w-full h-full flex flex-col gap-8 mb-24">
                        {textbooks.length > 0 ?
                            <TextbookSelector textbooks={textbooks} userId={userId} currentBookId={currentBookId as string} />
                            :
                            <div>
                                暂无可用课程
                            </div>
                        }

                    </div>
                </ScrollArea>
            </main>
        </div>
    )


}