export type Locale = 'en' | 'ja'

export interface Messages {
  judgeFailed: string
  tagline: string
  player1Label: string
  player2Label: string
  whatDoYouSee: string
  judging: string
  viewResults: string
  nextRound: string
  matchPerfect: string
  matchClose: string
  matchDifferent: string
  matchOpposite: string
  roundsMatched: string
  roundStreak: string
  playAgain: string
  share: string
  shareZero: string
  shareScore: (score: number) => string
  aiFallback: string
  quote: (text: string) => string
  createRoom: string
  joinRoom: string
  roomCode: string
  shareLink: (url: string) => string
  copyLink: string
  linkCopied: string
  waitingForOpponent: string
  opponentJoined: string
  startGame: string
  yourAnswer: string
  waitingForOpponentAnswer: string
  opponentAnswered: string
  opponentDisconnected: string
  reconnecting: string
  youSuffix: string
  submitted: string
  generatingArt: string
  artModeClassic: string
  artModeScript: string
  artModeJson: string
  aiArtUnavailable: string
  onboardingHeading: string
  onboardingBody1: string
  onboardingBody2: string
  onboardingBody3: string
  onboardingStart: string
  onboardingBrief: string
}

const ja: Messages = {
  judgeFailed: '判定に失敗しました。もう一度お試しください。',
  tagline: '同じものが、見えるか。',
  player1Label: 'プレイヤー1',
  player2Label: 'プレイヤー2',
  whatDoYouSee: '何に見える？',
  judging: '判定中...',
  viewResults: '結果を見る',
  nextRound: '次のラウンドへ',
  matchPerfect: '完全一致！',
  matchClose: '惜しい！',
  matchDifferent: '違う...',
  matchOpposite: '真逆！',
  roundsMatched: 'ラウンド一致',
  roundStreak: 'ラウンド連続一致',
  playAgain: 'もう一回',
  share: 'シェア',
  shareZero: `One Shotで0ラウンド...次こそは！ #OneShot`,
  shareScore: (score) => `One Shotで${score}ラウンド連続一致した！ #OneShot`,
  aiFallback: 'AIが混乱しちゃった...',
  quote: (text) => `「${text}」`,
  createRoom: 'ルームを作成',
  joinRoom: 'ルームに参加',
  roomCode: 'ルームコード',
  shareLink: (url) => `このリンクをパートナーに共有: ${url}`,
  copyLink: 'リンクをコピー',
  linkCopied: 'コピーしました！',
  waitingForOpponent: '相手を待っています...',
  opponentJoined: '相手が参加しました！',
  startGame: 'ゲーム開始',
  yourAnswer: 'あなたの回答',
  waitingForOpponentAnswer: '相手の回答を待っています...',
  opponentAnswered: '相手が回答しました',
  opponentDisconnected: '相手が切断しました。再接続を待っています...',
  reconnecting: '再接続中...',
  youSuffix: '(あなた)',
  submitted: '回答済み',
  generatingArt: 'アート生成中...',
  artModeClassic: 'Classic',
  artModeScript: 'AI Script',
  artModeJson: 'AI Scene',
  aiArtUnavailable: 'AI Art が利用できませんでした。Classic モードで表示しています。',
  onboardingHeading: '遊び方',
  onboardingBody1: '2人で同じ抽象アートを見て「何に見える？」を答えるゲーム。',
  onboardingBody2: '答えが一致すれば次のラウンドへ。ラウンドが進むほど絵は抽象的に。',
  onboardingBody3: '答えが合わなくなったらゲーム終了。何ラウンド続けられるか挑戦しよう。',
  onboardingStart: 'はじめる',
  onboardingBrief: '同じ絵を見て「何に見える？」を答え合うゲーム',
}

const en: Messages = {
  judgeFailed: 'Judging failed. Please try again.',
  tagline: 'Can you see the same thing?',
  player1Label: 'Player 1',
  player2Label: 'Player 2',
  whatDoYouSee: 'What do you see?',
  judging: 'Judging...',
  viewResults: 'View results',
  nextRound: 'Next round',
  matchPerfect: 'Perfect Match!',
  matchClose: 'Close!',
  matchDifferent: 'Different...',
  matchOpposite: 'Opposite!',
  roundsMatched: 'rounds matched',
  roundStreak: 'round streak',
  playAgain: 'Play again',
  share: 'Share',
  shareZero: `Scored 0 rounds on One Shot... next time! #OneShot`,
  shareScore: (score) => `Matched ${score} rounds in a row on One Shot! #OneShot`,
  aiFallback: 'The AI got confused...',
  quote: (text) => `\u201C${text}\u201D`,
  createRoom: 'Create Room',
  joinRoom: 'Join Room',
  roomCode: 'Room Code',
  shareLink: (url) => `Share this link with your partner: ${url}`,
  copyLink: 'Copy link',
  linkCopied: 'Copied!',
  waitingForOpponent: 'Waiting for opponent...',
  opponentJoined: 'Opponent has joined!',
  startGame: 'Start Game',
  yourAnswer: 'Your answer',
  waitingForOpponentAnswer: 'Waiting for opponent...',
  opponentAnswered: 'Opponent has answered',
  opponentDisconnected: 'Opponent disconnected. Waiting for reconnection...',
  reconnecting: 'Reconnecting...',
  youSuffix: '(You)',
  submitted: 'Submitted',
  generatingArt: 'Generating artwork...',
  artModeClassic: 'Classic',
  artModeScript: 'AI Script',
  artModeJson: 'AI Scene',
  aiArtUnavailable: 'AI Art unavailable. Showing classic artwork.',
  onboardingHeading: 'How to Play',
  onboardingBody1: 'Two players view the same abstract artwork and answer: "What does this look like?"',
  onboardingBody2: 'If your answers match, you advance. Each round, the artwork gets more abstract.',
  onboardingBody3: 'When you disagree, the game ends. How long can you keep the streak going?',
  onboardingStart: 'Got it',
  onboardingBrief: 'See the same artwork, guess what it looks like — match answers to keep going',
}

const messages: Record<Locale, Messages> = { en, ja }

export function detectLocale(): Locale {
  if (typeof navigator !== 'undefined' && navigator?.language?.startsWith('ja')) {
    return 'ja'
  }
  return 'en'
}

let currentLocale: Locale = detectLocale()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  currentLocale = locale
}

export function t(): Messages {
  return messages[currentLocale]
}
