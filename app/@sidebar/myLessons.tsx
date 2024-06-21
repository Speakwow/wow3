'use server'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { getMyLessons, getUserData } from "@/lib/action/mongoIO"
import { redirect } from "next/dist/server/api-utils";

export const MyLessons = async () => {
    const { userId, orgId } = auth(); 
    const data = await getUserData(userId as any)
    //@ts-ignore
    const lessonList = data.lessonList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    console.log(lessonList)
    return (
        <div>
            <div className="text-muted-foreground text-xs font-medium py-2 px-4">
                我的课程
            </div>
            <div>
                {lessonList.map((item:any)=>
                     <Button asChild className="w-full py-2" variant="ghost" key={item.name}>
                     <Link href={`/${item.type}/${item._id}`}>
                         <div className="flex flex-row flex-1 items-left gap-2">
                             {/* <Image
                                 className="rounded-full"
                                 alt='Frank'
                                 width={30}
                                 height={30}
                                 src="https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar" /> */}
                             <div className="text-foreground texl-xl">
                                 {item.name}
                             </div>
                         </div>
                     </Link>
                 </Button>

                )}

            </div>
        </div>
    )

}