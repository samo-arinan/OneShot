import { describe, it, expect } from 'vitest'
import type { Scene } from '../../src/types'
import { seededRandom } from '../../src/lib/seeded-random'

export function runSceneContractTests(scene: Scene) {
  describe(`Scene contract: ${scene.id}`, () => {
    it('has a non-empty id matching kebab-case', () => {
      expect(scene.id).toBeTruthy()
      expect(scene.id).toMatch(/^[a-z][a-z0-9-]*$/)
    })

    it('has a non-empty name', () => {
      expect(scene.name).toBeTruthy()
    })

    it('has a valid category', () => {
      const valid = ['landscape', 'sky', 'water', 'organic', 'structure', 'abstract']
      expect(valid).toContain(scene.category)
    })

    it('renders valid SVG', () => {
      const rng = seededRandom(42)
      const svg = scene.render({ width: 600, height: 400, seed: 42, rng })
      expect(typeof svg).toBe('string')
      expect(svg).toContain('<svg')
      expect(svg).toContain('</svg>')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    })

    it('is deterministic for same seed', () => {
      const a = scene.render({ width: 600, height: 400, seed: 42, rng: seededRandom(42) })
      const b = scene.render({ width: 600, height: 400, seed: 42, rng: seededRandom(42) })
      expect(a).toBe(b)
    })

    it('produces different output for different seeds', () => {
      const a = scene.render({ width: 600, height: 400, seed: 1, rng: seededRandom(1) })
      const b = scene.render({ width: 600, height: 400, seed: 2, rng: seededRandom(2) })
      expect(a).not.toBe(b)
    })

    it('respects width and height', () => {
      const svg = scene.render({ width: 800, height: 600, seed: 42, rng: seededRandom(42) })
      expect(svg).toContain('800')
      expect(svg).toContain('600')
    })
  })
}
