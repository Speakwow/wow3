import { Button } from "@/components/ui/button";
import Link from "next/link";
import { currentUser,auth } from "@clerk/nextjs/server";

import { getFavouriteLessons, getLessonsByCreator, getUserData } from "@/lib/action/mongoIO";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonCard } from "@/components/lessonInfo";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";




export default async function UserCenter() {
    const { userId } = auth();
    const user = await currentUser();

    // const publicLessonList = await getAllLessonsByLessonId(publicLessonListId)
    const [userLessonList, userData,favourieList] = await Promise.all([getLessonsByCreator(user?.id as string),getUserData(user?.id as string),getFavouriteLessons(user?.id as string)])
    // console.log(publicLessonList)
    return (

        <div className="relative h-screen flex flex-col gap-4 lg:p-8 md:p-6 p-6 bg-[#F5F5F5]">
            <div className="absolute top-2 left-2">
                <Button asChild size="icon" variant="outline">
                    <Link href="/">
                        <ChevronLeft />
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="p-2 mt-8">
                <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.username}</AvatarFallback>
                </Avatar>
                </div>
                <div className="text-2xl">
                {user?.username}
                </div>
                {/* <Input className=" w-full text-xl bg-white" placeholder="..." /> */}
            </div>
            <div>

            </div>
            <Tabs defaultValue="create" className="w-full h-full">
                <TabsList className="flex justify-center">
                    <TabsTrigger value="create">由我创建</TabsTrigger>
                    <TabsTrigger value="favourite">收藏</TabsTrigger>
                </TabsList>
                <TabsContent value="create">
                    <ScrollArea className="w-full h-full">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">

                            {
                                //@ts-ignore
                                userLessonList.map(item => (
                                    <LessonCard
                                        userId={user?.id as string}
                                        userData={userData}
                                        name={item.name}
                                        type={item.type}
                                        tag={item.tag}
                                        id={item._id}
                                        intro={item.intro}
                                        key={item._id}
                                        cover='' />
                                )
                                )
                            }

                        </div>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="favourite">
                    <ScrollArea className="w-full h-full">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                            
                            {
                                //@ts-ignore
                                favourieList.map(item => (
                                    <LessonCard
                                        userId={user?.id as string}
                                        userData={userData}
                                        name={item.name}
                                        type={item.type}
                                        tag={item.tag}
                                        id={item._id}
                                        intro={item.intro}
                                        key={item._id}
                                        cover='' />
                                )
                                )
                            }
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>


        </div>
    )
}


// function LessonCard({ name, type, id, intro,cover ,tag}: { name: string, type: string, id: string, intro: string ,cover:string,tag:string}) {
//     let coverImg = ''
//     if(!cover){
//         coverImg='https://imagedelivery.net/yeOpFSfmW-7M72sPdtpMKw/108cf320-27a7-4110-0312-6f0b32223200/avatar'
//     }else{
//         coverImg = cover
//     }
//     return (
//         <Link href={`/${type}/${id}`}>
//             <Card className="flex flex-row bg-white rounded-[10px] border hover:ring hover:ring-[#42C83C] focus:outline-none focus:ring focus:ring-[#42C83C]">
//                 <div className="h-full p-3 w-[100px]">
//                     <Image
//                         alt='SC'
//                         width={200}
//                         height={50}
//                         objectFit="cover"
//                         className="rounded-[10px]"
//                         src={coverImg} />
//                 </div>
//                 <div className=" text-pretty truncate w-[200px] col-span-2 p-3 flex flex-col gap-2">
//                     <div className="font-semibold text-sm">
//                         {name}
//                     </div>
//                     <Badge className="text-xs w-fit" variant="outline">
//                         {tag}
//                     </Badge>
//                     <div className="line-clamp-2 text-xs text-pretty truncate">
//                         {intro}
//                     </div>

//                 </div>
//             </Card>
//         </Link>

//     )

// }