import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { convertRoundToSvg, startPrefetch } from '../src/lib/art-prefetch'

// Mock dependencies
vi.mock('../src/lib/svg-generator', () => ({
  generateRound: vi.fn(),
}))
vi.mock('../src/lib/script-svg-executor', () => ({
  executeSvgScript: vi.fn(),
}))
vi.mock('../src/lib/json-svg-renderer', () => ({
  renderJsonToSvg: vi.fn(),
}))
vi.mock('../src/lib/scene-selector', () => ({
  computeCoherence: vi.fn((round: number) => Math.max(0.1, 1.1 - round * 0.2)),
  generateParams: vi.fn(() => ({ seed: 42, coherence: 0.9, sceneId: 'test-scene' })),
}))

import { generateRound } from '../src/lib/svg-generator'
import { executeSvgScript } from '../src/lib/script-svg-executor'
import { renderJsonToSvg } from '../src/lib/json-svg-renderer'

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

  it('delegates to renderJsonToSvg for json mode', () => {
    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    vi.mocked(renderJsonToSvg).mockReturnValue(mockSvg)
    const scene = JSON.stringify({ background: '#000', elements: [] })

    const result = convertRoundToSvg(scene, false, 'json')
    expect(renderJsonToSvg).toHaveBeenCalledWith({ background: '#000', elements: [] })
    expect(result).toBe(mockSvg)
  })

  it('returns null on json parse error', () => {
    const result = convertRoundToSvg('invalid json', false, 'json')
    expect(result).toBeNull()
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

    const result = startPrefetch(2, 'ai-script', [])
    expect(result.params).toBeDefined()
    expect(result.params.sceneId).toBe('test-scene')
    expect(result.svgContent).toBeNull()
    expect(result.theme).toBeUndefined()
    expect(result.promise).not.toBeNull()
  })

  it('sets svgContent and theme on successful generation (script)', async () => {
    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    vi.mocked(generateRound).mockResolvedValue({
      content: 'some code',
      fallback: false,
      theme: 'volcanic sunset',
    })
    vi.mocked(executeSvgScript).mockReturnValue(mockSvg)

    const result = startPrefetch(2, 'ai-script', [])
    await result.promise

    expect(result.svgContent).toBe(mockSvg)
    expect(result.theme).toBe('volcanic sunset')
    expect(result.promise).toBeNull()
  })

  it('sets svgContent and theme on successful generation (json)', async () => {
    const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
    const scene = JSON.stringify({ background: '#000', elements: [] })
    vi.mocked(generateRound).mockResolvedValue({
      content: scene,
      fallback: false,
      theme: 'cosmic reef',
    })
    vi.mocked(renderJsonToSvg).mockReturnValue(mockSvg)

    const result = startPrefetch(2, 'ai-json', [])
    await result.promise

    expect(result.svgContent).toBe(mockSvg)
    expect(result.theme).toBe('cosmic reef')
    expect(result.promise).toBeNull()
  })

  it('leaves svgContent null on API failure (fallback to classic)', async () => {
    vi.mocked(generateRound).mockRejectedValue(new Error('API error'))

    const result = startPrefetch(2, 'ai-script', [])
    await result.promise

    expect(result.svgContent).toBeNull()
    expect(result.promise).toBeNull()
  })

  it('leaves svgContent null on fallback response', async () => {
    vi.mocked(generateRound).mockResolvedValue({
      content: '',
      fallback: true,
    })

    const result = startPrefetch(2, 'ai-script', [])
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
    const result = startPrefetch(2, 'ai-script', themes)
    await result.promise

    expect(generateRound).toHaveBeenCalledWith(expect.objectContaining({
      previousThemes: themes,
    }))
  })

  it('uses correct mode for ai-script', async () => {
    vi.mocked(generateRound).mockResolvedValue({ content: '', fallback: true })

    const result = startPrefetch(2, 'ai-script', [])
    await result.promise

    expect(generateRound).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'script',
    }))
  })

  it('uses correct mode for ai-json', async () => {
    vi.mocked(generateRound).mockResolvedValue({ content: '', fallback: true })

    const result = startPrefetch(2, 'ai-json', [])
    await result.promise

    expect(generateRound).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'json',
    }))
  })
})
