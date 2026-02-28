import { useState } from 'react'
import { AbstractArt } from './AbstractArt'
import { t } from '../lib/i18n'
import type { VisualParams } from '../types'

interface GameScreenProps {
  round: number
  params: VisualParams
  matchCount: number
  isJudging: boolean
  isGeneratingArt?: boolean
  onSubmit: (guessA: string, guessB: string) => void
}

export function GameScreen({
  round,
  params,
  matchCount,
  isJudging,
  isGeneratingArt = false,
  onSubmit,
}: GameScreenProps) {
  const [guessA, setGuessA] = useState('')
  const [guessB, setGuessB] = useState('')
  const [focusedInput, setFocusedInput] = useState<'A' | 'B' | null>(null)

  const maskStyle = { WebkitTextSecurity: 'disc' } as React.CSSProperties

  const canSubmit = guessA.trim().length > 0 && guessB.trim().length > 0

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(guessA.trim(), guessB.trim())
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

      {isGeneratingArt ? (
        <div className="mb-6 w-[360px] h-[360px] max-w-full flex items-center justify-center bg-gray-900 rounded-lg">
          <div className="text-gray-400 animate-pulse">{t().generatingArt}</div>
        </div>
      ) : (
        <AbstractArt
          params={params}
          width={360}
          height={360}
          className="mb-6 max-w-full"
        />
      )}

      <div className="w-full max-w-sm">
        {isJudging ? (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">{t().player1Label}</span>
                <span className="text-gray-100">{t().quote(guessA)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{t().player2Label}</span>
                <span className="text-gray-100">{t().quote(guessB)}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 animate-pulse text-lg">{t().judging}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t().player1Label}</label>
              <input
                type="text"
                autoComplete="off"
                placeholder={t().whatDoYouSee}
                value={guessA}
                onChange={(e) => setGuessA(e.target.value)}
                onFocus={() => setFocusedInput('A')}
                onBlur={() => setFocusedInput(null)}
                style={focusedInput !== 'A' && guessA ? maskStyle : undefined}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={50}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">{t().player2Label}</label>
              <input
                type="text"
                autoComplete="off"
                placeholder={t().whatDoYouSee}
                value={guessB}
                onChange={(e) => setGuessB(e.target.value)}
                onFocus={() => setFocusedInput('B')}
                onBlur={() => setFocusedInput(null)}
                style={focusedInput !== 'B' && guessB ? maskStyle : undefined}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={50}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              One Shot!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
