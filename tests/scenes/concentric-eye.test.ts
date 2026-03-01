import { describe, it, expect } from 'vitest'
import { concentricEye } from '../../src/scenes/abstract/concentric-eye'
import { seededRandom } from '../../src/lib/seeded-random'
import { runSceneContractTests } from './scene-contract'

runSceneContractTests(concentricEye)

describe('concentric-eye specifics', () => {
  it('contains concentric circles', () => {
    const svg = concentricEye.render({ width: 600, height: 400, seed: 42, coherence: 0.9, rng: seededRandom(42) })
    const circleCount = (svg.match(/<circle/g) || []).length
    expect(circleCount).toBeGreaterThanOrEqual(3)
  })

  it('has radial gradient for background', () => {
    const svg = concentricEye.render({ width: 600, height: 400, seed: 42, coherence: 0.9, rng: seededRandom(42) })
    expect(svg).toContain('radialGradient')
  })
})
