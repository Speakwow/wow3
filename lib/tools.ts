import { User } from "@clerk/nextjs/server";

export function Score2Grade(score: number): string {
    if (score < 0 || score > 100) {
        throw new Error('Score must be between 0 and 100');
    }

    if (score >= 90 && score <= 100) {
        return 'A';
    } else if (score >= 75 && score < 90) {
        return 'B';
    } else if (score >= 65 && score < 75) {
        return 'C';
    } else if (score >= 60 && score < 65) {
        return 'D';
    } else {
        return 'F';
    }
}

export function adjustScore(score: number, factor: number) {
    // Ensure score is within the range 0-100
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // Adjust the score
    let newScore = 100 * Math.pow(score / 100, 1 / factor);

    // Ensure the new score is within the range 0-100
    if (newScore < 0) newScore = 0;
    if (newScore > 100) newScore = 100;

    return newScore;
}

export function calculateTalkaboutSpeedScore(wordsPerSecond: number): number {
    const m = 112.37;
    const b = -87.11;
    const score = m * wordsPerSecond + b;

    // 限制分数在40到100之间
    if (score > 100) {
        return 100;
    } else if (score < 40) {
        return 40;
    } else {
        return score;
    }
}

export function countWords(input: string): number {
    // 去除符号，只保留字母和空格
    const cleanedText = input.replace(/[^\w\s]/g, '');
    // 通过空格将文本分割成单词数组
    const wordsArray = cleanedText.trim().split(/\s+/);

    // 过滤掉空字符串并返回单词数量
    return wordsArray.filter(word => word.length > 0).length;
}

// 获取当前北京时间
export const getBeijingTime = () => {
    const now = new Date();
    const beijingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
    return beijingTime;
};

// 获取当前北京时间
export const UTC2Beijing = (dateString:string) => {
    const date = new Date(dateString);
    const beijingTime = date.toLocaleString("zh-TW", { timeZone: "Asia/Shanghai" });
    return beijingTime;
};

export const getBeijingDate = () => {
    const now = new Date();
    const beijingTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));

    // 创建新的 Date 对象并将时间部分设置为 00:00:00.000
    const beijingDateOnly = new Date(beijingTime.getFullYear(), beijingTime.getMonth(), beijingTime.getDate());

    return beijingDateOnly;
};


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

export function getChineseName(user: User): string {
    return `${user.lastName??user.username}${user.firstName??''}`
}

export function getFullName(user:any){
    if(user.lastName && user.firstName){
        return user.lastName+user.firstName
    }else{
        return user.username
    }
}