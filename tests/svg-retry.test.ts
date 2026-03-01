import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSvgWithRetry } from '../src/lib/art-prefetch'

vi.mock('../src/lib/svg-generator', () => ({
  generateRound: vi.fn(),
}))
vi.mock('../src/lib/script-svg-executor', () => ({
  executeSvgScript: vi.fn(),
}))

import { generateRound } from '../src/lib/svg-generator'
import { executeSvgScript } from '../src/lib/script-svg-executor'

const VALID_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><circle cx="180" cy="180" r="80" fill="red"/></svg>'

describe('generateSvgWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns SVG on first successful generation', async () => {
    vi.mocked(generateRound).mockResolvedValue({
      content: 'good code',
      fallback: false,
      theme: 'sunset',
    })
    vi.mocked(executeSvgScript).mockReturnValue(VALID_SVG)

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBe(VALID_SVG)
    expect(result.theme).toBe('sunset')
    expect(generateRound).toHaveBeenCalledTimes(1)
  })

  it('retries API when first attempt produces invalid SVG', async () => {
    vi.mocked(generateRound)
      .mockResolvedValueOnce({ content: 'bad code', fallback: false, theme: 'broken' })
      .mockResolvedValueOnce({ content: 'good code', fallback: false, theme: 'sunset' })
    vi.mocked(executeSvgScript)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(VALID_SVG)

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBe(VALID_SVG)
    expect(result.theme).toBe('sunset')
    expect(generateRound).toHaveBeenCalledTimes(2)
  })

  it('retries API when first attempt returns fallback response', async () => {
    vi.mocked(generateRound)
      .mockResolvedValueOnce({ content: '', fallback: true })
      .mockResolvedValueOnce({ content: 'good code', fallback: false, theme: 'ocean' })
    vi.mocked(executeSvgScript).mockReturnValue(VALID_SVG)

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBe(VALID_SVG)
    expect(result.theme).toBe('ocean')
    expect(generateRound).toHaveBeenCalledTimes(2)
  })

  it('retries on API error (exception)', async () => {
    vi.mocked(generateRound)
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ content: 'good code', fallback: false, theme: 'forest' })
    vi.mocked(executeSvgScript).mockReturnValue(VALID_SVG)

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBe(VALID_SVG)
    expect(result.theme).toBe('forest')
    expect(generateRound).toHaveBeenCalledTimes(2)
  })

  it('returns null after all retries exhausted (3 attempts total)', async () => {
    vi.mocked(generateRound).mockResolvedValue({
      content: 'bad code',
      fallback: false,
      theme: 'broken',
    })
    vi.mocked(executeSvgScript).mockReturnValue(null)

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBeNull()
    expect(result.theme).toBeUndefined()
    expect(generateRound).toHaveBeenCalledTimes(3)
  })

  it('returns null after all API errors', async () => {
    vi.mocked(generateRound).mockRejectedValue(new Error('API down'))

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBeNull()
    expect(result.theme).toBeUndefined()
    expect(generateRound).toHaveBeenCalledTimes(3)
  })

  it('passes previousThemes to every attempt', async () => {
    vi.mocked(generateRound).mockResolvedValue({
      content: 'bad code',
      fallback: false,
    })
    vi.mocked(executeSvgScript).mockReturnValue(null)

    const themes = ['ocean', 'forest']
    await generateSvgWithRetry(themes)

    for (const call of vi.mocked(generateRound).mock.calls) {
      expect(call[0]).toEqual(expect.objectContaining({
        mode: 'script',
        previousThemes: themes,
      }))
    }
  })

  it('succeeds on third attempt after two failures', async () => {
    vi.mocked(generateRound)
      .mockRejectedValueOnce(new Error('error 1'))
      .mockResolvedValueOnce({ content: 'bad', fallback: false })
      .mockResolvedValueOnce({ content: 'good', fallback: false, theme: 'stars' })
    vi.mocked(executeSvgScript)
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(VALID_SVG)

    const result = await generateSvgWithRetry([])
    expect(result.svgContent).toBe(VALID_SVG)
    expect(result.theme).toBe('stars')
    expect(generateRound).toHaveBeenCalledTimes(3)
  })
})
