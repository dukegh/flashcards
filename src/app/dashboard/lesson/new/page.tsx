'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LessonForm from '@/components/Lessons/LessonForm'
import Modal from '@/components/UI/Modal'

export default function NewLessonPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [resultModal, setResultModal] = useState<{ title: string; message: string; redirectTo: string } | null>(null)
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
        setResultModal({
          title: 'Урок створено',
          message: 'Урок створено. Повертаємось до списку уроків.',
          redirectTo: '/dashboard',
        })
        return
      }

      setResultModal({
        title: 'Урок створено',
        message: 'Урок створено! Тепер додайте слова.',
        redirectTo: `/dashboard/lesson/${newLesson.id}/edit`,
      })
    } catch (error: any) {
      console.error('Create lesson error:', error)
      throw new Error(error.message || 'Помилка при створенні уроку')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <Modal
        isOpen={!!resultModal}
        title={resultModal?.title || ''}
        actions={
          <button
            type="button"
            onClick={() => {
              if (resultModal) {
                router.push(resultModal.redirectTo)
              }
            }}
            className="btn-primary w-full"
          >
            Продовжити
          </button>
        }
      >
        <p>{resultModal?.message}</p>
      </Modal>

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
