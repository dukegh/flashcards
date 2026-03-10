'use client'

import { useState, useEffect } from 'react'
import { Word } from '@/types'

interface CardProps {
  word: Word
  isJapaneseFirst: boolean
  showFurigana: boolean
  onCorrect: () => void
  onIncorrect: () => void
}

export default function Card({ word, isJapaneseFirst, showFurigana, onCorrect, onIncorrect }: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  useEffect(() => {
    setIsFlipped(false)
  }, [word.id])

  const front = isJapaneseFirst ? word.japanese : word.ukrainian
  const back = isJapaneseFirst ? word.ukrainian : word.japanese
  const frontLabel = isJapaneseFirst ? '日本語' : 'Українська'
  const backLabel = isJapaneseFirst ? 'Українська' : '日本語'

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer perspective flex-1 flex flex-col"
      >
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <div className="text-center">
                <p className="text-sm opacity-75 mb-4">{frontLabel}</p>
                <p className="text-4xl font-bold">{front}</p>
              </div>
            </div>
            <div className="flip-card-back">
              <div className="text-center">
                <p className="text-sm opacity-75 mb-4">{backLabel}</p>
                <p className="text-4xl font-bold">{back}</p>
                {showFurigana && word.furigana && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Фурігана</p>
                    <p className="text-xl font-medium text-blue-100">{word.furigana}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-white text-sm mb-2 opacity-75 flex-shrink-0">
        Натисніть на карточку щоб перевернути
      </p>

      <div className="flex gap-3 justify-center flex-shrink-0">
        <button
          onClick={onIncorrect}
          className="btn-danger flex-1 max-w-xs"
        >
          ❌ Помилка
        </button>
        <button
          onClick={onCorrect}
          className="btn-success flex-1 max-w-xs"
        >
          ✅ Вірно
        </button>
      </div>
    </div>
  )
}
