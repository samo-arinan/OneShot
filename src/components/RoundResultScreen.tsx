import type { MatchLevel, RoundRecord } from '../types'
import { AbstractArt } from './AbstractArt'
import { t } from '../lib/i18n'
import type { Messages } from '../lib/i18n'

interface RoundResultScreenProps {
  record: RoundRecord
  isGameOver: boolean
  onNext: () => void
  isWaiting?: boolean
}

const colorMap: Record<MatchLevel, string> = {
  perfect: 'text-green-400',
  close: 'text-yellow-400',
  different: 'text-gray-400',
  opposite: 'text-red-400',
}

const labelKey: Record<MatchLevel, keyof Messages> = {
  perfect: 'matchPerfect',
  close: 'matchClose',
  different: 'matchDifferent',
  opposite: 'matchOpposite',
}

const emojiMap: Record<MatchLevel, string> = {
  perfect: 'x',
  close: '~',
  different: '...',
  opposite: '!?',
}

export function RoundResultScreen({
  record,
  isGameOver,
  onNext,
  isWaiting = false,
}: RoundResultScreenProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="text-sm text-gray-500 mb-2">Round {record.round}</div>

      <div className={`text-3xl font-bold mb-4 ${colorMap[record.match]}`}>
        {emojiMap[record.match]} {t()[labelKey[record.match]] as string}
      </div>

      <AbstractArt
        params={record.params}
        width={200}
        height={200}
        className="mb-4 opacity-60"
      />

      <div className="bg-gray-900 rounded-lg p-4 mb-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">{t().player1Label}</span>
          <span className="text-gray-100">{t().quote(record.guessA)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">{t().player2Label}</span>
          <span className="text-gray-100">{t().quote(record.guessB)}</span>
        </div>
      </div>

      <p className="text-gray-300 mb-8 text-center max-w-md italic text-sm">
        {record.comment}
      </p>

      {isWaiting ? (
        <div className="text-gray-500 text-sm animate-pulse">
          {t().waitingForOpponent}
        </div>
      ) : (
        <button
          onClick={onNext}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {isGameOver ? t().viewResults : t().nextRound}
        </button>
      )}
    </div>
  )
}
