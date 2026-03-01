import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { convertRoundToSvg, startPrefetch } from '../src/lib/art-prefetch'

// Mock dependencies
vi.mock('../src/lib/svg-generator', () => ({
  generateRound: vi.fn(),
}))
vi.mock('../src/lib/script-svg-executor', () => ({
  executeSvgScript: vi.fn(),
}))
vi.mock('../src/lib/scene-selector', () => ({
  generateParams: vi.fn(() => ({ seed: 42, sceneId: 'test-scene' })),
}))

import { generateRound } from '../src/lib/svg-generator'
import { executeSvgScript } from '../src/lib/script-svg-executor'

describe('convertRoundToSvg', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for fallback content', () => {
    expect(convertRoundToSvg('', true, 'script')).toBeNull()
  })

  it('returns null for empty content', () => {
    expect(convertRoundToSvg('', false, 'script')).toBeNull()
  })

  it('delegates to executeSvgScript for script mode', () => {
    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    vi.mocked(executeSvgScript).mockReturnValue(mockSvg)

    const result = convertRoundToSvg('some code', false, 'script')
    expect(executeSvgScript).toHaveBeenCalledWith('some code', 360, 360)
    expect(result).toBe(mockSvg)
  })

  it('returns null when executeSvgScript returns null', () => {
    vi.mocked(executeSvgScript).mockReturnValue(null)
    const result = convertRoundToSvg('bad code', false, 'script')
    expect(result).toBeNull()
  })
})

describe('startPrefetch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns PrefetchedRound with pending promise', () => {
    vi.mocked(generateRound).mockReturnValue(new Promise(() => {}))

    const result = startPrefetch('ai-script', [])
    expect(result.params).toBeDefined()
    expect(result.params.sceneId).toBe('test-scene')
    expect(result.svgContent).toBeNull()
    expect(result.theme).toBeUndefined()
    expect(result.promise).not.toBeNull()
  })

  it('sets svgContent and theme on successful generation', async () => {
    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    vi.mocked(generateRound).mockResolvedValue({
      content: 'some code',
      fallback: false,
      theme: 'volcanic sunset',
    })
    vi.mocked(executeSvgScript).mockReturnValue(mockSvg)

    const result = startPrefetch('ai-script', [])
    await result.promise

    expect(result.svgContent).toBe(mockSvg)
    expect(result.theme).toBe('volcanic sunset')
    expect(result.promise).toBeNull()
  })

  it('leaves svgContent null on API failure (fallback to classic)', async () => {
    vi.mocked(generateRound).mockRejectedValue(new Error('API error'))

    const result = startPrefetch('ai-script', [])
    await result.promise

    expect(result.svgContent).toBeNull()
    expect(result.promise).toBeNull()
  })

  it('leaves svgContent null on fallback response', async () => {
    vi.mocked(generateRound).mockResolvedValue({
      content: '',
      fallback: true,
    })

    const result = startPrefetch('ai-script', [])
    await result.promise

    expect(result.svgContent).toBeNull()
    expect(result.promise).toBeNull()
  })

  it('passes previousThemes to generateRound', async () => {
    vi.mocked(generateRound).mockResolvedValue({
      content: 'code',
      fallback: false,
    })
    vi.mocked(executeSvgScript).mockReturnValue(null)

    const themes = ['ocean', 'forest']
    const result = startPrefetch('ai-script', themes)
    await result.promise

    expect(generateRound).toHaveBeenCalledWith(expect.objectContaining({
      previousThemes: themes,
    }))
  })

  it('always uses script mode', async () => {
    vi.mocked(generateRound).mockResolvedValue({ content: '', fallback: true })

    const result = startPrefetch('ai-script', [])
    await result.promise

    expect(generateRound).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'script',
    }))
  })
})
