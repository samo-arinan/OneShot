import { useState } from 'react'
import { t } from '../lib/i18n'

interface WaitingScreenProps {
  roomCode: string
  myNickname: string
  onCancel: () => void
}

export function WaitingScreen({ roomCode, myNickname, onCancel }: WaitingScreenProps) {
  const [copied, setCopied] = useState(false)

  const roomUrl = `${window.location.origin}/room/${roomCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-2">{t().roomCode}</h2>
      <div className="text-5xl font-mono font-bold text-blue-400 tracking-widest mb-4">
        {roomCode}
      </div>

      <p className="text-gray-400 text-sm mb-2">{myNickname}</p>

      <p className="text-gray-500 text-sm mb-4 text-center max-w-sm">
        {t().shareLink(roomUrl)}
      </p>

      <button
        onClick={handleCopy}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer mb-8"
      >
        {copied ? t().linkCopied : t().copyLink}
      </button>

      <div className="text-gray-500 text-sm animate-pulse mb-8">
        {t().waitingForOpponent}
      </div>

      <button
        onClick={onCancel}
        className="text-gray-600 hover:text-gray-400 text-sm transition-colors cursor-pointer"
      >
        Cancel
      </button>
    </div>
  )
}
