'use client';

import { useState } from 'react';
import { Message, continueConversation } from '@/lib/action/ai_test';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getMutableAIState } from 'ai/rsc';

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function Home() {
    const [conversation, setConversation] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [toolMessage, setToolMessage] = useState<Message>();
    const [aiMessage, setAIMessage] = useState<Message>();
    const history = getMutableAIState()

    useEffect(() => {// 获取最新的 role 为 assistant 的消息
        const latestAssistantMessage = conversation.filter(message => {console.log(typeof message.content)
            typeof message.content === 'string'}).slice(-1)[0];
        // 获取最新的 role 为 tool 的消息
        const latestToolMessage = conversation.filter(message => typeof message.content !== 'string').slice(-1)[0];
        setAIMessage(latestAssistantMessage)
        setToolMessage(latestToolMessage)
        console.log(conversation)
        console.log(history)

    }, [conversation])
    return (
        <div className='flex flex-col'>
            <div>Main</div>
            <div className='grid grid-cols-2 w-full'>
                {toolMessage &&
                    <div >
                        <Card>
                            {toolMessage.content ?
                                <img src={toolMessage.content} />
                                :
                                <div>
                                    loading
                                </div>
                            }
                        </Card>

                    </div>
                }
                {aiMessage &&
                    <div >
                        {aiMessage.content}
                    </div>
                }
            </div>
            <div>Raw</div>
            <div>
                {conversation.map((message, index) => (
                    <div key={index}>
                        {message.role}: {message.content}
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
                        const { messages } = await continueConversation([
                            ...conversation,
                            { role: 'user', content: input },
                        ]);

                        setConversation(messages);
                    }}
                >
                    Send Message
                </button>
            </div>
        </div>
    );
}