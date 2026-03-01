import { describe, it, expect } from 'vitest'
import { calmOcean } from '../../src/scenes/water/calm-ocean'
import { seededRandom } from '../../src/lib/seeded-random'
import { runSceneContractTests } from './scene-contract'

runSceneContractTests(calmOcean)

describe('calm-ocean specifics', () => {
  it('contains wave paths', () => {
    const svg = calmOcean.render({ width: 600, height: 400, seed: 42, rng: seededRandom(42) })
    expect(svg).toContain('<path')
  })

  it('has ocean gradient', () => {
    const svg = calmOcean.render({ width: 600, height: 400, seed: 42, rng: seededRandom(42) })
    expect(svg).toContain('linearGradient')
  })
})
