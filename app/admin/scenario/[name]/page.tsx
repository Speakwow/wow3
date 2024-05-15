import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kv } from "@vercel/kv";
import { ScenarioForm } from "./form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Edit2Icon, SwitchCameraIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function ScenarioAdmin({ params }: { params: { name: string } }) {

    const scenario = await kv.hgetall(`scenario@` + params.name) as any
    const character = await kv.hgetall('character@'+scenario.character) as any
    // const { userId } = auth();
    const characterList = await kv.smembers('characterList@all')
    const promises = characterList.map(async (id) => {
        const character = await kv.hgetall('character@' + id)
        return { id: id, ...character }
    })
    const allCharacters = await Promise.all(promises);
    console.log(allCharacters)

    return (
        <div className="p-12 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
            <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href={"/"}>
                        <ArrowLeftIcon />
                    </Link>
                </Button>
            </div>
            <div className="fixed top-2 right-2">
                <Button asChild size="icon" variant="default">
                    <Link href={"/chat/" + params.name}>
                        <SwitchCameraIcon />
                    </Link>
                </Button>
            </div>
            <Card className="p-6 h-full">
                <CardHeader className="flex flex-row justify-between">
                    <div>
                        <CardTitle className="text-3xl">
                            {scenario.name}
                        </CardTitle>
                        <CardDescription>
                            Modify Your Prompt
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className=" grid md:grid-cols-2 sm:grid-cols-1 gap-6">
                    <div className="h-screen flex flex-col gap-4">

                        {scenario ?
                            <div className="w-full h-1/2 flex flex-col gap-4">
                                <Label className="text-primary ">
                                    Character
                                </Label>
                                <div className="w-full h-3/4 p-2 border-2 border-primary rounded-md radius-2">

                                    <ScrollArea className="h-full p-2">
                                        {character.name as string}
                                    </ScrollArea>
                                </div>
                                <Label className="text-primary ">
                                    Prompt
                                </Label>
                                <div className="w-full h-3/4 p-2 border-2 border-primary rounded-md radius-2">

                                    <ScrollArea className="h-full p-2">
                                        {scenario.prompt as string}
                                    </ScrollArea>
                                </div>
                                <Label className="text-primary ">
                                    Welcome Message
                                </Label>
                                <div className="w-full h-1/4 p-2 border-2 border-primary rounded-md radius-2">

                                    <ScrollArea className="h-full p-2">
                                        {scenario.welcomeMessage as string}
                                    </ScrollArea>
                                </div>
                            </div>
                            :
                            <div>
                                No Prompt Found
                            </div>}
                    </div>
                    <ScenarioForm id={params.name} allCharacters={allCharacters} />
                </CardContent>
            </Card>
        </div>
    )
}