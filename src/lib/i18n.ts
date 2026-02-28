export type Locale = 'en' | 'ja'

export interface Messages {
  judgeFailed: string
  tagline: string
  nickname: string
  player1Label: string
  player2Label: string
  whatDoYouSee: string
  answerFrom: (name: string) => string
  nameWhatDoYouSee: (name: string) => string
  dontLook: (name: string) => string
  checkAnswers: string
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
}

const ja: Messages = {
  judgeFailed: '判定に失敗しました。もう一度お試しください。',
  tagline: '同じものが、見えるか。',
  nickname: 'ニックネーム',
  player1Label: 'プレイヤー1',
  player2Label: 'プレイヤー2',
  whatDoYouSee: '何に見える？',
  answerFrom: (name) => `${name} から回答`,
  nameWhatDoYouSee: (name) => `${name}、何に見える？`,
  dontLook: (name) => `${name} は見ないでね`,
  checkAnswers: '答え合わせ！',
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
}

const en: Messages = {
  judgeFailed: 'Judging failed. Please try again.',
  tagline: 'Can you see the same thing?',
  nickname: 'Nickname',
  player1Label: 'Player 1',
  player2Label: 'Player 2',
  whatDoYouSee: 'What do you see?',
  answerFrom: (name) => `Answer from ${name}`,
  nameWhatDoYouSee: (name) => `${name}, what do you see?`,
  dontLook: (name) => `No peeking, ${name}!`,
  checkAnswers: 'Check answers!',
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
