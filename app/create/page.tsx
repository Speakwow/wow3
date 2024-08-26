import { Card } from "@/components/ui/card";
import { typeMap } from "@/lib/db/db";
import Link from "next/link";



export default async function CreateBoard() {
    return (
        <div className="h-screen flex flex-col gap-4 lg:p-8 md:p-6 p-6 bg-muted">
            <div className="flex flex-col p-8 text-center">
                <div className=" w-full text-3xl font-bold text-primary">
                    你想要如何设计今日的教学活动？
                </div>
               
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    typeMap.map(type => {
                        const key = Object.keys(type)[0];; // 获取对象的键
                        return (
                            <Link href={`./create/${type.type}`} key={key}>
                                <VocabularyCard title={type.tag} intro={type.intro} cover={type.banner} />
                            </Link>
                        )
                    })
                }
            </div>
        </div>
    )
}

const VocabularyCard = ({ title, intro, cover }: { title: string, intro: string, cover: string }) => {
    return (
        <Card className="overflow-hidden relative flex flex-col p-0 bg-white rounded-[10px] border hover:ring hover:ring-[#42C83C] focus:outline-none focus:ring focus:ring-[#42C83C]">
            <div className="relative w-full h-26 flex overflow-hidden items-center">
                <img
                    alt='SC'
                    className="object-cover object-center"
                    src={cover} />
            </div>
            <div className=" text-pretty truncate w-full col-span-2 p-3 flex flex-col gap-2">
                <div className="font-semibold text-sm">
                    {title}
                </div>
                <div className="line-clamp-2 w-full text-xs text-pretty truncate">
                    {intro}
                </div>
            </div>
        </Card>
    );
};