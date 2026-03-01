export type GamePhase = 'start' | 'playing' | 'roundResult' | 'results'

export type SceneCategory =
  | 'landscape'
  | 'sky'
  | 'water'
  | 'organic'
  | 'structure'
  | 'abstract'

export type MatchLevel = 'perfect' | 'close' | 'different' | 'opposite'

export interface VisualParams {
  seed: number
  coherence?: number
  sceneId: string
  svgContent?: string
  theme?: string
}

export interface Scene {
  id: string
  name: string
  category: SceneCategory
  render: (params: SceneRenderParams) => string
}

export interface SceneRenderParams {
  width: number
  height: number
  seed: number
  rng: () => number
}

export interface Point {
  x: number
  y: number
}

export interface RoundRecord {
  round: number
  params: VisualParams
  guessA: string
  guessB: string
  match: MatchLevel
  comment: string
}

export interface JudgeRequest {
  round: number
  nicknameA: string
  nicknameB: string
  guessA: string
  guessB: string
  history: RoundRecord[]
  isFinal?: boolean
  lang?: 'en' | 'ja'
}

export interface JudgeResponse {
  match: MatchLevel
  comment: string
}

export type ArtMode = 'ai-script'

export interface GenerateRoundRequest {
  mode: 'script' | 'json'
  coherence?: number
  previousThemes?: string[]
  lang?: 'en' | 'ja'
}

export interface GenerateRoundResponse {
  content: string
  fallback: boolean
  theme?: string
}


export type GameMode = 'local' | 'remote'
export type PlayerRole = 'host' | 'guest'

export interface RemoteGameState {
  roomCode: string
  role: PlayerRole
  connected: boolean
  opponentConnected: boolean
  myGuessSubmitted: boolean
  opponentGuessSubmitted: boolean
}

export interface GameState {
  phase: GamePhase
  currentRound: number
  currentParams: VisualParams
  previousSceneIds: string[]
  history: RoundRecord[]
  lastResult: JudgeResponse | null
  isJudging: boolean
  error: string | null
  finalComment: string | null
  mode: GameMode
  artMode: ArtMode
  remote: RemoteGameState | null
}
