'use client'

import { LessonStats, Word } from '@/types'

interface ResultsProps {
  stats: LessonStats
  totalWords: number
  incorrectWords: Word[]
  onRetry: () => void
  onRepeatIncorrect: () => void
  onBack: () => void
}

export default function Results({
  stats,
  totalWords,
  incorrectWords,
  onRetry,
  onRepeatIncorrect,
  onBack,
}: ResultsProps) {
  const durationMinutes = Math.floor(stats.duration / 60)
  const durationSeconds = stats.duration % 60

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-white hover:text-gray-200 flex items-center gap-2"
        >
          ← Повернутися до уроків
        </button>

        <div className="card text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {stats.accuracy >= 80 ? '🎉 Вітаємо!' : '💪 Хорошо!'}
          </h1>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div>
              <p className="text-gray-600 mb-2">Точність</p>
              <p className="text-4xl font-bold text-blue-600">
                {Math.round(stats.accuracy)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Вірно</p>
              <p className="text-4xl font-bold text-green-600">
                {stats.correctAnswers}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Помилок</p>
              <p className="text-4xl font-bold text-red-600">
                {stats.incorrectAnswers}
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Час: {durationMinutes}м {durationSeconds}s
          </p>
        </div>

        {incorrectWords.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4">Слова для повторення</h2>
            <div className="space-y-3 mb-6">
              {incorrectWords.map((word) => (
                <div key={word.id} className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="font-semibold">{word.japanese}</p>
                  <p className="text-gray-600">{word.ukrainian}</p>
                </div>
              ))}
            </div>
            <button
              onClick={onRepeatIncorrect}
              className="btn-secondary w-full"
            >
              📝 Повторити помилки
            </button>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={onRetry} className="btn-primary flex-1">
            🔄 Повторити урок
          </button>
          <button onClick={onBack} className="btn-secondary flex-1">
            📚 До уроків
          </button>
        </div>
      </div>
    </div>
  )
}
