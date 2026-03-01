import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractSvgFromResponse, validateSvg, generateRound } from '../src/lib/svg-generator'

describe('extractSvgFromResponse', () => {
  it('extracts SVG from raw text', () => {
    const input = 'Here is the SVG:\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><circle cx="180" cy="180" r="100" fill="red"/></svg>\nDone!'
    const result = extractSvgFromResponse(input)
    expect(result).toContain('<svg')
    expect(result).toContain('</svg>')
    expect(result).not.toContain('Here is')
    expect(result).not.toContain('Done!')
  })

  it('extracts SVG from markdown code fences', () => {
    const input = '```svg\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><rect width="100" height="100"/></svg>\n```'
    const result = extractSvgFromResponse(input)
    expect(result).toContain('<svg')
    expect(result).toContain('</svg>')
  })

  it('extracts SVG from xml code fences', () => {
    const input = '```xml\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><rect width="100" height="100"/></svg>\n```'
    const result = extractSvgFromResponse(input)
    expect(result).toContain('<svg')
  })

  it('returns null for text with no SVG', () => {
    expect(extractSvgFromResponse('No SVG here')).toBeNull()
    expect(extractSvgFromResponse('')).toBeNull()
  })

  it('handles multiline SVG', () => {
    const input = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
  <rect x="0" y="0" width="360" height="360" fill="#001"/>
  <circle cx="180" cy="180" r="50" fill="#f00"/>
</svg>`
    const result = extractSvgFromResponse(input)
    expect(result).toContain('<rect')
    expect(result).toContain('<circle')
  })
})

describe('validateSvg', () => {
  const validSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360"><rect x="0" y="0" width="360" height="360" fill="#123456"/><circle cx="180" cy="180" r="80" fill="#abcdef"/></svg>'

  it('accepts well-formed SVG with xmlns', () => {
    expect(validateSvg(validSvg)).toBe(validSvg)
  })

  it('rejects strings without <svg', () => {
    expect(validateSvg('<div>not svg</div>')).toBeNull()
  })

  it('rejects strings without </svg>', () => {
    expect(validateSvg('<svg xmlns="http://www.w3.org/2000/svg"><circle')).toBeNull()
  })

  it('rejects strings without xmlns', () => {
    expect(validateSvg('<svg viewBox="0 0 360 360"><rect width="100" height="100"/></svg>')).toBeNull()
  })

  it('rejects strings with <script> tags', () => {
    const malicious = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>'
    expect(validateSvg(malicious)).toBeNull()
  })

  it('rejects strings with on* event handlers', () => {
    const malicious = '<svg xmlns="http://www.w3.org/2000/svg"><rect onclick="alert(1)" width="100" height="100"/></svg>'
    expect(validateSvg(malicious)).toBeNull()
  })

  it('rejects strings with onload handler', () => {
    const malicious = '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><rect width="100" height="100"/></svg>'
    expect(validateSvg(malicious)).toBeNull()
  })

  it('rejects strings with javascript: URI', () => {
    const malicious = '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect width="100" height="100"/></a></svg>'
    expect(validateSvg(malicious)).toBeNull()
  })

  it('rejects strings under 50 chars', () => {
    expect(validateSvg('<svg xmlns="http://www.w3.org/2000/svg"/>')).toBeNull()
  })

  it('rejects strings over 50000 chars', () => {
    const huge = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">${'<rect width="10" height="10"/>'.repeat(5000)}</svg>`
    expect(validateSvg(huge)).toBeNull()
  })
})

describe('generateRound', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sends POST to /api/generate-svg with single-round payload', async () => {
    const mockResponse = { content: 'code1', fallback: false, theme: 'volcanic sunset' }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    await generateRound({
      mode: 'script',
    })

    const call = vi.mocked(globalThis.fetch).mock.calls[0]
    expect(call[0]).toBe('/api/generate-svg')
    const body = JSON.parse((call[1] as RequestInit).body as string)
    expect(body.mode).toBe('script')
  })

  it('returns single round response with theme', async () => {
    const mockResponse = { content: 'code1', fallback: false, theme: 'cosmic reef' }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await generateRound({
      mode: 'script',
    })
    expect(result.content).toBe('code1')
    expect(result.fallback).toBe(false)
    expect(result.theme).toBe('cosmic reef')
  })

  it('sends previousThemes for deduplication', async () => {
    const mockResponse = { content: 'code1', fallback: false }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    await generateRound({
      mode: 'script',
      previousThemes: ['ocean waves', 'forest'],
    })

    const call = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse((call[1] as RequestInit).body as string)
    expect(body.previousThemes).toEqual(['ocean waves', 'forest'])
  })

  it('supports json mode', async () => {
    const scene = JSON.stringify({ background: '#000', elements: [] })
    const mockResponse = { content: scene, fallback: false }
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    await generateRound({
      mode: 'json',
    })

    const call = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse((call[1] as RequestInit).body as string)
    expect(body.mode).toBe('json')
  })

  it('throws on non-OK response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Server Error'),
    } as Response)

    await expect(generateRound({
      mode: 'script',
    })).rejects.toThrow('API error 500')
  })
})
