'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lesson } from '@/types'

export default function Dashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
