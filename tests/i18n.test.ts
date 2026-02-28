import { describe, it, expect, vi, afterEach } from 'vitest'
import { detectLocale, t, setLocale, getLocale } from '../src/lib/i18n'
import type { Locale } from '../src/lib/i18n'

afterEach(() => {
  vi.unstubAllGlobals()
  setLocale('en')
})

describe('detectLocale', () => {
  it('returns "ja" when navigator.language starts with "ja"', () => {
    vi.stubGlobal('navigator', { language: 'ja-JP' })
    expect(detectLocale()).toBe('ja')
  })

  it('returns "en" for English browser', () => {
    vi.stubGlobal('navigator', { language: 'en-US' })
    expect(detectLocale()).toBe('en')
  })

  it('returns "en" for non-ja language', () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' })
    expect(detectLocale()).toBe('en')
  })

  it('returns "en" when navigator is undefined', () => {
    vi.stubGlobal('navigator', undefined)
    expect(detectLocale()).toBe('en')
  })
})

describe('getLocale / setLocale', () => {
  it('setLocale changes current locale', () => {
    setLocale('ja')
    expect(getLocale()).toBe('ja')
    setLocale('en')
    expect(getLocale()).toBe('en')
  })
})

describe('t()', () => {
  it('returns Japanese messages when locale is ja', () => {
    setLocale('ja')
    expect(t().tagline).toBe('同じものが、見えるか。')
  })

  it('returns English messages when locale is en', () => {
    setLocale('en')
    expect(t().tagline).toBe('Can you see the same thing?')
  })

  it('interpolation functions work for ja', () => {
    setLocale('ja')
    expect(t().answerFrom('ケン')).toContain('ケン')
    expect(t().dontLook('ユキ')).toContain('ユキ')
    expect(t().nameWhatDoYouSee('ケン')).toContain('ケン')
    expect(t().shareScore(3)).toContain('3')
  })

  it('interpolation functions work for en', () => {
    setLocale('en')
    expect(t().answerFrom('Ken')).toContain('Ken')
    expect(t().dontLook('Yuki')).toContain('Yuki')
    expect(t().nameWhatDoYouSee('Ken')).toContain('Ken')
    expect(t().shareScore(3)).toContain('3')
  })
})

describe('player labels', () => {
  it('returns Player 1 / Player 2 for en', () => {
    setLocale('en')
    expect(t().player1Label).toBe('Player 1')
    expect(t().player2Label).toBe('Player 2')
  })

  it('returns プレイヤー1 / プレイヤー2 for ja', () => {
    setLocale('ja')
    expect(t().player1Label).toBe('プレイヤー1')
    expect(t().player2Label).toBe('プレイヤー2')
  })
})

describe('match labels', () => {
  it('returns English match labels', () => {
    setLocale('en')
    expect(t().matchPerfect).toBe('Perfect Match!')
    expect(t().matchClose).toBe('Close!')
    expect(t().matchDifferent).toBe('Different...')
    expect(t().matchOpposite).toBe('Opposite!')
  })

  it('returns Japanese match labels', () => {
    setLocale('ja')
    expect(t().matchPerfect).toBe('完全一致！')
    expect(t().matchClose).toBe('惜しい！')
    expect(t().matchDifferent).toBe('違う...')
    expect(t().matchOpposite).toBe('真逆！')
  })
})

describe('remote mode labels', () => {
  it('returns English remote mode labels', () => {
    setLocale('en')
    expect(t().createRoom).toBe('Create Room')
    expect(t().joinRoom).toBe('Join Room')
    expect(t().roomCode).toBe('Room Code')
    expect(t().copyLink).toBe('Copy link')
    expect(t().linkCopied).toBe('Copied!')
    expect(t().waitingForOpponent).toBe('Waiting for opponent...')
    expect(t().startGame).toBe('Start Game')
    expect(t().yourAnswer).toBe('Your answer')
    expect(t().opponentAnswered).toBe('Opponent has answered')
    expect(t().opponentDisconnected).toContain('disconnected')
    expect(t().reconnecting).toContain('Reconnecting')
    expect(t().enterNickname).toContain('nickname')
  })

  it('returns Japanese remote mode labels', () => {
    setLocale('ja')
    expect(t().createRoom).toContain('ルーム')
    expect(t().joinRoom).toContain('参加')
    expect(t().copyLink).toContain('コピー')
    expect(t().waitingForOpponent).toContain('待')
    expect(t().startGame).toContain('開始')
    expect(t().yourAnswer).toContain('回答')
    expect(t().opponentAnswered).toContain('回答')
    expect(t().opponentDisconnected).toContain('切断')
  })

  it('remote interpolation functions work for en', () => {
    setLocale('en')
    expect(t().shareLink('https://example.com')).toContain('https://example.com')
    expect(t().opponentJoined('Bob')).toContain('Bob')
    expect(t().waitingForAnswer('Bob')).toContain('Bob')
  })

  it('remote interpolation functions work for ja', () => {
    setLocale('ja')
    expect(t().shareLink('https://example.com')).toContain('https://example.com')
    expect(t().opponentJoined('ボブ')).toContain('ボブ')
    expect(t().waitingForAnswer('ボブ')).toContain('ボブ')
  })
})

describe('quote()', () => {
  it('wraps with Japanese brackets for ja', () => {
    setLocale('ja')
    expect(t().quote('猫')).toBe('「猫」')
  })

  it('wraps with double quotes for en', () => {
    setLocale('en')
    expect(t().quote('cat')).toBe('\u201Ccat\u201D')
  })
})

describe('completeness', () => {
  const locales: Locale[] = ['en', 'ja']
  for (const locale of locales) {
    it(`${locale} has no undefined values`, () => {
      setLocale(locale)
      const msgs = t()
      for (const [key, val] of Object.entries(msgs)) {
        expect(val, `${locale}.${key} is undefined`).toBeDefined()
      }
    })
  }

  it('en and ja have the same keys', () => {
    setLocale('en')
    const enKeys = Object.keys(t()).sort()
    setLocale('ja')
    const jaKeys = Object.keys(t()).sort()
    expect(enKeys).toEqual(jaKeys)
  })
})
