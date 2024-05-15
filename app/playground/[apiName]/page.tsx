import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { kv } from "@vercel/kv";
import { PromptForm } from "./form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit2Icon, SwitchCameraIcon } from "lucide-react";
import Link from "next/link";

export default async function PromptAdmin({ params }: { params: { apiName: string } }) {
    
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
                            API Test @ {params.apiName}
                        </CardTitle>
                        <CardDescription>
                            Modify Your Prompt
                        </CardDescription>
                    </div>
                </CardHeader>
                    <PromptForm apiName= {params.apiName} />             
            </Card>
        </div>
    )
}