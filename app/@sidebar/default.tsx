import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/lib/action/mongoIO";
import SideBar from "./page";

export default async function SideBarDefault() {
    const { userId, orgId } = auth();
    const data = await getUserData(userId as any)
    //@ts-ignore
    const lessonList = data.lessonList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return SideBar()
}