import { describe, it, expect } from 'vitest'
import type {
  GamePhase,
  SceneCategory,
  MatchLevel,
  VisualParams,
  Scene,
  Point,
  RoundRecord,
  JudgeRequest,
  JudgeResponse,
  GameState,
  GameMode,
  PlayerRole,
  RemoteGameState,
} from '../src/types'

describe('types', () => {
  it('SceneCategory covers all 6 categories', () => {
    const categories: Record<SceneCategory, true> = {
      landscape: true,
      sky: true,
      water: true,
      organic: true,
      structure: true,
      abstract: true,
    }
    expect(Object.keys(categories)).toHaveLength(6)
  })

  it('GamePhase covers all 4 phases', () => {
    const phases: Record<GamePhase, true> = {
      start: true,
      playing: true,
      roundResult: true,
      results: true,
    }
    expect(Object.keys(phases)).toHaveLength(4)
  })

  it('MatchLevel covers all 4 levels', () => {
    const levels: Record<MatchLevel, true> = {
      perfect: true,
      close: true,
      different: true,
      opposite: true,
    }
    expect(Object.keys(levels)).toHaveLength(4)
  })

  it('VisualParams has seed, coherence, sceneId', () => {
    const params: VisualParams = {
      seed: 42,
      coherence: 0.9,
      sceneId: 'test-scene',
    }
    expect(params.seed).toBe(42)
    expect(params.coherence).toBe(0.9)
    expect(params.sceneId).toBe('test-scene')
  })

  it('RoundRecord includes params as VisualParams', () => {
    const record: RoundRecord = {
      round: 1,
      params: { seed: 42, coherence: 0.9, sceneId: 'test' },
      guessA: 'mountain',
      guessB: 'hill',
      match: 'close',
      comment: 'nice',
    }
    expect(record.params.sceneId).toBe('test')
  })

  it('GameState includes previousSceneIds', () => {
    const state: GameState = {
      phase: 'start',
      nicknameA: '',
      nicknameB: '',
      currentRound: 0,
      currentParams: { seed: 0, coherence: 1, sceneId: '' },
      previousSceneIds: [],
      history: [],
      lastResult: null,
      isJudging: false,
      error: null,
      finalComment: null,
      mode: 'local',
      remote: null,
    }
    expect(Array.isArray(state.previousSceneIds)).toBe(true)
  })

  it('GameMode covers local and remote', () => {
    const modes: Record<GameMode, true> = {
      local: true,
      remote: true,
    }
    expect(Object.keys(modes)).toHaveLength(2)
  })

  it('PlayerRole covers host and guest', () => {
    const roles: Record<PlayerRole, true> = {
      host: true,
      guest: true,
    }
    expect(Object.keys(roles)).toHaveLength(2)
  })

  it('RemoteGameState has correct shape', () => {
    const remote: RemoteGameState = {
      roomCode: 'ABC123',
      role: 'host',
      connected: true,
      opponentConnected: false,
      opponentNickname: '',
      myGuessSubmitted: false,
      opponentGuessSubmitted: false,
    }
    expect(remote.roomCode).toBe('ABC123')
    expect(remote.role).toBe('host')
  })

  it('Scene has id, name, category, render', () => {
    const scene: Scene = {
      id: 'test',
      name: 'Test Scene',
      category: 'abstract',
      render: () => '<svg></svg>',
    }
    expect(scene.id).toBe('test')
    expect(scene.category).toBe('abstract')
  })

  it('Point has x and y', () => {
    const p: Point = { x: 10, y: 20 }
    expect(p.x).toBe(10)
    expect(p.y).toBe(20)
  })

  it('JudgeRequest has expected shape', () => {
    const req: JudgeRequest = {
      round: 1,
      nicknameA: 'A',
      nicknameB: 'B',
      guessA: 'sea',
      guessB: 'ocean',
      history: [],
    }
    expect(req.round).toBe(1)
  })

  it('JudgeResponse has match and comment', () => {
    const res: JudgeResponse = {
      match: 'perfect',
      comment: 'wow',
    }
    expect(res.match).toBe('perfect')
  })
})
