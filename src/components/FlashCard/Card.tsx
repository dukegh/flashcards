'use client'

import { useState, useEffect } from 'react'
import { Word } from '@/types'

interface CardProps {
  word: Word
  isJapaneseFirst: boolean
  onCorrect: () => void
  onIncorrect: () => void
}

export default function Card({ word, isJapaneseFirst, onCorrect, onIncorrect }: CardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Reset flip state when word changes
  useEffect(() => {
    setIsFlipped(false)
  }, [word.id])

  const front = isJapaneseFirst ? word.japanese : word.ukrainian
  const back = isJapaneseFirst ? word.ukrainian : word.japanese
  const frontLabel = isJapaneseFirst ? '日本語' : 'Українська'
  const backLabel = isJapaneseFirst ? 'Українська' : '日本語'

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer perspective mb-4"
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-white text-sm mb-4 opacity-75">
        Натисніть на карточку щоб перевернути
      </p>

      {/* Buttons */}
      <div className="flex gap-4 justify-center">
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
