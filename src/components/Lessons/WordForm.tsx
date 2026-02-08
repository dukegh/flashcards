'use client'

import { useState } from 'react'
import { Word } from '@/types'

interface WordFormProps {
  word?: Word
  onSubmit: (data: Omit<Word, 'id' | 'lesson_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function WordForm({
  word,
  onSubmit,
  onCancel,
  isLoading = false,
}: WordFormProps) {
  const [japanese, setJapanese] = useState(word?.japanese || '')
  const [ukrainian, setUkrainian] = useState(word?.ukrainian || '')
  const [furigana, setFurigana] = useState(word?.furigana || '')
  const [pronunciation, setPronunciation] = useState(word?.pronunciation || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!japanese.trim() || !ukrainian.trim()) {
      setError('Введіть слово на обох мовах')
      return
    }

    try {
      await onSubmit({
        japanese,
        ukrainian,
        furigana: furigana || undefined,
        pronunciation: pronunciation || undefined,
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Японське слово
          </label>
          <input
            type="text"
            value={japanese}
            onChange={(e) => setJapanese(e.target.value)}
            placeholder="日本語"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Українське слово
          </label>
          <input
            type="text"
            value={ukrainian}
            onChange={(e) => setUkrainian(e.target.value)}
            placeholder="Слово"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Фуригана (необов'язково)
          </label>
          <input
            type="text"
            value={furigana}
            onChange={(e) => setFurigana(e.target.value)}
            placeholder="ふりがな"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Вимова (необов'язково)
          </label>
          <input
            type="text"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            placeholder="Як вимовляти"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Завантаження...' : 'Зберегти слово'}
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
