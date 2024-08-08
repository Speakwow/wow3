import { AssignmentRecord } from "@/app/dashboard/assignment/[threadId]/columns";
import { clerkClient } from "@clerk/nextjs";

export function calculateAverageScore(docs: any[]): number {
    const totalScore = docs.reduce((sum, doc) => sum + doc.score, 0);
    return docs.length ? totalScore / docs.length : 0;
}

export function findLowestScoreDoc(docs: any[]): any | null {
    if (!docs.length) return null;
    return docs.reduce((min, doc) => doc.score < min.score ? doc : min, docs[0]);
}

export function findHighestScoreDoc(docs: any[]): any | null {
    if (!docs.length) return null;
    return docs.reduce((max, doc) => doc.score > max.score ? doc : max, docs[0]);
}

export function hoursUntil(endAt: Date): number {
    const now = new Date();
    const end = new Date(endAt)
    const differenceInMilliseconds = end.getTime() - now.getTime();
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    return differenceInHours;
}

export async function reformatRecords(records: any[], studentIds: string[]): Promise<AssignmentRecord[]> {
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
            const user = await clerkClient.users.getUser(record.userId);
            const score = parseFloat(record.score);
            const status = record.finishAt ? "已完成" : "未完成";
            const rank = record.finishAt ? rankMap.get(record.userId)! : -1;

            return {
                threadId: record.threadId,
                userId: record.userId,
                username: user.username ?? 'no name',
                status: "已完成" as "已完成" | "未完成",
                score,
                rank,
                finishAt: record.finishAt
            };
        } else {
            const user = await clerkClient.users.getUser(userId);
            return {
                threadId: "",
                userId:userId,
                username: user.username ?? 'no name',
                status: "未完成" as "已完成" | "未完成",
                score: 0,
                rank: -1,
                finishAt: null
            };
        }
    }));

    return assignmentRecords;

}