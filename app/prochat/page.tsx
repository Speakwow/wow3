'use client';

import { useState } from 'react';
import { ClientMessage} from '@/lib/action/ai';
import { getMutableAIState, useActions, useUIState } from 'ai/rsc';
import { generateId } from 'ai';
import { useEffect } from 'react';
import { ReactNode } from 'react';
import React from 'react';
import ReactDOM from 'react-dom'

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;





export default function Home() {
    const [input, setInput] = useState<string>('');
    const [conversation, setConversation] = useUIState();
    const { continueConversation } = useActions();
    const [aiHistory, setAIHistory] = useState<ClientMessage>();


    return (
        <div className='flex flex-col gap-2'>
            <div>
                主要
            </div>
            <div className='grid grid-cols-2 w-full'>

                {/* {conversation.filter((message: ClientMessage) => message.role === 'function').slice(-1)[0] &&
                    <div key={conversation.filter((message: ClientMessage) => message.role === 'function').slice(-1)[0].id}>
                        {conversation.filter((message: ClientMessage) => message.role === 'function').slice(-1)[0].display}
                    </div>
                } */}
                {conversation.filter((message: ClientMessage) => message.role === 'assistant').slice(-1)[0] &&
                    <div key={conversation.filter((message: ClientMessage) => message.role === 'assistant').slice(-1)[0].id}>
                        {conversation.filter((message: ClientMessage) => message.role === 'assistant').slice(-1)[0].display}
                    </div>
                }

            </div>
            <div>
                <div>
                    thread
                </div>
                {conversation.map((message: ClientMessage) => (
                    <div key={message.id}>
                        {message.role}: {message.display}
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={input}
                    onChange={event => {
                        setInput(event.target.value);
                    }}
                />
                <button
                    onClick={async () => {
                        setConversation((currentConversation: ClientMessage[]) => [
                            ...currentConversation,
                            { id: generateId(), role: 'user', display: input },
                        ]);

                        const message = await continueConversation(input);

                        setConversation((currentConversation: ClientMessage[]) => [
                            ...currentConversation,
                            message,
                        ]);
                    }}
                >
                    Send Message
                </button>
            </div>
        </div>
    );
}