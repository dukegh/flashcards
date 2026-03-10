'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lesson } from '@/types'
import Modal from '@/components/UI/Modal'

export default function Dashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [wordCounts, setWordCounts] = useState<Record<string, number>>({})
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [statusModal, setStatusModal] = useState<{ title: string; message: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    loadLessons()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/')
    } else {
      setUser(user)
    }
  }

  const loadLessons = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLessons(data || [])

      // Load word counts for each lesson
      const counts: Record<string, number> = {}
      for (const lesson of data || []) {
        const { count, error: countError } = await supabase
          .from('words')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lesson.id)

        if (!countError && count !== null) {
          counts[lesson.id] = count
        }
      }
      setWordCounts(counts)
    } catch (error) {
      console.error('Error loading lessons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteLesson = async (lessonId: string) => {
    setIsDeleting(true)
    try {
      // Get current session/token
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const responseData = await response.json()
      console.log('Delete response:', { status: response.status, data: responseData })

      if (!response.ok) {
        const errorMsg = responseData?.error || 'Failed to delete lesson'
        throw new Error(errorMsg)
      }

      // Remove from local state
      setLessons(lessons.filter(l => l.id !== lessonId))
      setDeleteConfirmId(null)
      setStatusModal({ title: 'Готово', message: 'Урок видалено.' })
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      setStatusModal({ title: 'Помилка', message: error.message || 'Не вдалося видалити урок.' })
    } finally {
      setIsDeleting(false)
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
      <Modal
        isOpen={!!statusModal}
        title={statusModal?.title || ''}
        onClose={() => setStatusModal(null)}
        actions={
          <button
            type="button"
            onClick={() => setStatusModal(null)}
            className="btn-primary flex-1"
          >
            OK
          </button>
        }
      >
        <p>{statusModal?.message}</p>
      </Modal>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">📚 Flash Cards</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Вихід
          </button>
        </div>

        {user && (
          <p className="text-white mb-6 opacity-90">
            Ласкаво просимо, {user.email}!
          </p>
        )}

        {/* Create Lesson Button */}
        <button
          onClick={() => router.push('/dashboard/lesson/new')}
          className="btn-secondary mb-8 text-lg"
        >
          + Створити новий урок
        </button>

        {/* Lessons Grid */}
        {lessons.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-2xl text-gray-600 mb-4">Уроків немає</p>
            <p className="text-gray-500 mb-6">
              Створіть свій перший урок щоб почати навчатися
            </p>
            <button
              onClick={() => router.push('/dashboard/lesson/new')}
              className="btn-primary"
            >
              Створити урок
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="card cursor-pointer hover:shadow-xl">
                <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-gray-600 mb-4">{lesson.description}</p>
                <div className="flex gap-2 mb-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {lesson.language_from === 'japanese' ? '日本語' : 'Українська'}
                  </span>
                  <span>→</span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    {lesson.language_to === 'japanese' ? '日本語' : 'Українська'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  📇 Карток: {wordCounts[lesson.id] || 0}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/lesson/${lesson.id}`)}
                    className="btn-primary flex-1 py-1 text-sm"
                  >
                    Вивчати
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/lesson/${lesson.id}/edit`)}
                    className="btn-secondary flex-1 py-1 text-sm"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(lesson.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm"
                    title="Видалити урок"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirmId}
          title="Видалити урок?"
          onClose={isDeleting ? undefined : () => setDeleteConfirmId(null)}
          actions={
            <>
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="btn-secondary flex-1 py-2"
              >
                Скасувати
              </button>
              <button
                onClick={() => deleteConfirmId && handleDeleteLesson(deleteConfirmId)}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-bold py-2 px-4 rounded flex-1"
              >
                {isDeleting ? 'Видалення...' : '🗑️ Видалити'}
              </button>
            </>
          }
        >
          <p>Це видалить урок та всі картки в ньому. Цю дію неможливо повернути.</p>
        </Modal>
      </div>
    </div>
  )
}
