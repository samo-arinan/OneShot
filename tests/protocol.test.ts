import { describe, it, expect } from 'vitest'
import type {
  ClientMessage,
  ServerMessage,
  RoomSyncState,
  RoomPhase,
  VisualParamsWire,
  RoundRecordWire,
} from '../party/protocol'

describe('protocol types', () => {
  it('RoomPhase covers all 5 phases', () => {
    const phases: Record<RoomPhase, true> = {
      waiting: true,
      playing: true,
      judging: true,
      roundResult: true,
      gameOver: true,
    }
    expect(Object.keys(phases)).toHaveLength(5)
  })

  it('VisualParamsWire has seed, coherence, sceneId', () => {
    const params: VisualParamsWire = {
      seed: 42,
      coherence: 0.9,
      sceneId: 'test-scene',
    }
    expect(params.seed).toBe(42)
    expect(params.coherence).toBe(0.9)
    expect(params.sceneId).toBe('test-scene')
  })

  it('RoundRecordWire has all required fields', () => {
    const record: RoundRecordWire = {
      round: 1,
      params: { seed: 42, coherence: 0.9, sceneId: 'test' },
      guessA: 'mountain',
      guessB: 'hill',
      match: 'close',
      comment: 'nice',
    }
    expect(record.round).toBe(1)
    expect(record.match).toBe('close')
  })

  it('RoomSyncState has correct shape with hasHost/hasGuest', () => {
    const state: RoomSyncState = {
      phase: 'waiting',
      hasHost: false,
      hasGuest: false,
      currentRound: 0,
      currentParams: null,
      history: [],
      lastResult: null,
      finalComment: null,
      guessASubmitted: false,
      guessBSubmitted: false,
    }
    expect(state.phase).toBe('waiting')
    expect(state.hasHost).toBe(false)
    expect(state.hasGuest).toBe(false)
  })

  it('ClientMessage join serializes without nickname', () => {
    const msg: ClientMessage = {
      type: 'join',
      role: 'host',
    }
    const json = JSON.stringify(msg)
    const parsed: ClientMessage = JSON.parse(json)
    expect(parsed.type).toBe('join')
    if (parsed.type === 'join') {
      expect(parsed.role).toBe('host')
    }
  })

  it('ClientMessage submit_guess serializes correctly', () => {
    const msg: ClientMessage = { type: 'submit_guess', guess: 'ocean' }
    const json = JSON.stringify(msg)
    const parsed: ClientMessage = JSON.parse(json)
    expect(parsed.type).toBe('submit_guess')
    if (parsed.type === 'submit_guess') {
      expect(parsed.guess).toBe('ocean')
    }
  })

  it('ClientMessage start_round serializes correctly', () => {
    const msg: ClientMessage = {
      type: 'start_round',
      round: 1,
      params: { seed: 100, coherence: 0.9, sceneId: 'landscape_1' },
    }
    const json = JSON.stringify(msg)
    const parsed: ClientMessage = JSON.parse(json)
    expect(parsed.type).toBe('start_round')
    if (parsed.type === 'start_round') {
      expect(parsed.round).toBe(1)
      expect(parsed.params.sceneId).toBe('landscape_1')
    }
  })

  it('ClientMessage judge_result serializes correctly', () => {
    const msg: ClientMessage = {
      type: 'judge_result',
      result: { match: 'perfect', comment: 'wow' },
    }
    const json = JSON.stringify(msg)
    const parsed: ClientMessage = JSON.parse(json)
    expect(parsed.type).toBe('judge_result')
    if (parsed.type === 'judge_result') {
      expect(parsed.result.match).toBe('perfect')
    }
  })

  it('ClientMessage judge_result with finalComment', () => {
    const msg: ClientMessage = {
      type: 'judge_result',
      result: { match: 'different', comment: 'oh no', finalComment: 'great game' },
    }
    const json = JSON.stringify(msg)
    const parsed: ClientMessage = JSON.parse(json)
    if (parsed.type === 'judge_result') {
      expect(parsed.result.finalComment).toBe('great game')
    }
  })

  it('ServerMessage round_start serializes correctly', () => {
    const msg: ServerMessage = {
      type: 'round_start',
      round: 2,
      params: { seed: 200, coherence: 0.7, sceneId: 'sky_3' },
    }
    const json = JSON.stringify(msg)
    const parsed: ServerMessage = JSON.parse(json)
    expect(parsed.type).toBe('round_start')
    if (parsed.type === 'round_start') {
      expect(parsed.round).toBe(2)
      expect(parsed.params.sceneId).toBe('sky_3')
    }
  })

  it('ServerMessage guess_received serializes correctly', () => {
    const msg: ServerMessage = { type: 'guess_received', from: 'A' }
    const json = JSON.stringify(msg)
    const parsed: ServerMessage = JSON.parse(json)
    if (parsed.type === 'guess_received') {
      expect(parsed.from).toBe('A')
    }
  })

  it('ServerMessage both_guessed serializes correctly', () => {
    const msg: ServerMessage = {
      type: 'both_guessed',
      guessA: 'mountain',
      guessB: 'hill',
    }
    const json = JSON.stringify(msg)
    const parsed: ServerMessage = JSON.parse(json)
    if (parsed.type === 'both_guessed') {
      expect(parsed.guessA).toBe('mountain')
      expect(parsed.guessB).toBe('hill')
    }
  })

  it('ServerMessage game_over serializes correctly', () => {
    const msg: ServerMessage = {
      type: 'game_over',
      history: [],
      finalComment: 'Great game!',
    }
    const json = JSON.stringify(msg)
    const parsed: ServerMessage = JSON.parse(json)
    if (parsed.type === 'game_over') {
      expect(parsed.finalComment).toBe('Great game!')
    }
  })
})
