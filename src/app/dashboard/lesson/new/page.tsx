'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LessonForm from '@/components/Lessons/LessonForm'

export default function NewLessonPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleCreateLesson = async (data: any) => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data: newLesson, error } = await supabase
        .from('lessons')
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          language_from: data.language_from,
          language_to: data.language_to,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!newLesson) {
        console.error('No lesson returned from insert')
        alert('Урок створено! Повертаємось до уроків...')
        setTimeout(() => router.push('/dashboard'), 500)
        return
      }

      alert('Урок створено! Тепер додайте слова.')
      setTimeout(() => router.push(`/dashboard/lesson/${newLesson.id}/edit`), 500)
    } catch (error: any) {
      console.error('Create lesson error:', error)
      throw new Error(error.message || 'Помилка при створенні уроку')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-white hover:text-gray-200 flex items-center gap-2"
        >
          ← Повернутися до уроків
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Створити новий урок</h1>

        <LessonForm
          onSubmit={handleCreateLesson}
          onCancel={() => router.push('/dashboard')}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
