import { describe, it, expect } from 'vitest'
import { selectScene, generateParams } from '../src/lib/scene-selector'
import { seededRandom } from '../src/lib/seeded-random'
import type { Scene } from '../src/types'

const mockScenes: Scene[] = [
  { id: 'a', name: 'A', category: 'landscape', render: () => '' },
  { id: 'b', name: 'B', category: 'sky', render: () => '' },
  { id: 'c', name: 'C', category: 'water', render: () => '' },
  { id: 'd', name: 'D', category: 'organic', render: () => '' },
  { id: 'e', name: 'E', category: 'structure', render: () => '' },
  { id: 'f', name: 'F', category: 'abstract', render: () => '' },
  { id: 'g', name: 'G', category: 'landscape', render: () => '' },
  { id: 'h', name: 'H', category: 'sky', render: () => '' },
]

describe('selectScene', () => {
  it('returns a scene from the pool', () => {
    const rng = seededRandom(42)
    const scene = selectScene(rng, [], mockScenes)
    expect(mockScenes.some(s => s.id === scene.id)).toBe(true)
  })

  it('excludes scenes by id', () => {
    for (let seed = 0; seed < 50; seed++) {
      const rng = seededRandom(seed)
      const scene = selectScene(rng, ['a', 'b'], mockScenes)
      expect(scene.id).not.toBe('a')
      expect(scene.id).not.toBe('b')
    }
  })

  it('excludes categories of excluded scenes', () => {
    // 'a' is landscape, 'b' is sky → exclude landscape and sky categories
    for (let seed = 0; seed < 50; seed++) {
      const rng = seededRandom(seed)
      const scene = selectScene(rng, ['a', 'b'], mockScenes)
      expect(scene.category).not.toBe('landscape')
      expect(scene.category).not.toBe('sky')
    }
  })

  it('falls back to any non-excluded scene if all categories excluded', () => {
    // Exclude all 6 categories by providing one from each
    const excludeIds = ['a', 'b', 'c', 'd', 'e', 'f']
    const rng = seededRandom(42)
    const scene = selectScene(rng, excludeIds, mockScenes)
    // Should still return something (fallback to non-excluded by ID)
    expect(scene).toBeDefined()
    expect(excludeIds).not.toContain(scene.id)
  })

  it('is deterministic for same seed', () => {
    const a = selectScene(seededRandom(42), [], mockScenes)
    const b = selectScene(seededRandom(42), [], mockScenes)
    expect(a.id).toBe(b.id)
  })
})

describe('generateParams', () => {
  it('returns seed and sceneId', () => {
    const params = generateParams(1, [], mockScenes)
    expect(typeof params.seed).toBe('number')
    expect(params.seed).toBeGreaterThan(0)
    expect(typeof params.sceneId).toBe('string')
    expect(params.sceneId.length).toBeGreaterThan(0)
  })

  it('sceneId is a valid scene from the pool', () => {
    const params = generateParams(1, [], mockScenes)
    expect(mockScenes.some(s => s.id === params.sceneId)).toBe(true)
  })

  it('avoids scenes in previousSceneIds (last 2)', () => {
    for (let i = 0; i < 30; i++) {
      const params = generateParams(3, ['a', 'b', 'c'], mockScenes)
      // Only last 2 are excluded: 'b' and 'c'
      expect(params.sceneId).not.toBe('b')
      expect(params.sceneId).not.toBe('c')
    }
  })
})
