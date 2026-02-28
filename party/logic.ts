import type {
  RoomSyncState,
  ServerMessage,
  VisualParamsWire,
  JudgeResultPayload,
  RoundRecordWire,
} from './protocol'

export interface HandleResult {
  state: RoomSyncState
  messages: ServerMessage[]
}

export function createEmptyState(): RoomSyncState {
  return {
    phase: 'waiting',
    nicknameA: '',
    nicknameB: '',
    currentRound: 0,
    currentParams: null,
    history: [],
    lastResult: null,
    finalComment: null,
    guessASubmitted: false,
    guessBSubmitted: false,
  }
}

export function handleJoin(
  state: RoomSyncState,
  role: 'host' | 'guest',
  nickname: string
): HandleResult {
  const next = { ...state }
  if (role === 'host') {
    next.nicknameA = nickname
  } else {
    next.nicknameB = nickname
  }
  return {
    state: next,
    messages: [{ type: 'player_joined', nickname, role }],
  }
}

export function handleStartRound(
  state: RoomSyncState,
  role: 'host' | 'guest',
  round: number,
  params: VisualParamsWire
): HandleResult {
  if (role !== 'host') {
    return { state, messages: [{ type: 'error', message: 'Only host can start rounds' }] }
  }
  const next: RoomSyncState = {
    ...state,
    phase: 'playing',
    currentRound: round,
    currentParams: params,
    guessASubmitted: false,
    guessBSubmitted: false,
  }
  return {
    state: next,
    messages: [{ type: 'round_start', round, params }],
  }
}

export function handleGuess(
  state: RoomSyncState,
  role: 'host' | 'guest',
  guess: string,
  currentGuessA: string | null,
  currentGuessB: string | null
): HandleResult & { guessA: string | null; guessB: string | null } {
  let guessA = currentGuessA
  let guessB = currentGuessB
  const next = { ...state }

  if (role === 'host') {
    guessA = guess
    next.guessASubmitted = true
  } else {
    guessB = guess
    next.guessBSubmitted = true
  }

  const from = role === 'host' ? 'A' as const : 'B' as const
  const messages: ServerMessage[] = [{ type: 'guess_received', from }]

  if (guessA !== null && guessB !== null) {
    next.phase = 'judging'
    messages.push({ type: 'both_guessed', guessA, guessB })
  }

  return { state: next, messages, guessA, guessB }
}

export function handleJudgeResult(
  state: RoomSyncState,
  role: 'host' | 'guest',
  result: JudgeResultPayload,
  guessA: string,
  guessB: string
): HandleResult {
  if (role !== 'host') {
    return { state, messages: [{ type: 'error', message: 'Only host can submit results' }] }
  }

  const record: RoundRecordWire = {
    round: state.currentRound,
    params: state.currentParams!,
    guessA,
    guessB,
    match: result.match,
    comment: result.comment,
  }

  const isGameOver = result.match === 'different' || result.match === 'opposite'

  const next: RoomSyncState = {
    ...state,
    phase: isGameOver ? 'gameOver' : 'roundResult',
    history: [...state.history, record],
    lastResult: { match: record.match, comment: record.comment },
    finalComment: result.finalComment ?? state.finalComment,
    guessASubmitted: false,
    guessBSubmitted: false,
  }

  const messages: ServerMessage[] = [{ type: 'round_result', record }]

  if (isGameOver) {
    messages.push({
      type: 'game_over',
      history: next.history,
      finalComment: next.finalComment,
    })
  }

  return { state: next, messages }
}

export function handlePlayAgain(state: RoomSyncState): HandleResult {
  const next: RoomSyncState = {
    ...createEmptyState(),
    nicknameA: state.nicknameA,
    nicknameB: state.nicknameB,
  }
  return {
    state: next,
    messages: [{ type: 'room_state', state: next }],
  }
}
