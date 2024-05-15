import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { kv } from "@vercel/kv";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowLeftSquare, Edit2Icon, MoveLeft, SwitchCameraIcon } from "lucide-react";
import Link from "next/link";
import { Character } from "@/lib/schema/chat";
import Image from 'next/image'
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { DeleteButton } from "./form";
import { deleteCharacter } from "@/lib/action/update";


export default async function CharacterAdmin({ params }: { params: { name: string } }) {
    const character = await kv.hgetall(`character@` + params.name) as any
    if(!character){
        deleteCharacter(params.name)
        return(
            <div>
                No Character
            </div>
        )
    }

    console.log(character)

    return (
        <div className="p-12 h-full bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
            <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href={"./"}>
                        <ArrowLeftIcon/>
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
                            {character.name}
                        </CardTitle>
                        <CardDescription>
                            UID: {params.name}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-screen flex flex-col gap-4">

                        {character ?
                            <div className="w-full grid grid-cols-2 gap-12">
                                <div className="w-full h-1/2 flex flex-col gap-4">
                                    <Label className="text-primary ">
                                        Name
                                    </Label>

                                    <Textarea className="h-full p-2" disabled>

                                        {character.name as string}

                                    </Textarea>


                                    <Label className="text-primary ">
                                        Persona
                                    </Label>
                                    <Textarea className="h-full p-2" disabled>
                                        {character.persona as string}
                                    </Textarea >
                                    <Label className="text-primary ">
                                        Voice
                                    </Label>
                                    <Textarea className="h-full p-2" disabled>
                                        {character.voice as string}
                                    </Textarea >

                                </div>
                                <div className="w-full h-1/2 flex flex-col gap-4">
                                    <Label className="text-primary ">
                                        Avatar
                                    </Label>
                                    <div className="w-full">
                                        <Image
                                            src={character.avatar as string}
                                            width={150}
                                            height={150}
                                            alt="Picture of Avatar" />
                                    </div>
                                    <Label className="text-primary ">
                                        Background
                                    </Label>
                                    <div className="w-full">
                                        <Image
                                            src={character.background as string}
                                            width={300}
                                            height={200}
                                            alt="Picture of Background" />
                                    </div>
                                </div>
                            </div>
                            :
                            <div className="flex flex-col gap-6">
                                <div>
                                    No Character Found
                                </div>
                                <Link href="./create">
                                    <Button>
                                        Create
                                    </Button>
                                </Link>
                            </div>}
                    </div>
                    {/* <CharacterForm  name={params.name} /> */}
                </CardContent>
                <CardFooter>
                    <DeleteButton id={params.name}/>
                </CardFooter>
            </Card>
        </div>
    )
}