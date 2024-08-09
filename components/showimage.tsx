'use client'
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { SDlighting } from "@/lib/action/ai";

export function ShowImage({ description }: { description: string }) {

    const [imageUrl, setImageUrl] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            const output =  await SDlighting(description)
            console.log(output);
            //@ts-ignore
            setImageUrl(output[0])
        }
        fetchData()
    }, [])

    return (
        <Card>
            {imageUrl ?
                <img src={imageUrl} />
                :
                <div>
                    loading
                </div>
            }
        </Card>
    );
}