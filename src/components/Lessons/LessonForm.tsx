'use client'

import { useState } from 'react'
import { Lesson } from '@/types'

interface LessonFormProps {
  lesson?: Lesson
  onSubmit: (data: Omit<Lesson, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function LessonForm({
  lesson,
  onSubmit,
  onCancel,
  isLoading = false,
}: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title || '')
  const [description, setDescription] = useState(lesson?.description || '')
  const [languageFrom, setLanguageFrom] = useState<'japanese' | 'ukrainian'>(
    lesson?.language_from || 'japanese'
  )
  const [languageTo, setLanguageTo] = useState<'japanese' | 'ukrainian'>(
    lesson?.language_to || 'ukrainian'
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Введіть назву уроку')
      return
    }

    try {
      await onSubmit({
        title,
        description,
        language_from: languageFrom,
        language_to: languageTo,
      })
    } catch (err: any) {
      setError(err.message || 'Помилка при збереженні')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-lg">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Назва уроку
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Наприклад: Привіти та вирази"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Опис (необов'язково)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Опис уроку..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            З якої мови
          </label>
          <select
            value={languageFrom}
            onChange={(e) => setLanguageFrom(e.target.value as 'japanese' | 'ukrainian')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="japanese">日本語</option>
            <option value="ukrainian">Українська</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            На яку мову
          </label>
          <select
            value={languageTo}
            onChange={(e) => setLanguageTo(e.target.value as 'japanese' | 'ukrainian')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ukrainian">Українська</option>
            <option value="japanese">日本語</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Завантаження...' : 'Зберегти'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Скасувати
        </button>
      </div>
    </form>
  )
}
