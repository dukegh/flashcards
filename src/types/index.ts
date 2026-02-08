export interface User {
  id: string
  email: string
  created_at: string
}

export interface Lesson {
  id: string
  user_id: string
  title: string
  description: string
  language_from: 'japanese' | 'ukrainian'
  language_to: 'japanese' | 'ukrainian'
  created_at: string
  updated_at: string
}

export interface Word {
  id: string
  lesson_id: string
  japanese: string
  ukrainian: string
  furigana?: string
  pronunciation?: string
  created_at: string
  updated_at: string
}

export interface CardStatistic {
  id: string
  user_id: string
  lesson_id: string
  word_id: string
  correct: number
  incorrect: number
  last_reviewed: string
  created_at: string
}

export interface LessonStats {
  totalCards: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  duration: number
  timestamp: string
}
