import { useState } from 'react'
import { t } from '../lib/i18n'
import type { ArtMode } from '../types'

interface StartScreenProps {
  onStart: (artMode: ArtMode) => void
  onCreateRoom?: () => void
  onJoinRoom?: () => void
  roomCodeFromUrl?: string | null
}

export function StartScreen({ onStart, onCreateRoom, onJoinRoom, roomCodeFromUrl }: StartScreenProps) {
  const [artMode, setArtMode] = useState<ArtMode>('classic')
  // Guest join form: just room code + join button
  if (roomCodeFromUrl && onJoinRoom) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
        <h1 className="text-5xl font-bold mb-2 tracking-tight">ONE SHOT</h1>
        <p className="text-gray-400 mb-2 text-center">{t().tagline}</p>
        <p className="text-blue-400 text-sm mb-8">{t().roomCode}: {roomCodeFromUrl}</p>
        <button
          onClick={onJoinRoom}
          className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t().joinRoom}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-2 tracking-tight">ONE SHOT</h1>
      <p className="text-gray-400 mb-10 text-center">
        {t().tagline}
      </p>
      <div className="w-full max-w-sm space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-700">
          {([
            ['classic', t().artModeClassic, 'bg-gray-700'],
            ['ai-script', t().artModeScript, 'bg-blue-600'],
            ['ai-json', t().artModeJson, 'bg-purple-600'],
          ] as const).map(([mode, label, activeBg]) => (
            <button
              key={mode}
              onClick={() => setArtMode(mode as ArtMode)}
              className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                artMode === mode
                  ? `${activeBg} text-white`
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => onStart(artMode)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          One Shot!
        </button>
      </div>

      {onCreateRoom && (
        <div className="mt-8 w-full max-w-sm">
          <div className="relative flex items-center mb-4">
            <div className="flex-1 border-t border-gray-800" />
            <span className="px-3 text-gray-600 text-sm">or</span>
            <div className="flex-1 border-t border-gray-800" />
          </div>
          <button
            onClick={onCreateRoom}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100 py-3 rounded-lg font-medium transition-colors cursor-pointer"
          >
            {t().createRoom}
          </button>
        </div>
      )}
    </div>
  )
}
