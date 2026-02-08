'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Lesson, Word, LessonStats } from '@/types'
import LessonSetup from '@/components/FlashCard/LessonSetup'
import Card from '@/components/FlashCard/Card'
import Results from '@/components/FlashCard/Results'

type View = 'setup' | 'learning' | 'results'

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [view, setView] = useState<View>('setup')
  const [isJapaneseFirst, setIsJapaneseFirst] = useState(true)
  const [isRandom, setIsRandom] = useState(false)
  const [stats, setStats] = useState<LessonStats | null>(null)
  const [cardStats, setCardStats] = useState<Record<string, boolean>>({})
  const [startTime, setStartTime] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadLesson()
  }, [])

  const loadLesson = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('lesson_id', lessonId)

      if (wordsError) throw wordsError
      setWords(wordsData || [])
    } catch (error) {
      console.error('Error loading lesson:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartLesson = async (config: {
    isJapaneseFirst: boolean
    isRandom: boolean
  }) => {
    setIsJapaneseFirst(config.isJapaneseFirst)
    setIsRandom(config.isRandom)
    
    let orderedWords = [...words]
    if (config.isRandom) {
      orderedWords = orderedWords.sort(() => Math.random() - 0.5)
    }
    
    setWords(orderedWords)
    setCardStats({})
    setCurrentCardIndex(0)
    setStartTime(Date.now())
    setView('learning')
  }

  const handleCorrect = () => {
    const currentWord = words[currentCardIndex]
    setCardStats(prev => ({
      ...prev,
      [currentWord.id]: true // true = correct
    }))
    nextCard()
  }

  const handleIncorrect = () => {
    const currentWord = words[currentCardIndex]
    setCardStats(prev => ({
      ...prev,
      [currentWord.id]: false // false = incorrect
    }))
    nextCard()
  }

  const nextCard = () => {
    if (currentCardIndex < words.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    } else {
      finishLesson()
    }
  }

  const finishLesson = () => {
    const correctCount = Object.values(cardStats).filter(result => result === true).length
    const incorrectCount = Object.values(cardStats).filter(result => result === false).length
    const totalAttempts = correctCount + incorrectCount
    const accuracy = totalAttempts > 0 
      ? (correctCount / totalAttempts) * 100 
      : 0

    const duration = Math.round((Date.now() - startTime) / 1000)

    const incorrectWords = words.filter(word => 
      cardStats[word.id] === false
    )

    setStats({
      totalCards: words.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      accuracy,
      duration,
      timestamp: new Date().toISOString(),
    })

    setView('results')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Завантаження...</div>
      </div>
    )
  }

  if (!lesson || words.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="max-w-2xl mx-auto card text-center py-12">
          <p className="text-2xl text-gray-600 mb-4">Уроку не знайдено або немає слів</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Повернутися до уроків
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {view === 'setup' && (
        <LessonSetup
          lesson={lesson}
          words={words}
          onStart={handleStartLesson}
          onBack={() => router.push('/dashboard')}
        />
      )}

      {view === 'learning' && (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8 text-white">
              <button
                onClick={() => {
                  setView('setup')
                  setCurrentCardIndex(0)
                }}
                className="hover:text-gray-200"
              >
                ← Назад
              </button>
              <div className="text-center">
                <p className="text-sm opacity-75">Прогрес</p>
                <p className="text-2xl font-bold">
                  {currentCardIndex + 1} / {words.length}
                </p>
              </div>
              <div></div>
            </div>

            <Card
              word={words[currentCardIndex]}
              isJapaneseFirst={isJapaneseFirst}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
            />
          </div>
        </div>
      )}

      {view === 'results' && stats && (
        <Results
          stats={stats}
          totalWords={words.length}
          incorrectWords={words.filter(word => cardStats[word.id]?.incorrect > 0)}
          onRetry={() => handleStartLesson({ isJapaneseFirst, isRandom })}
          onRepeatIncorrect={() => {
            const incorrectWords = words.filter(word => cardStats[word.id]?.incorrect > 0)
            setWords(incorrectWords)
            setCardStats({})
            setCurrentCardIndex(0)
            setStartTime(Date.now())
            setView('learning')
          }}
          onBack={() => router.push('/dashboard')}
        />
      )}
    </>
  )
}
