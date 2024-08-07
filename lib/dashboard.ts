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