import { describe, it, expect } from 'vitest'
import { fujiMoonlight } from '../../src/scenes/landscape/fuji-moonlight'
import { seededRandom } from '../../src/lib/seeded-random'
import { runSceneContractTests } from './scene-contract'

runSceneContractTests(fujiMoonlight)

describe('fuji-moonlight specifics', () => {
  it('contains mountain ridge path', () => {
    const svg = fujiMoonlight.render({ width: 600, height: 400, seed: 42, rng: seededRandom(42) })
    expect(svg).toContain('<path')
  })

  it('shows moon', () => {
    const svg = fujiMoonlight.render({ width: 600, height: 400, seed: 42, rng: seededRandom(42) })
    expect(svg).toContain('<circle')
  })
})
