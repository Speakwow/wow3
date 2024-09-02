'use client'
import { Button } from "@/components/ui/button";
import Chat from "@/components/chat";
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Initial({chatid,scenarioId,characterId,scenario,character}: { chatid: string, scenarioId: string,characterId:string, scenario:any, character: any }) {
    const [isReady, setIsReady] = useState(true)

    function handleInitial() {
        setIsReady(true)
    }
    if (isReady) {
        return (
            <Chat 
            chatid={chatid} 
            characterId={characterId}
            scenarioId={scenarioId}
            scenario={scenario} 
            character={character} />
        )
    }
    else {
        return (
            <Card className="">
                
                    <CardHeader>
                    <CardTitle>
                        {scenario.name}
                    </CardTitle>
                    <CardDescription>
                        {scenario.topic}
                    </CardDescription>

                    </CardHeader>
                    <CardContent>
                    <Button size="lg" onClick={handleInitial}>
                开始课程
            </Button>

                    </CardContent>
                    

            </Card>
        )
    }
}