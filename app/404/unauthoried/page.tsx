import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
    return (
        <div className="h-screen w-full flex flex-col gap-4 items-center justify-center text-center">
            <div>
                😭 抱歉，您无权访问
            </div>
            <Button variant="outline" asChild>
                <Link href='/'>
                返回首页
                </Link>
            </Button>
        </div>
    )
}

