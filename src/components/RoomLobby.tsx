import { t } from '../lib/i18n'

interface RoomLobbyProps {
  roomCode: string
  isHost: boolean
  onStartGame: () => void
}

export function RoomLobby({
  roomCode,
  isHost,
  onStartGame,
}: RoomLobbyProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="text-sm text-gray-500 mb-2">{t().roomCode}: {roomCode}</div>

      <h2 className="text-2xl font-bold mb-6">{t().tagline}</h2>

      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-lg">{t().player1Label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-lg">{t().player2Label}</span>
        </div>
      </div>

      {isHost ? (
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={onStartGame}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
          >
            {t().startGame}
          </button>
        </div>
      ) : (
        <div className="text-gray-500 text-sm animate-pulse">
          {t().waitingForOpponent}
        </div>
      )}
    </div>
  )
}
