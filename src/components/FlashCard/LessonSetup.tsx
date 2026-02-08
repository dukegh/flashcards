'use client'

import { Lesson, Word } from '@/types'

interface LessonSetupProps {
  lesson: Lesson
  words: Word[]
  onStart: (config: {
    isJapaneseFirst: boolean
    isRandom: boolean
  }) => void
  onBack: () => void
}

export default function LessonSetup({
  lesson,
  words,
  onStart,
  onBack,
}: LessonSetupProps) {
  const handleStart = (isJapaneseFirst: boolean, isRandom: boolean) => {
    onStart({ isJapaneseFirst, isRandom })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-white hover:text-gray-200 flex items-center gap-2"
        >
          ← Повернутися назад
        </button>

        <div className="card mb-8">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-600 mb-4">{lesson.description}</p>
          <p className="text-gray-500">Слів в уроці: {words.length}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Japanese → Ukrainian */}
          <button
            onClick={() => handleStart(true, false)}
            className="card group hover:shadow-xl"
          >
            <div className="text-center">
              <p className="text-5xl mb-4">日本語 →</p>
              <p className="text-2xl mb-6">🇺🇦 Українська</p>
              <p className="text-gray-600 mb-4">Послідовний порядок</p>
              <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg group-hover:bg-blue-600">
                Почати
              </span>
            </div>
          </button>

          {/* Ukrainian → Japanese */}
          <button
            onClick={() => handleStart(false, false)}
            className="card group hover:shadow-xl"
          >
            <div className="text-center">
              <p className="text-5xl mb-4">🇺🇦 Українська →</p>
              <p className="text-2xl mb-6">日本語</p>
              <p className="text-gray-600 mb-4">Послідовний порядок</p>
              <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg group-hover:bg-purple-600">
                Почати
              </span>
            </div>
          </button>

          {/* Japanese → Ukrainian (Random) */}
          <button
            onClick={() => handleStart(true, true)}
            className="card group hover:shadow-xl"
          >
            <div className="text-center">
              <p className="text-5xl mb-4">日本語 →</p>
              <p className="text-2xl mb-6">🇺🇦 Українська</p>
              <p className="text-gray-600 mb-4">Випадковий порядок 🎲</p>
              <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg group-hover:bg-blue-600">
                Почати
              </span>
            </div>
          </button>

          {/* Ukrainian → Japanese (Random) */}
          <button
            onClick={() => handleStart(false, true)}
            className="card group hover:shadow-xl"
          >
            <div className="text-center">
              <p className="text-5xl mb-4">🇺🇦 Українська →</p>
              <p className="text-2xl mb-6">日本語</p>
              <p className="text-gray-600 mb-4">Випадковий порядок 🎲</p>
              <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg group-hover:bg-purple-600">
                Почати
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
