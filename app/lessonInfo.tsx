'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { ArrowLeftIcon } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCharacterById, getRepeatThreadById, getScenarioById } from "@/lib/action/mongoIO";
import { Label } from "@radix-ui/react-label";

export async function LessonInfo(params: { type: string, id: string, name: string,character:any }) {
    console.log(params.character)

    return (
        <Link href={`/${params.type}/${params.id}`}>
            <Card className="border-[#42C83C] border-2">
                <CardHeader>
                    <div className="flex flex-row gap-2">
                        <div>
                            <Avatar>
                                <AvatarImage src={params.character.avatar} alt={params.character.name} />
                            </Avatar>
                        </div>
                        <div className="flex flex-col gap-2">
                            <CardTitle className="text-">
                                {params.name}
                            </CardTitle>
                            <CardDescription className="text- font-light">
                                <Label>
                                    {params.type}
                                </Label>
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )

}