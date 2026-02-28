import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { judgeGuesses } from '../src/lib/api'
import { setLocale } from '../src/lib/i18n'
import type { JudgeRequest, JudgeResponse } from '../src/types'

const mockRequest: JudgeRequest = {
  round: 1,
  nicknameA: 'ケン',
  nicknameB: 'ユキ',
  guessA: '猫',
  guessB: 'ネコ',
  history: [],
}

describe('judgeGuesses', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setLocale('en')
  })

  afterEach(() => {
    setLocale('en')
  })

  it('sends POST to /api/judge with lang field and returns parsed response', async () => {
    const mockResponse: JudgeResponse = { match: 'perfect', comment: 'Wow!' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await judgeGuesses(mockRequest)
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...mockRequest, lang: 'en' }),
    })
  })

  it('sends lang: ja when locale is Japanese', async () => {
    setLocale('ja')
    const mockResponse: JudgeResponse = { match: 'perfect', comment: '完璧！' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await judgeGuesses(mockRequest)
    const sentBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(sentBody.lang).toBe('ja')
  })

  it('throws on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    })

    await expect(judgeGuesses(mockRequest)).rejects.toThrow('API error 500')
  })

  it('throws on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
    await expect(judgeGuesses(mockRequest)).rejects.toThrow('Network error')
  })

  it('sends isFinal flag when provided', async () => {
    const mockResponse: JudgeResponse = { match: 'different', comment: 'Summary!' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await judgeGuesses({ ...mockRequest, isFinal: true })
    const sentBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(sentBody.isFinal).toBe(true)
  })

  it('does not include isFinal when not provided', async () => {
    const mockResponse: JudgeResponse = { match: 'perfect', comment: 'Wow!' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    await judgeGuesses(mockRequest)
    const sentBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)
    expect(sentBody.isFinal).toBeUndefined()
  })
})
