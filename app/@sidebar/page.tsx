import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import {MyLessons} from "./myLessons";

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
                <Button asChild className="w-full" size="lg">
                <Link href='/create'> 
                    创建课程
                    </Link>
                </Button>
                

            </div>
            < MyLessons />
        </div>
    )
}