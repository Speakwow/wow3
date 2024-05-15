import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { clerkClient } from '@clerk/nextjs';
import { auth, currentUser } from '@clerk/nextjs/server';
import { kv } from '@vercel/kv';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation'

        
export default async function Page() {
    const { userId } = auth();
    const myScenarioList = await kv.smembers('scenarioList@' + userId)
    const user = await currentUser()
    

    return (
        <div className="flex flex-col gap-12 md:p-24 sm:p=10">
                        <div className="fixed top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href={"/"}>
                        <ArrowLeftIcon />
                    </Link>
                </Button>
            </div>
            <div className="text-center w-full text-3xl">
                {user?.username}的控制台
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Link href='./admin/scenario'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-center'>
                            场景管理
                        </CardTitle>
                    </CardHeader>
                </Card>
                </Link>
                <Link href='./admin/character'>
                <Card>
                    <CardHeader>
                        <CardTitle  className='text-center'>
                            角色管理
                        </CardTitle>
                    </CardHeader>
                </Card>
                </Link>
            </div>

        </div>
    )
}
