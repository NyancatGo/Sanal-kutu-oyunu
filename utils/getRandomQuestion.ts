import questionsData from '@/data/questions.json';
import type { Category, Difficulty, Question } from '@/types/question';

const ALL_QUESTIONS = questionsData as Question[];

export function getRandomQuestion(
  category: Category,
  difficulty: Difficulty,
  excludeIds: string[] = [],
): Question {
  const byExact = ALL_QUESTIONS.filter(
    (q) => q.category === category && q.difficulty === difficulty,
  );
  const byCategory = ALL_QUESTIONS.filter((q) => q.category === category);

  const tiers: Question[][] = [
    byExact.filter((q) => !excludeIds.includes(q.id)),
    byCategory.filter((q) => !excludeIds.includes(q.id)),
    byExact,
    byCategory,
    ALL_QUESTIONS,
  ];

  for (const pool of tiers) {
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  throw new Error('Soru havuzu boş.');
}
