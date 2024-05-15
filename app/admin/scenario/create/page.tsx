import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kv } from "@vercel/kv";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Edit2Icon, SwitchCameraIcon } from "lucide-react";
import Link from "next/link";
import {ScenarioForm} from "./form";
import { auth } from "@clerk/nextjs/server";

export default async function CharacterAdmin() {
    const { userId } = auth();
    const characterList = await kv.smembers('characterList@all')
    const promises = characterList.map(async (id) => {
        const character = await kv.hgetall('character@' + id)
        return { id: id, ...character }
    })
    const allCharacters = await Promise.all(promises);
    console.log(allCharacters)

    return (
        <div className="p-12 h-screen bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
                        <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href={"/"}>
                        <ArrowLeftIcon />
                    </Link>
                </Button>
            </div>
            <Card className="p-6 h-fit">
                <CardHeader className="flex flex-row justify-between">
                    <div>
                        <CardTitle className="text-3xl">
                            创建场景
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScenarioForm userId={userId} allCharacters={allCharacters} />
                </CardContent>
            </Card>
        </div>
    )
}