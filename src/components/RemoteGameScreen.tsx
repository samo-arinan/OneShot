import { useState } from 'react'
import { AbstractArt } from './AbstractArt'
import { t } from '../lib/i18n'
import type { VisualParams } from '../types'

interface RemoteGameScreenProps {
  round: number
  params: VisualParams
  myRole: 'host' | 'guest'
  matchCount: number
  isJudging: boolean
  myGuessSubmitted: boolean
  opponentGuessSubmitted: boolean
  onSubmitGuess: (guess: string) => void
  revealedGuessA?: string | null
  revealedGuessB?: string | null
}

export function RemoteGameScreen({
  round,
  params,
  myRole,
  matchCount,
  isJudging,
  myGuessSubmitted,
  opponentGuessSubmitted,
  onSubmitGuess,
  revealedGuessA,
  revealedGuessB,
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

  const myLabel = myRole === 'host' ? t().player1Label : t().player2Label
  const opponentLabel = myRole === 'host' ? t().player2Label : t().player1Label

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
          <div className="space-y-4">
            {revealedGuessA && revealedGuessB && (
              <div className="bg-gray-900 rounded-lg p-4 w-full">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">{t().player1Label}</span>
                  <span className="text-gray-100">{t().quote(revealedGuessA)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{t().player2Label}</span>
                  <span className="text-gray-100">{t().quote(revealedGuessB)}</span>
                </div>
              </div>
            )}
            <div className="text-center">
              <div className="text-gray-400 animate-pulse text-lg">{t().judging}</div>
            </div>
          </div>
        )}

        {!isJudging && (
          <div className="space-y-4">
            {/* My input box */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                {myLabel} {t().youSuffix}
              </label>
              {!myGuessSubmitted ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t().whatDoYouSee}
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    maxLength={50}
                    autoFocus
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!guess.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-green-400 text-sm">
                  {t().quote(guess)}
                </div>
              )}
            </div>

            {/* Opponent box */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">{opponentLabel}</label>
              <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-sm">
                {opponentGuessSubmitted ? (
                  <span className="text-green-400">{t().submitted}</span>
                ) : (
                  <span className="text-gray-600 animate-pulse">{t().waitingForOpponentAnswer}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
