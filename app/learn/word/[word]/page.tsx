'use server'
import { Button } from "@/components/ui/button"
// import Chat from "./chat"
import Link from "next/link"
import { ChevronLeft, Edit2Icon } from "lucide-react"
import { kv } from "@vercel/kv"
import { nanoid } from "ai"

export default async function ChatPage({ params }: { params: { word: string } }) {
  //获取场景设定
  //const bgSetting = await kv.hgetall('bgsetting@'+params.scenario)
  const wordInfo = await kv.hget(`word@`+params.word,'welcomeMessage') as string
  const bgImage = {
    // 设置背景图片
    backgroundImage: "url('/bg.webp')",
    // 设置背景图片放缩方式为cover，使其自动放缩填充div
    backgroundSize: 'cover'
  };
  const chatid = nanoid(16)
  return (
    <div className="h-screen bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
      <div className="mx-auto h-screen m p-8 flex flex-col items-center justify-center">
        <div className="absolute top-2 left-2">
          <Button asChild size="icon" variant="outline">
            <Link href="./">
              <ChevronLeft />
            </Link>
          </Button>
        </div>
        <div className="absolute top-2 right-2">
        <Button asChild size="icon" variant="default">
          <Link href={"/admin/scenario/"+params.word}>
            <Edit2Icon />
          </Link>
        </Button>
      </div>
        <div className="items-center justify-center p-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.10rem] font-mono text-sm font-semibold">📚上课中：{params.word}</code>
        </div>
      </div>
    </div>
  )
}