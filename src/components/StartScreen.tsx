import { useState } from 'react'
import { t } from '../lib/i18n'

interface StartScreenProps {
  onStart: (nicknameA: string, nicknameB: string) => void
  onCreateRoom?: (nickname: string) => void
  onJoinRoom?: (nickname: string) => void
  roomCodeFromUrl?: string | null
}

export function StartScreen({ onStart, onCreateRoom, onJoinRoom, roomCodeFromUrl }: StartScreenProps) {
  const [nameA, setNameA] = useState('')
  const [nameB, setNameB] = useState('')

  // If arriving via /room/CODE URL, show guest join form
  if (roomCodeFromUrl && onJoinRoom) {
    const canJoin = nameA.trim().length > 0

    const handleJoin = (e: React.FormEvent) => {
      e.preventDefault()
      if (canJoin) {
        onJoinRoom(nameA.trim())
      }
    }

    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold mb-2 tracking-tight">ONE SHOT</h1>
        <p className="text-gray-400 mb-2 text-center">{t().tagline}</p>
        <p className="text-blue-400 text-sm mb-8">{t().roomCode}: {roomCodeFromUrl}</p>
        <form onSubmit={handleJoin} className="w-full max-w-sm space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">{t().enterNickname}</label>
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
          <button
            type="submit"
            disabled={!canJoin}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {t().joinRoom}
          </button>
        </form>
      </div>
    )
  }

  const canStart = nameA.trim().length > 0 && nameB.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (canStart) {
      onStart(nameA.trim(), nameB.trim())
    }
  }

  const handleCreateRoom = () => {
    if (nameA.trim() && onCreateRoom) {
      onCreateRoom(nameA.trim())
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
          <label className="block text-sm text-gray-400 mb-1">{t().player1Label}</label>
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
          <label className="block text-sm text-gray-400 mb-1">{t().player2Label}</label>
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

      {onCreateRoom && (
        <div className="mt-8 w-full max-w-sm">
          <div className="relative flex items-center mb-4">
            <div className="flex-1 border-t border-gray-800" />
            <span className="px-3 text-gray-600 text-sm">or</span>
            <div className="flex-1 border-t border-gray-800" />
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={!nameA.trim()}
            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-700 text-gray-100 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {t().createRoom}
          </button>
        </div>
      )}
    </div>
  )
}
