import { useState } from 'react'
import { AbstractArt } from './AbstractArt'
import { t } from '../lib/i18n'
import type { VisualParams } from '../types'

interface RemoteGameScreenProps {
  round: number
  params: VisualParams
  myNickname: string
  opponentNickname: string
  matchCount: number
  isJudging: boolean
  myGuessSubmitted: boolean
  opponentGuessSubmitted: boolean
  onSubmitGuess: (guess: string) => void
}

export function RemoteGameScreen({
  round,
  params,
  myNickname,
  opponentNickname,
  matchCount,
  isJudging,
  myGuessSubmitted,
  opponentGuessSubmitted,
  onSubmitGuess,
}: RemoteGameScreenProps) {
  const [guess, setGuess] = useState('')

  const handleSubmit = () => {
    const trimmed = guess.trim()
    if (trimmed) {
      onSubmitGuess(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-500">Round {round}</span>
        {matchCount > 0 && (
          <span className="text-sm text-green-400">
            {'x'.repeat(matchCount)}
          </span>
        )}
      </div>

      <AbstractArt
        params={params}
        width={360}
        height={360}
        className="mb-6 max-w-full"
      />

      <div className="w-full max-w-sm">
        {isJudging && (
          <div className="text-center">
            <div className="text-gray-400 animate-pulse text-lg">{t().judging}</div>
          </div>
        )}

        {!isJudging && !myGuessSubmitted && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t().nameWhatDoYouSee(myNickname)}
            </label>
            <input
              type="text"
              placeholder={t().whatDoYouSee}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors mb-3"
              maxLength={50}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!guess.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
        )}

        {!isJudging && myGuessSubmitted && (
          <div className="text-center space-y-3">
            <div className="text-green-400 text-sm">{t().yourAnswer}: {t().quote(guess)}</div>
            {opponentGuessSubmitted ? (
              <div className="text-gray-400 text-sm">{t().opponentAnswered}</div>
            ) : (
              <div className="text-gray-500 text-sm animate-pulse">
                {t().waitingForAnswer(opponentNickname)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
