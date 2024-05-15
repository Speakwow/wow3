import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftIcon } from "lucide-react";

async function CharacterCard({ id }: { id: string }) {

    const character = await kv.hgetall('character@' + id) as any
    let userName = ''
    try{
    const user = await clerkClient.users.getUser(character.creator);
    userName = user.username??'Speakwow'
    }catch(error){
      console.log(error)
      userName = 'Speakwow'
    }
  
    return (
        <Link href={'./character/' + id}>
            <Card className="min-w-32 border-primary border-2 border-[#42C83C]" >
                <CardHeader>
                    <div className="flex flex-row gap-2">
                        <div>
                            <Avatar>
                                <AvatarImage src={character.avatar} alt={character.name} />
                            </Avatar>
                        </div>
                        <div className="flex flex-col gap-2">
                            <CardTitle className="">
                                {character.name}
                            </CardTitle>
                            <CardDescription>
                                Creator: {userName}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )

}

export default async function Page() {
    const { userId } = auth();
    const myCharacterList = await kv.smembers('characterList@all')

    return (
        <div className="flex flex-col gap-10 lg:p-24 md:p-16 p-6">
            <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href={"./"}>
                        <ArrowLeftIcon />
                    </Link>
                </Button>
            </div>
            <div className="text-center w-full text-3xl">
                角色管理
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href={'./character/create'}>
                    <Card className="min-w-32">
                        <CardHeader>
                            <div className="flex flex-row gap-6">
                                <div className="text-3xl">
                                    +
                                </div>
                                <div className="flex flex-col gap-2 text-black/25">
                                    <CardTitle>
                                        创建新角色
                                    </CardTitle>
                                    <CardDescription className="flex flex-col gap-2 text-black/25">
                                        CREATE CHARACTER
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                {myCharacterList.map((Id) => (
                    <CharacterCard key={Id} id={Id} />
                ))}
            </div>

        </div>
    )
}