import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kv } from "@vercel/kv";
import { PromptForm } from "./form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2Icon, SwitchCameraIcon } from "lucide-react";
import Link from "next/link";

export default async function PromptAdmin({ params }: { params: { prompt: string } }) {

    const currentPrompt = await kv.get(`prompt@` + params.prompt)
    
    return (
        <div className="p-12 h-screen bg-gradient-to-r from-purple-500 to-pink-500">
            <div className="absolute top-2 right-2">
                <Button asChild size="icon" variant="default">
                    <Link href="/chat">
                        <SwitchCameraIcon />
                    </Link>
                </Button>
            </div>
            <Card className="p-6 h-full">
                <CardHeader className="flex flex-row justify-between">
                    <div>
                        <CardTitle className="text-3xl">
                            {params.prompt}
                        </CardTitle>
                        <CardDescription>
                            Modify Your Prompt
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className=" grid grid-cols-2 gap-6">
                    <div className="h-screen flex flex-col gap-4">
                        <Label className="text-primary ">
                            Current Prompt
                        </Label>

                        {currentPrompt ?
                            <div className="w-full h-1/2 p-2 border-2 border-primary rounded-md radius-2">
                                <ScrollArea className="h-full p-2">

                                    {currentPrompt as string}
                                </ScrollArea>
                            </div>
                            :
                            <div>
                                No Prompt Found
                            </div>}
                    </div>
                    <PromptForm params={{ prompt: params.prompt }} />
                </CardContent>
            </Card>
        </div>
    )
}