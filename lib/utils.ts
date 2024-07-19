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
