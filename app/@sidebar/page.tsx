import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { MyLessons } from "./myLessons";
import { getUserData } from "@/lib/action/mongoIO";
import { OrganizationSwitcher, SignedIn, UserButton } from "@clerk/nextjs";
import { IconProfile } from "@/components/ui/icons";
import { GraduationCapIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function SideBar() {
    const { userId, orgId, has } = auth();
    const data = await getUserData(userId as any)
    //@ts-ignore
    const lessonList = data.lessonList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    const canAccessDashboard = has({ role: "org:admin" });
    return (
        <div className="h-screen p-4 flex flex-col justify-between">
            <div className="flex flex-col gap-6 ">
                <div className="w-full text-xl font-semibold" >
                    <Link href="/">
                        <div className="flex flex-row items-center gap-2">
                            <Avatar className="h-9 p-0.5">
                                <AvatarImage
                                    src={`/logo.png`}
                                    alt={'speakwow'}
                                />
                                <AvatarFallback>🐸</AvatarFallback>
                            </Avatar>
                            <span className="inline text-xl">Speakwow.ai</span>
                        </div>
                    </Link>
                </div>
                <div className="flex flex-col gap-2">

                    <Button asChild className="w-full" size="lg">
                        <Link href='/create'>
                            创建课程
                        </Link>
                    </Button>
                </div>
                < MyLessons lessonList={lessonList} userId={userId as string} />
            </div>
            <div className="bottom-4 w-full flex flex-col gap-4">

                <Card className="p-2 w-full flex flex-col gap-2">
                    <div className="w-full flex flex-row justify-center p-2 ">
                        <OrganizationSwitcher />
                    </div>
                    {
                        orgId ?
                            has({ role: "org:admin" }) &&
                                <Button variant="outline" className="" asChild>
                                    <Link href="/dashboard">
                                        <GraduationCapIcon className="mr-2 h-4 w-4" /> 班级管理
                                    </Link>
                                </Button>
                            

                            :
                            <Card className="p-2 w-full flex flex-row justify-between items-center">
                                <SignedIn>
                                    <UserButton />
                                </SignedIn>
                                <Button variant="outline" className="" asChild>
                                    <Link href="/usercenter">
                                        <IconProfile className="mr-2 h-4 w-4" /> 个人中心
                                    </Link>
                                </Button>
                            </Card>
                    }

                </Card>

            </div>
        </div>
    )
}