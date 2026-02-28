import { describe, it, expect, vi, beforeEach } from 'vitest'
import { judgeGuesses } from '../src/lib/api'
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
  })

  it('sends POST to /api/judge and returns parsed response', async () => {
    const mockResponse: JudgeResponse = { match: 'perfect', comment: '完璧！' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await judgeGuesses(mockRequest)
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith('/api/judge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockRequest),
    })
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
})
