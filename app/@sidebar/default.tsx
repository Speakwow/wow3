import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { MyLessons } from "./myLessons";
import { getUserData } from "@/lib/action/mongoIO";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { IconProfile } from "@/components/ui/icons";

export default async function SideBar() {
    const { userId, orgId } = auth();
    const data = await getUserData(userId as any)
    //@ts-ignore
    const lessonList = data.lessonList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return (
        <div className="h-screen p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-6 ">
                <div className="w-full text-xl font-semibold" >
                    <Link href="/">
                        🐸 Speakwow.ai
                    </Link>
                </div>
                <div className="">
                    <Button asChild className="w-full" size="lg">
                        <Link href='/create'>
                            创建课程
                        </Link>
                    </Button>
                </div>
                < MyLessons lessonList={lessonList} userId={userId as string} />

            </div>
            <div className="bottom-4 w-full">
                <Card className="p-2 w-full flex flex-row justify-between items-center">
                    <SignedIn>
                        <UserButton/>
                    </SignedIn>
                    <Button  variant="outline" className="" asChild>
                        <Link href="/usercenter">
                        <IconProfile className="mr-2 h-4 w-4"/> 个人中心
                        </Link>
                    </Button>
                </Card>
            </div>
        </div>
    )
}