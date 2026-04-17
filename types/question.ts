export type Category =
  | 'genel-kultur'
  | 'matematik'
  | 'fen'
  | 'tarih'
  | 'zeka';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  type: 'spoken';
  timeLimit?: number;
};

export const CategoryLabels: Record<Category, string> = {
  'genel-kultur': 'Genel Kültür',
  matematik: 'Matematik',
  fen: 'Fen',
  tarih: 'Tarih',
  zeka: 'Zeka',
};

export const DifficultyLabels: Record<Difficulty, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};
