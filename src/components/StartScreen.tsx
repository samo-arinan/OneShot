import { useState } from 'react'
import { t } from '../lib/i18n'

interface StartScreenProps {
  onStart: (nicknameA: string, nicknameB: string) => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')

  const canStart = nameA.trim().length > 0 && nameB.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canStart) {
      onStart(nameA.trim(), nameB.trim())
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-2 tracking-tight">ONE SHOT</h1>
      <p className="text-gray-400 mb-10 text-center">
        {t().tagline}
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Player 1</label>
          <input
            type="text"
            placeholder={t().nickname}
            value={nameA}
            onChange={(e) => setNameA(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            maxLength={20}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Player 2</label>
          <input
            type="text"
            placeholder={t().nickname}
            value={nameB}
            onChange={(e) => setNameB(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
            maxLength={20}
          />
        </div>
        <button
          type="submit"
          disabled={!canStart}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-medium transition-colors mt-6 cursor-pointer disabled:cursor-not-allowed"
        >
          One Shot!
        </button>
      </form>
    </div>
  )
}
