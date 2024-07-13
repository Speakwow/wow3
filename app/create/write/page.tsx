import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kv } from "@vercel/kv";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Edit2Icon, SwitchCameraIcon } from "lucide-react";
import Link from "next/link";
import { WriteForm } from "./form";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllCharacters } from "@/lib/action/mongoIO";

export default async function WriteCreator() {
    const { userId } = auth();
    if(!userId) redirect('/')
    // const characterList = await kv.smembers('characterList@all')
    // const promises = characterList.map(async (id) => {
    //     const character = await kv.hgetall('character@' + id)
    //     return { id: id, ...character }
    // })
    // const allCharacters = await getAllCharacters()


    return (
        <div className="relative w-full h-screen bg-muted">
            <ScrollArea className="h-full overflow-hidden">
                <div className="absolute top-2 left-2">
                    <Link href={"./"} className="z-10">
                        <Button size="icon" variant="outline">
                            <ArrowLeftIcon />
                        </Button>
                    </Link>
                </div>
                <div className="py-2 px-16">
                    <Card className="p-6 h-fit relative">
                        <CardHeader className="flex flex-row justify-between">
                            <div>
                                <CardTitle className="text-2xl">
                                    创建 - 写作练习
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="h-full">
                            <WriteForm userId={userId} />
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    )
}