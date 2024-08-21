import { z } from 'zod';

// define a schema for the notifications
export const talkaboutReportSchema = z.object({
      vocabulary_score: z.number().describe('Score number of the vocabulary accuracy,0-100'),
      theme_relevance_score: z.number().describe('Score number of the coherence,0-100'),
      coherence_score: z.number().describe('Score number of the theme relevance,0-100'),
      grammarza_syntax_score: z.number().describe('Score number of Grammatical accuracy,0-100'),
      feedback:z.string().describe('Feedback text')
    } 
);