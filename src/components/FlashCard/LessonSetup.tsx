'use client'

import { useState } from 'react'
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
  const [isJapaneseFirst, setIsJapaneseFirst] = useState(true)
  const [isRandom, setIsRandom] = useState(false)

  const handleStart = () => {
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

        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Налаштування навчання</h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Напрямок мов навчання</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsJapaneseFirst(true)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  isJapaneseFirst
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-blue-200'
                }`}
              >
                <p className="text-lg font-semibold">日本語 → 🇺🇦 Українська</p>
                <p className="text-sm text-gray-600 mt-1">Спочатку бачиш японське слово</p>
              </button>

              <button
                type="button"
                onClick={() => setIsJapaneseFirst(false)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  !isJapaneseFirst
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-purple-200'
                }`}
              >
                <p className="text-lg font-semibold">🇺🇦 Українська → 日本語</p>
                <p className="text-sm text-gray-600 mt-1">Спочатку бачиш український переклад</p>
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4">
            <div>
              <p className="font-medium text-gray-900">Випадкова послідовність</p>
              <p className="text-sm text-gray-600 mt-1">
                {isRandom ? 'Картки будуть перемішані перед стартом' : 'Картки підуть у порядку додавання'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isRandom}
              aria-label="Перемкнути випадкову послідовність"
              onClick={() => setIsRandom(prev => !prev)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                isRandom ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  isRandom ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button onClick={handleStart} className="btn-primary w-full text-lg py-3">
            Почати
          </button>
        </div>
      </div>
    </div>
  )
}
