import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


export default async function CharacterAdmin() {

    
    return (
        <div className="h-screen p-12 bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
            <Card className="p-6 h-full">
                <CardHeader className="flex flex-row justify-between">
                    <div>
                        <CardTitle className="text-3xl">
                            Character Created Success
                        </CardTitle>

                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                    
            
                </CardContent>
                <CardFooter className="flex justify-between">
                <Link href='./Panda'>
                <Button>
                        View Character Profile
                    </Button>
                    </Link>
                    
                    <Link href='/'>
                    <Button>
                        Back to HomePage
                    </Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}