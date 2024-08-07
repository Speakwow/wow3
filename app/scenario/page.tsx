'use server'
import { Button } from "@/components/ui/button"
import Chat from "./chat"
import Link from "next/link"

import { ChevronLeft, ChevronRight, Edit2Icon } from "lucide-react"

export default async function ChatPage() {
  const bgImage = {
    // 设置背景图片
    backgroundImage: "url('/bg.webp')",
    // 设置背景图片放缩方式为cover，使其自动放缩填充div
    backgroundSize: 'cover'
  };
  const chatid = "0x3124012"
  return (
    <div style={bgImage} className="h-screen">
      <div className="mx-auto h-screen m p-8 flex flex-col items-center justify-center">
        <div className="absolute top-2 left-2">
          <Button asChild size="icon" variant="outline">
            <Link href="/">
              <ChevronLeft />
            </Link>
          </Button>
        </div>
        {/* <div className="absolute top-2 right-2">
        <Button asChild size="icon" variant="default">
          <Link href="/admin/hobby">
            <Edit2Icon />
          </Link>
        </Button>
      </div> */}
        <div className="items-center justify-center p-2">
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.10rem] font-mono text-sm font-semibold">📚 wow</code>
        </div>
        <Chat chatid={chatid} />
      </div>
    </div>
  )
}