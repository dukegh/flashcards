'use client'

import { useState } from 'react'
import { Lesson, Word } from '@/types'

interface LessonSetupProps {
  lesson: Lesson
  words: Word[]
  onStart: (config: {
    isJapaneseFirst: boolean
    isRandom: boolean
    showFurigana: boolean
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
  const [showFurigana, setShowFurigana] = useState(false)

  const handleStart = () => {
    onStart({ isJapaneseFirst, isRandom, showFurigana })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 sm:p-6">
      <div className="max-w-xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 text-white hover:text-gray-200 flex items-center gap-2 text-sm sm:text-base"
        >
          ← Повернутися назад
        </button>

        <div className="card mb-4 sm:mb-6 p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600 mb-3 text-sm sm:text-base">{lesson.description}</p>
          )}
          <p className="text-gray-500 text-sm">Слів в уроці: {words.length}</p>
        </div>

        <div className="card p-4 sm:p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-semibold">Налаштування</h2>
            <p className="text-sm text-gray-600">Обери напрямок і порядок показу карток</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Напрямок мов</p>
            <div className="rounded-2xl bg-gray-100 p-1 grid grid-cols-1 sm:grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setIsJapaneseFirst(true)}
                className={`rounded-xl px-4 py-3 text-sm sm:text-base font-medium text-left transition ${
                  isJapaneseFirst
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-700 hover:bg-white/70'
                }`}
              >
                <div>日本語 → 🇺🇦 Українська</div>
                <div className="mt-1 text-xs font-normal text-gray-500">Спочатку японське слово</div>
              </button>

              <button
                type="button"
                onClick={() => setIsJapaneseFirst(false)}
                className={`rounded-xl px-4 py-3 text-sm sm:text-base font-medium text-left transition ${
                  !isJapaneseFirst
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-700 hover:bg-white/70'
                }`}
              >
                <div>🇺🇦 Українська → 日本語</div>
                <div className="mt-1 text-xs font-normal text-gray-500">Спочатку переклад</div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Випадкова послідовність</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {isRandom ? 'Картки будуть перемішані' : 'Картки підуть по черзі'}
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

          <div className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 text-sm sm:text-base">Показати фурігану</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {showFurigana
                  ? 'На стороні відповіді буде показано фурігану'
                  : 'Фурігана прихована під час вивчення'}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={showFurigana}
              aria-label="Перемкнути показ фурігани"
              onClick={() => setShowFurigana(prev => !prev)}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                showFurigana ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  showFurigana ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button onClick={handleStart} className="btn-primary w-full text-base sm:text-lg py-3">
            Почати
          </button>
        </div>
      </div>
    </div>
  )
}
