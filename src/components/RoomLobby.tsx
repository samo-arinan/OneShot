import { t } from '../lib/i18n'

interface RoomLobbyProps {
  roomCode: string
  nicknameA: string
  nicknameB: string
  isHost: boolean
  onStartGame: () => void
}

export function RoomLobby({
  roomCode,
  nicknameA,
  nicknameB,
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
          <span className="text-lg">{nicknameA}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-lg">{nicknameB}</span>
        </div>
      </div>

      {isHost ? (
        <button
          onClick={onStartGame}
          className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t().startGame}
        </button>
      ) : (
        <div className="text-gray-500 text-sm animate-pulse">
          {t().waitingForAnswer(nicknameA)}
        </div>
      )}
    </div>
  )
}
