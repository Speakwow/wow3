import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function Score2Grade(score: number): string {
  if (score < 0 || score > 100) {
      throw new Error('Score must be between 0 and 100');
  }

  if (score >= 90 && score <= 100) {
      return 'A';
  } else if (score >= 80 && score < 90) {
      return 'B';
  } else if (score >= 70 && score < 80) {
      return 'C';
  } else if (score >= 60 && score < 70) {
      return 'D';
  } else {
      return 'F';
  }
}

export function adjustScore(score:number, factor:number) {
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
  // 去掉字符串前后的空白符，并按空白符（包括空格、制表符和换行符）分割字符串
  const words = input.trim().split(/\s+/);
  
  // 过滤掉空字符串并返回单词数量
  return words.filter(word => word.length > 0).length;
}