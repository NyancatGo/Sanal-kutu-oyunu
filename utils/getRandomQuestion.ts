import questionsData from '@/data/questions.json';
import type { Category, Difficulty, Question } from '@/types/question';

const ALL_QUESTIONS = questionsData as Question[];

function pickRandom(pool: Question[]): Question {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomQuestion(
  category: Category,
  difficulty: Difficulty,
  excludeIds: string[] = [],
): Question {
  const byExact = ALL_QUESTIONS.filter(
    (q) => q.category === category && q.difficulty === difficulty,
  );

  const unusedExact = byExact.filter((q) => !excludeIds.includes(q.id));
  if (unusedExact.length > 0) {
    return pickRandom(unusedExact);
  }
  if (byExact.length > 0) {
    return pickRandom(byExact);
  }

  // Safety fallback for missing exact category+difficulty combinations in data.
  const byCategory = ALL_QUESTIONS.filter((q) => q.category === category);
  const unusedByCategory = byCategory.filter((q) => !excludeIds.includes(q.id));
  if (unusedByCategory.length > 0) {
    return pickRandom(unusedByCategory);
  }
  if (byCategory.length > 0) {
    return pickRandom(byCategory);
  }

  const unusedAll = ALL_QUESTIONS.filter((q) => !excludeIds.includes(q.id));
  if (unusedAll.length > 0) {
    return pickRandom(unusedAll);
  }
  if (ALL_QUESTIONS.length > 0) {
    return pickRandom(ALL_QUESTIONS);
  }

  throw new Error('Soru havuzu boş.');
}
