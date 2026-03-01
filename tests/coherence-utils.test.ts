import { describe, it, expect } from 'vitest'
import { lerp, jitter, distortPath, buildDistortionFilter, distortPalette } from '../src/lib/coherence-utils'
import { seededRandom } from '../src/lib/seeded-random'

describe('lerp', () => {
  it('returns a when t=0', () => {
    expect(lerp(0, 10, 0)).toBe(0)
  })

  it('returns b when t=1', () => {
    expect(lerp(0, 10, 1)).toBe(10)
  })

  it('returns midpoint when t=0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('clamps t below 0', () => {
    expect(lerp(0, 10, -1)).toBe(0)
  })

  it('clamps t above 1', () => {
    expect(lerp(0, 10, 2)).toBe(10)
  })
})

describe('jitter', () => {
  it('returns exact value at coherence=1.0', () => {
    const rng = seededRandom(42)
    expect(jitter(100, 1.0, rng, 50)).toBe(100)
  })

  it('differs from input at coherence=0.0', () => {
    const rng = seededRandom(42)
    const result = jitter(100, 0.0, rng, 50)
    expect(result).not.toBe(100)
  })

  it('stays within maxOffset bounds', () => {
    for (let seed = 0; seed < 100; seed++) {
      const rng = seededRandom(seed)
      const result = jitter(100, 0.0, rng, 50)
      expect(result).toBeGreaterThanOrEqual(50)
      expect(result).toBeLessThanOrEqual(150)
    }
  })

  it('is deterministic for same seed', () => {
    const a = jitter(100, 0.5, seededRandom(42), 50)
    const b = jitter(100, 0.5, seededRandom(42), 50)
    expect(a).toBe(b)
  })
})

describe('distortPath', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 100, y: 50 },
    { x: 200, y: 0 },
  ]

  it('returns same number of points', () => {
    const result = distortPath(points, 0.5, seededRandom(42))
    expect(result).toHaveLength(3)
  })

  it('returns identical points at coherence=1.0', () => {
    const result = distortPath(points, 1.0, seededRandom(42))
    expect(result).toEqual(points)
  })

  it('returns different points at coherence=0.0', () => {
    const result = distortPath(points, 0.0, seededRandom(42))
    const hasChanged = result.some(
      (p, i) => p.x !== points[i].x || p.y !== points[i].y
    )
    expect(hasChanged).toBe(true)
  })

  it('is deterministic for same seed', () => {
    const a = distortPath(points, 0.5, seededRandom(42))
    const b = distortPath(points, 0.5, seededRandom(42))
    expect(a).toEqual(b)
  })
})

describe('buildDistortionFilter', () => {
  it('returns a string containing <filter', () => {
    const result = buildDistortionFilter(0.5, 'test-filter', 42)
    expect(result).toContain('<filter')
  })

  it('contains feTurbulence, feDisplacementMap, feGaussianBlur', () => {
    const result = buildDistortionFilter(0.5, 'test-filter', 42)
    expect(result).toContain('feTurbulence')
    expect(result).toContain('feDisplacementMap')
    expect(result).toContain('feGaussianBlur')
  })

  it('uses the provided filterId', () => {
    const result = buildDistortionFilter(0.5, 'my-filter', 42)
    expect(result).toContain('id="my-filter"')
  })

  it('uses the provided seed in feTurbulence', () => {
    const result = buildDistortionFilter(0.5, 'f', 12345)
    expect(result).toContain('seed="12345"')
  })

  it('has minimal distortion at coherence=1.0', () => {
    const result = buildDistortionFilter(1.0, 'f', 42)
    expect(result).toContain('baseFrequency="0"')
    expect(result).toContain('scale="0"')
    expect(result).toContain('stdDeviation="0"')
  })

  it('has maximum distortion at coherence=0.0', () => {
    const result = buildDistortionFilter(0.0, 'f', 42)
    expect(result).toContain('baseFrequency="0.04"')
    expect(result).toContain('scale="60"')
    expect(result).toContain('stdDeviation="8"')
  })
})

describe('distortPalette', () => {
  const baseColors = ['#1B3A5C', '#0D1B2A', '#2C2C2C']

  it('returns original array at coherence > 0.7', () => {
    const result = distortPalette(baseColors, 0.8, seededRandom(42))
    expect(result).toEqual(baseColors)
  })

  it('returns original array at coherence = 1.0', () => {
    const result = distortPalette(baseColors, 1.0, seededRandom(42))
    expect(result).toEqual(baseColors)
  })

  it('adds extra colors at coherence <= 0.7', () => {
    const result = distortPalette(baseColors, 0.5, seededRandom(42))
    expect(result.length).toBeGreaterThan(baseColors.length)
  })

  it('extra colors are valid hsl strings', () => {
    const result = distortPalette(baseColors, 0.3, seededRandom(42))
    const extras = result.slice(baseColors.length)
    for (const color of extras) {
      expect(color).toMatch(/^hsl\(\d+,\s*[\d.]+%,\s*[\d.]+%\)$/)
    }
  })

  it('is deterministic for same seed', () => {
    const a = distortPalette(baseColors, 0.3, seededRandom(42))
    const b = distortPalette(baseColors, 0.3, seededRandom(42))
    expect(a).toEqual(b)
  })
})
