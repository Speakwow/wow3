
import { getRecordsForAssignment, } from "@/lib/action/mongoIO";
import { Label } from "@radix-ui/react-label";

import { useRouter } from "next/navigation"
import { AssignCard } from "./assignment-card";


export async function AssignCardServer({ userId, orgId, userData, name, type, threadId, intro, cover, tag }:
    { userId: string, orgId: string, userData: any, name: string, type: string, threadId: string, intro: string, cover: string, tag: string}) {

    const assignmentData = await getRecordsForAssignment(threadId, orgId, [userId])
    const record = assignmentData.records[0]


    return (
        <AssignCard
            userId={userId as string}
            userData={userData}
            name={name}
            type={type}
            tag={tag}
            id={threadId}
            intro={intro}
            key={threadId}
            cover=''
            record={record}
        />

    )

}