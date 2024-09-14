'use server'
import { AssignmentRecord } from "@/app/dashboard/assignment/[threadId]/columns";
import { clerkClient } from "@clerk/nextjs/server";
import { getChineseName } from "./tools";

export async function reformatRecords(records: any[], studentIds: string[],type:string): Promise<AssignmentRecord[]> {
    // 过滤出符合 studentIds 的记录并按分数降序排序
    const filteredRecords = records.filter(record => studentIds.includes(record.userId));
    const completedRecords = filteredRecords.filter(record => record.finishAt !== null);
    completedRecords.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

    const rankMap = new Map<string, number>();
    completedRecords.forEach((record, index) => {
        rankMap.set(record.userId, index + 1);
    });
    
    const assignmentRecords = await Promise.all(studentIds.map(async (userId) => {
        const record = filteredRecords.find(r => r.userId === userId);

        if (record) {
            const user = await clerkClient().users.getUser(record.userId);
            const score = parseFloat(record.score);
            const status = record.finishAt ? "已完成" : "未完成";
            const rank = record.finishAt ? rankMap.get(record.userId)! : -1;

            return {
                recordId:record._id.toString(),
                threadId: record.threadId,
                type:type,
                userId: record.userId,
                username: getChineseName(user),
                status: "已完成" as "已完成" | "未完成",
                score,
                rank,
                finishAt: record.finishAt
            };
        } else {
            const user = await clerkClient().users.getUser(userId);
            return {
                recordId:'',
                threadId: "",
                type:type,
                userId:userId,
                username: getChineseName(user),
                status: "未完成" as "已完成" | "未完成",
                score: 0,
                rank: -1,
                finishAt: null
            };
        }
    }));

    return assignmentRecords;

}