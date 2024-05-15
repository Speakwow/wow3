import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { kv } from "@vercel/kv"
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";


async function ScenarioCard({id}:{id: string}) {
    const info = await kv.hgetall('scenario@' + id) as any
    const character = await kv.hgetall('character@' + info.character) as any
    let userName = ''
    try{
    const user = await clerkClient.users.getUser(info.creator);
    userName = user.username??'Speakwow'
    }catch(error){
      console.log(error)
      userName = 'Speakwow'
    }
  
    return (
        <Link href={"./scenario/"+id}>
        <Card>
            <CardHeader>
                <div className="flex flex-row gap-2">
                    <div>
                        <Avatar>
                            <AvatarImage src={character.avatar} alt={character.name} />
                        </Avatar>
                    </div>
                    <div>
                        <CardTitle>
                            {info.name}
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
    const myScenarioList = await kv.smembers('scenarioList@all')

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
                🏫 场景管理
            </div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href={'./scenario/create'}>
                    <Card className="min-w-32">
                        <CardHeader>
                            <div className="flex flex-row gap-6">
                                <div className="text-3xl">
                                    +
                                </div>
                                <div className="flex flex-col gap-2 text-black/25">
                                    <CardTitle>
                                        创建新场景
                                    </CardTitle>
                                    <CardDescription className="flex flex-col gap-2 text-black/25">
                                        CREATE SCENARIO
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
                {myScenarioList.map((Id) => (
                    <ScenarioCard key={Id} id={Id} />
                ))}
            </div>

        </div>
    )
}