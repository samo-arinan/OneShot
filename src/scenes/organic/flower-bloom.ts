import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const flowerBloom: Scene = {
  id: 'flower-bloom',
  name: '花',
  category: 'organic',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#1A0A1E', '#3D1A3D', '#CC3366', '#FF6699', '#FFD700'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const cx = jitter(W * 0.5, coherence, rng, W * 0.06)
    const cy = jitter(H * 0.5, coherence, rng, H * 0.06)

    // Layer 2: Radial petals - ellipses rotated from center
    const petalCount = Math.floor(jitter(7, coherence, rng, 2)) + 5
    const petalLen = jitter(Math.min(W, H) * 0.32, coherence, rng, Math.min(W, H) * 0.06)
    const petalW = jitter(Math.min(W, H) * 0.09, coherence, rng, Math.min(W, H) * 0.02)
    const petals: string[] = []
    for (let i = 0; i < petalCount; i++) {
      const baseAngle = (i / petalCount) * 360
      const angle = jitter(baseAngle, coherence, rng, 15)
      const len = jitter(petalLen, coherence, rng, petalLen * 0.12)
      const w = jitter(petalW, coherence, rng, petalW * 0.15)
      const petalCX = cx + (len / 2) * Math.cos(angle * Math.PI / 180)
      const petalCY = cy + (len / 2) * Math.sin(angle * Math.PI / 180)
      const colorIdx = i % (palette.length - 1) + 1
      const opacity = (0.65 + (i % 3) * 0.1).toFixed(2)
      petals.push(`<ellipse cx="${petalCX.toFixed(1)}" cy="${petalCY.toFixed(1)}"
                   rx="${(len / 2).toFixed(1)}" ry="${w.toFixed(1)}"
                   transform="rotate(${angle.toFixed(1)}, ${petalCX.toFixed(1)}, ${petalCY.toFixed(1)})"
                   fill="${palette[colorIdx]}" opacity="${opacity}" />`)
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.28).toFixed(2)

    // Layer 4: Center stamen
    const stamR = jitter(Math.min(W, H) * 0.07, coherence, rng, Math.min(W, H) * 0.02)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="center-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="1" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0.5" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Petals -->
      <g filter="url(#${filterId})">
        ${petals.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Center stamen -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${stamR.toFixed(1)}"
              fill="url(#center-${seed})" />
    </svg>`
  },
}
