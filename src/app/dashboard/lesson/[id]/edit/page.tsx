'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Lesson, Word } from '@/types'
import LessonForm from '@/components/Lessons/LessonForm'
import WordForm from '@/components/Lessons/WordForm'

type EditMode = 'lesson' | 'words' | 'newWord'

export default function EditLessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [editMode, setEditMode] = useState<EditMode>('lesson')
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
        .order('created_at')

      if (wordsError) throw wordsError
      setWords(wordsData || [])
    } catch (error) {
      console.error('Error loading lesson:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLessonUpdate = async (data: any) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          title: data.title,
          description: data.description,
          language_from: data.language_from,
          language_to: data.language_to,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lessonId)

      if (error) throw error
      
      setLesson(prev => prev ? { ...prev, ...data } : null)
      setEditMode('words')
      alert('Урок оновлено!')
    } catch (error: any) {
      throw new Error(error.message || 'Помилка при оновленні')
    } finally {
      setIsSaving(false)
    }
  }

  const handleWordCreate = async (data: any) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('words')
        .insert({
          lesson_id: lessonId,
          japanese: data.japanese,
          ukrainian: data.ukrainian,
          furigana: data.furigana,
          pronunciation: data.pronunciation,
        })

      if (error) throw error
      
      await loadLesson()
      setEditMode('words')
      alert('Слово додано!')
    } catch (error: any) {
      throw new Error(error.message || 'Помилка при додаванні слова')
    } finally {
      setIsSaving(false)
    }
  }

  const handleWordUpdate = async (data: any) => {
    if (!editingWord) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('words')
        .update({
          japanese: data.japanese,
          ukrainian: data.ukrainian,
          furigana: data.furigana,
          pronunciation: data.pronunciation,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingWord.id)

      if (error) throw error
      
      await loadLesson()
      setEditingWord(null)
      setEditMode('words')
      alert('Слово оновлено!')
    } catch (error: any) {
      throw new Error(error.message || 'Помилка при оновленні слова')
    } finally {
      setIsSaving(false)
    }
  }

  const handleWordDelete = async (wordId: string) => {
    if (!confirm('Ви впевнені? Це дію неможливо скасувати.')) return
    
    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', wordId)

      if (error) throw error
      
      await loadLesson()
      alert('Слово видалено!')
    } catch (error: any) {
      alert('Помилка при видаленні: ' + error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-white hover:text-gray-200 flex items-center gap-2"
        >
          ← Повернутися до уроків
        </button>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setEditMode('lesson')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              editMode === 'lesson'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Редагувати урок
          </button>
          <button
            onClick={() => setEditMode('words')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              editMode === 'words' || editMode === 'newWord'
                ? 'bg-white text-blue-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Управління словами ({words.length})
          </button>
        </div>

        {/* Lesson Edit Form */}
        {editMode === 'lesson' && lesson && (
          <LessonForm
            lesson={lesson}
            onSubmit={handleLessonUpdate}
            onCancel={() => setEditMode('words')}
            isLoading={isSaving}
          />
        )}

        {/* Words Management */}
        {editMode === 'words' && (
          <div className="space-y-4">
            <button
              onClick={() => setEditMode('newWord')}
              className="btn-secondary w-full mb-6"
            >
              + Додати нове слово
            </button>

            {words.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 mb-4">Немає слів в цьому уроці</p>
                <button
                  onClick={() => setEditMode('newWord')}
                  className="btn-primary"
                >
                  Додати перше слово
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {words.map((word) => (
                  <div key={word.id} className="card">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">日本語</p>
                        <p className="text-lg font-semibold">{word.japanese}</p>
                        {word.furigana && (
                          <p className="text-sm text-gray-500">{word.furigana}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Українська</p>
                        <p className="text-lg font-semibold">{word.ukrainian}</p>
                      </div>
                    </div>

                    {word.pronunciation && (
                      <p className="text-sm text-gray-600 mb-4">
                        Вимова: {word.pronunciation}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingWord(word)
                          setEditMode('newWord')
                        }}
                        className="btn-secondary flex-1 py-2 text-sm"
                      >
                        ✏️ Редагувати
                      </button>
                      <button
                        onClick={() => handleWordDelete(word.id)}
                        className="btn-danger flex-1 py-2 text-sm"
                      >
                        🗑️ Видалити
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Word Form */}
        {editMode === 'newWord' && (
          <WordForm
            word={editingWord || undefined}
            onSubmit={editingWord ? handleWordUpdate : handleWordCreate}
            onCancel={() => {
              setEditingWord(null)
              setEditMode('words')
            }}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  )
}
