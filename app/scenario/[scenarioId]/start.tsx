'use client'
import { Button } from "@/components/ui/button";
import Chat from "@/components/chat";
import React, { useState, useEffect, useRef } from 'react';

export default function Initial({chatid,scenarioId,characterId,scenario,character}: { chatid: string, scenarioId: string,characterId:string, scenario:any, character: any }) {
    const [isReady, setIsReady] = useState(false)

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
            <Button onClick={handleInitial}>
                Start
            </Button>
        )
    }
}