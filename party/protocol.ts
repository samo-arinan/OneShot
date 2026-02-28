import type { MatchLevel } from '../src/types'

// === Wire types (serializable versions of existing types) ===

export interface VisualParamsWire {
  seed: number
  coherence: number
  sceneId: string
}

export interface RoundRecordWire {
  round: number
  params: VisualParamsWire
  guessA: string
  guessB: string
  match: MatchLevel
  comment: string
}

// === Room state ===

export type RoomPhase = 'waiting' | 'playing' | 'judging' | 'roundResult' | 'gameOver'

export interface RoomSyncState {
  phase: RoomPhase
  nicknameA: string
  nicknameB: string
  currentRound: number
  currentParams: VisualParamsWire | null
  history: RoundRecordWire[]
  lastResult: { match: MatchLevel; comment: string } | null
  finalComment: string | null
  guessASubmitted: boolean
  guessBSubmitted: boolean
}

// === Client → Server messages ===

export type ClientMessage =
  | { type: 'join'; nickname: string; role: 'host' | 'guest' }
  | { type: 'start_round'; round: number; params: VisualParamsWire }
  | { type: 'submit_guess'; guess: string }
  | { type: 'judge_result'; result: JudgeResultPayload }
  | { type: 'play_again' }

export interface JudgeResultPayload {
  match: MatchLevel
  comment: string
  finalComment?: string
}

// === Server → Client messages ===

export type ServerMessage =
  | { type: 'room_state'; state: RoomSyncState }
  | { type: 'player_joined'; nickname: string; role: 'host' | 'guest' }
  | { type: 'round_start'; round: number; params: VisualParamsWire }
  | { type: 'guess_received'; from: 'A' | 'B' }
  | { type: 'both_guessed'; guessA: string; guessB: string }
  | { type: 'round_result'; record: RoundRecordWire }
  | { type: 'game_over'; history: RoundRecordWire[]; finalComment: string | null }
  | { type: 'opponent_disconnected' }
  | { type: 'opponent_reconnected' }
  | { type: 'error'; message: string }
