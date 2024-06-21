'use client'
import OpenAI from "openai";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { dalleGen } from "@/lib/action/ai";
const imageTemplate =
    `

`

export async function ShowImage({ description }: { description: string }) {

    const [imageUrl, setImageUrl] = useState('')

    useEffect(() => {
        dalleGen(description).then(res => setImageUrl(res))
    }, [])

    return (
        <Card>
            {imageUrl ?
                <img src={imageUrl} />
                :
                null
            }
        </Card>
    );
}