'use client'
import { Button } from "@/components/ui/button";
import Chat from "./chat";
import React, { useState, useEffect, useRef } from 'react';


export default function Initial({chatid,scenarioId,scenario,character}: { chatid: string, scenarioId: string,scenario:any, character: any }) {
    const [isReady, setIsReady] = useState(false)

    function handleInitial() {
        setIsReady(true)
        // // 使用 Web Audio API 进行录音 与转码
        // const audioContext = new AudioContext({
        //     sampleRate: 32000,
        // });
        // setupAudioWorklet(audioContext)
    }
    if (isReady) {
        return (
            <Chat 
            chatid={chatid} 
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