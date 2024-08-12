'use client'
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { delFromUserLessonList } from "@/lib/action/mongoIO"
import { MoreHorizontalIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react";


export function MyLessons({ lessonList, userId }: { lessonList: any[], userId: string }) {
    const [listData, setListData] = useState(lessonList)

    function deleteLessonFromList(userId: string, lessonId: string) {
        delFromUserLessonList(userId, lessonId)
            .then(res => setListData(prevList => prevList.filter(lesson => lesson._id !== lessonId)))
    }

    return (
        <div className="max-h-48 overflow-y-auto">
            <div className="text-muted-foreground text-xs font-medium py-2 px-2">
                最近使用
            </div>
            <div>
                {listData.map((item: any) =>
                    <Button asChild className="w-full py-2 px-2" variant="ghost" key={item.name}>
                        <div className="flex flex-row justify-between w-full">
                            <Link href={`/${item.type}/${item._id}`} className="w-5/6 " >

                                    <div className="w-full truncate text-ellipsis overflow-hidden text-foreground texl-xl">
                                        {item.name}
                                    </div>
                                
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger className=" hover:bg-black/25 active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 rounded-full z-10" >
                                    <MoreHorizontalIcon className="w-4 h-4" color="background" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => deleteLessonFromList(userId, item._id)}>删除记录</DropdownMenuItem>
                                    {/* <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>Subscription</DropdownMenuItem> */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </Button>

                )}

            </div>
        </div>
    )

}

// export function lessonRecord(lesson: any, userId: string) {
//     return (
//         <Button asChild className="w-full py-2" variant="ghost" key={lesson.name}>
//             <div className="flex flex-row justify-between w-full">

                
//                     <Link href={`/${lesson.type}/${lesson._id}`}>
//                         <div className="truncate text-ellipsis overflow-hidden text-foreground texl-xl ">
//                             {lesson.name}
//                         </div>
//                     </Link>
                

//                 <DropdownMenu>
//                     <DropdownMenuTrigger className=" hover:bg-black/25 active:bg-black/25 focus:bg-black/25 h-6 w-6 p-1 rounded-full z-10" >
//                         <MoreHorizontalIcon className="w-4 h-4" color="background" />
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent>
//                         <DropdownMenuItem onClick={() => delFromUserLessonList(userId, lesson._id)}>删除记录</DropdownMenuItem>
//                         {/* <DropdownMenuSeparator />
//                     <DropdownMenuItem>Profile</DropdownMenuItem>
//                     <DropdownMenuItem>Billing</DropdownMenuItem>
//                     <DropdownMenuItem>Team</DropdownMenuItem>
//                     <DropdownMenuItem>Subscription</DropdownMenuItem> */}
//                     </DropdownMenuContent>
//                 </DropdownMenu>
//             </div>
//         </Button>
//     )
// }