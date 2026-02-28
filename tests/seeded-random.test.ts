import { describe, it, expect } from 'vitest'
import { SeededRandom, seededRandom } from '../src/lib/seeded-random'

describe('SeededRandom', () => {
  it('produces deterministic sequence for same seed', () => {
    const a = new SeededRandom(42)
    const b = new SeededRandom(42)
    const seqA = Array.from({ length: 10 }, () => a.next())
    const seqB = Array.from({ length: 10 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1) range', () => {
    const rng = new SeededRandom(12345)
    for (let i = 0; i < 1000; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('produces different sequences for different seeds', () => {
    const a = new SeededRandom(1)
    const b = new SeededRandom(2)
    const seqA = Array.from({ length: 5 }, () => a.next())
    const seqB = Array.from({ length: 5 }, () => b.next())
    expect(seqA).not.toEqual(seqB)
  })

  it('range() produces values within bounds', () => {
    const rng = new SeededRandom(99)
    for (let i = 0; i < 100; i++) {
      const v = rng.range(10, 20)
      expect(v).toBeGreaterThanOrEqual(10)
      expect(v).toBeLessThan(20)
    }
  })

  it('int() produces integer values within bounds', () => {
    const rng = new SeededRandom(77)
    for (let i = 0; i < 100; i++) {
      const v = rng.int(5, 10)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(10)
    }
  })

  it('pick() selects from array deterministically', () => {
    const items = ['a', 'b', 'c', 'd']
    const a = new SeededRandom(42)
    const b = new SeededRandom(42)
    expect(a.pick(items)).toBe(b.pick(items))
  })
})

describe('seededRandom closure', () => {
  it('produces same sequence as SeededRandom class', () => {
    const cls = new SeededRandom(42)
    const fn = seededRandom(42)
    for (let i = 0; i < 10; i++) {
      expect(fn()).toBe(cls.next())
    }
  })

  it('two closures with same seed produce identical sequences', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b())
    }
  })

  it('different seeds produce different sequences', () => {
    const a = seededRandom(1)
    const b = seededRandom(2)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).not.toEqual(seqB)
  })
})
