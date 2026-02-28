import { useState } from 'react'
import { AbstractArt } from './AbstractArt'
import { t } from '../lib/i18n'
import type { VisualParams } from '../types'

type InputPhase = 'viewing' | 'playerA' | 'playerB' | 'confirm'

interface GameScreenProps {
  round: number
  params: VisualParams
  nicknameA: string
  nicknameB: string
  matchCount: number
  isJudging: boolean
  onSubmit: (guessA: string, guessB: string) => void
}

export function GameScreen({
  round,
  params,
  nicknameA,
  nicknameB,
  matchCount,
  isJudging,
  onSubmit,
}: GameScreenProps) {
  const [phase, setPhase] = useState<InputPhase>('viewing')
  const [guessA, setGuessA] = useState('')
  const [guessB, setGuessB] = useState('')

  const handleNextPhase = () => {
    if (phase === 'viewing') setPhase('playerA')
    else if (phase === 'playerA' && guessA.trim()) setPhase('playerB')
    else if (phase === 'playerB' && guessB.trim()) setPhase('confirm')
  }

  const handleSubmit = () => {
    if (guessA.trim() && guessB.trim()) {
      onSubmit(guessA.trim(), guessB.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
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
        {phase === 'viewing' && (
          <div className="text-center">
            <p className="text-gray-400 mb-4">{t().whatDoYouSee}</p>
            <button
              onClick={handleNextPhase}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              {t().answerFrom(nicknameA)}
            </button>
          </div>
        )}

        {phase === 'playerA' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t().nameWhatDoYouSee(nicknameA)}
            </label>
            <p className="text-xs text-gray-600 mb-2">
              {t().dontLook(nicknameB)}
            </p>
            <input
              type="text"
              placeholder={t().whatDoYouSee}
              value={guessA}
              onChange={(e) => setGuessA(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleNextPhase)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors mb-3"
              maxLength={50}
              autoFocus
            />
            <button
              onClick={handleNextPhase}
              disabled={!guessA.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
        )}

        {phase === 'playerB' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {t().nameWhatDoYouSee(nicknameB)}
            </label>
            <p className="text-xs text-gray-600 mb-2">
              {t().dontLook(nicknameA)}
            </p>
            <input
              type="text"
              placeholder={t().whatDoYouSee}
              value={guessB}
              onChange={(e) => setGuessB(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleNextPhase)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors mb-3"
              maxLength={50}
              autoFocus
            />
            <button
              onClick={handleNextPhase}
              disabled={!guessB.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              OK
            </button>
          </div>
        )}

        {phase === 'confirm' && !isJudging && (
          <div className="text-center">
            <div className="bg-gray-900 rounded-lg p-4 mb-4 space-y-2">
              <div className="text-sm text-gray-400">{nicknameA}</div>
              <div className="text-lg">{t().quote(guessA)}</div>
              <div className="border-t border-gray-800 my-2" />
              <div className="text-sm text-gray-400">{nicknameB}</div>
              <div className="text-lg">{t().quote(guessB)}</div>
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              {t().checkAnswers}
            </button>
          </div>
        )}

        {isJudging && (
          <div className="text-center">
            <div className="text-gray-400 animate-pulse text-lg">{t().judging}</div>
          </div>
        )}
      </div>
    </div>
  )
}
