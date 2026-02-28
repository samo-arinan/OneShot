import type { MatchLevel, RoundRecord } from '../types'
import { AbstractArt } from './AbstractArt'
import { t } from '../lib/i18n'

interface ResultsScreenProps {
  nicknameA: string
  nicknameB: string
  history: RoundRecord[]
  finalComment: string | null
  onRestart: () => void
  onShare: () => void
}

const matchIcon: Record<MatchLevel, string> = {
  perfect: 'x',
  close: '~',
  different: '...',
  opposite: '!?',
}

const matchColor: Record<MatchLevel, string> = {
  perfect: 'border-green-800',
  close: 'border-yellow-800',
  different: 'border-gray-800',
  opposite: 'border-red-800',
}

export function ResultsScreen({
  nicknameA,
  nicknameB,
  history,
  finalComment,
  onRestart,
  onShare,
}: ResultsScreenProps) {
  const score = history.filter(
    (r) => r.match === 'perfect' || r.match === 'close'
  ).length

  const displayComment = finalComment
    ?? (history.length > 0 ? history[history.length - 1].comment : '')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-1">Game Over</h2>
      <div className="text-gray-400 text-sm mb-4">
        {nicknameA} & {nicknameB}
      </div>

      <div className="text-5xl font-bold text-blue-400 mb-1">
        {score}
      </div>
      <div className="text-gray-500 text-sm mb-6">
        {score === 0 ? t().roundsMatched : t().roundStreak}
      </div>

      {displayComment && (
        <div className="bg-gray-900 rounded-lg p-4 mb-6 w-full max-w-md">
          <p className="text-gray-300 text-sm italic">{displayComment}</p>
        </div>
      )}

      <div className="w-full max-w-md space-y-3 mb-8">
        {history.map((r) => (
          <div
            key={r.round}
            className={`bg-gray-900 rounded-lg p-3 border-l-4 ${matchColor[r.match]}`}
          >
            <div className="flex items-center gap-3">
              <AbstractArt
                params={r.params}
                width={48}
                height={48}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">Round {r.round}</span>
                  <span className="text-xs">{matchIcon[r.match]}</span>
                </div>
                <div className="text-sm truncate">
                  {nicknameA}: {t().quote(r.guessA)}
                </div>
                <div className="text-sm truncate">
                  {nicknameB}: {t().quote(r.guessB)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        <button
          onClick={onRestart}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-100 py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t().playAgain}
        </button>
        <button
          onClick={onShare}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t().share}
        </button>
      </div>
    </div>
  )
}
