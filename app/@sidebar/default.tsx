import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { MyLessons } from "./myLessons";
import { getUserData } from "@/lib/action/mongoIO";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { IconProfile } from "@/components/ui/icons";
import SideBar from "./page";

export default async function SideBarDefault() {
    const { userId, orgId } = auth();
    const data = await getUserData(userId as any)
    //@ts-ignore
    const lessonList = data.lessonList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    return SideBar()
}