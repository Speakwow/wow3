import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";



export default async function SideBar() {
    const { userId, orgId } = auth();

    return (
        <div className="flex flex-col gap-6 h-screen p-4">

            <div className="w-full text-xl font-semibold" >
                <Link href="/">
                    🐸 Speakwow.ai
                </Link>
            </div>
            <div className="">
                <Button className="w-full" size="lg">
                    创建课程
                </Button>
                <div className="text-xs text-muted-foreground w-full text-center p-2">
                    未授权该操作
                </div>
            </div>
            <div className="text-muted-foreground text-sm font-medium">
                我的课程
            </div>
            <div>
                <div className="text-muted-foreground text-sm">
                    暂无课程...
                </div>
                {/* <Button asChild className="w-full py-2" variant="ghost">
                    <Link href="/admin">
                        <div className="flex flex-row flex-1 items-center gap-2">
                            <Image
                                className="rounded-full"
                                alt='Frank'
                                width={30}
                                height={30}
                                src="https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar" />
                            <div className="text-muted-foreground">
                                Frank的旅程
                            </div>
                        </div>
                    </Link>
                </Button>

                <Button asChild className="w-full py-2" variant="ghost">
                    <Link href="/admin">
                        <div className="flex flex-row flex-1 items-center gap-2">
                            <Image
                                className="rounded-full"
                                alt='Frank'
                                width={30}
                                height={30}
                                src="https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar" />
                            <div>
                                Frank的2312旅程
                            </div>
                        </div>
                    </Link>
                </Button> */}
            </div>
        </div>
    )
}