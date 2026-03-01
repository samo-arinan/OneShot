import type { Scene, VisualParams } from '../types'

export function selectScene(
  rng: () => number,
  excludeIds: string[],
  scenes: Scene[]
): Scene {
  const excludeCategories = new Set(
    scenes
      .filter(s => excludeIds.includes(s.id))
      .map(s => s.category)
  )

  let pool = scenes.filter(
    s => !excludeIds.includes(s.id) && !excludeCategories.has(s.category)
  )

  if (pool.length === 0) {
    pool = scenes.filter(s => !excludeIds.includes(s.id))
  }

  if (pool.length === 0) {
    pool = scenes
  }

  return pool[Math.floor(rng() * pool.length)]
}

export function generateParams(
  round: number,
  previousSceneIds: string[],
  scenes: Scene[]
): VisualParams {
  const seed = Math.floor(Math.random() * 2147483646) + 1
  const rng = () => {
    const s = seed
    let state = s | 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const recentIds = previousSceneIds.slice(-2)
  const scene = selectScene(rng, recentIds, scenes)
  return { seed, sceneId: scene.id }
}
