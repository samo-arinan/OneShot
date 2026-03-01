import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const dandelion: Scene = {
  id: 'dandelion',
  name: 'タンポポの綿毛',
  category: 'organic',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#0A0A1A', '#1A1A3A', '#6A7A8A', '#C8D4DC', '#F0F4F8'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const cx = jitter(W * 0.5, coherence, rng, W * 0.08)
    const cy = jitter(H * 0.5, coherence, rng, H * 0.08)

    // Layer 2: Radiating thin lines with circles at tips
    const rayCount = Math.floor(jitter(24, coherence, rng, 6)) + 16
    const maxLen = jitter(Math.min(W, H) * 0.38, coherence, rng, Math.min(W, H) * 0.07)
    const rays: string[] = []
    for (let i = 0; i < rayCount; i++) {
      const baseAngle = (i / rayCount) * 360
      const angle = jitter(baseAngle, coherence, rng, 360 / rayCount * 0.4)
      const len = jitter(maxLen, coherence, rng, maxLen * 0.2)
      const rad = angle * Math.PI / 180
      const endX = cx + len * Math.cos(rad)
      const endY = cy + len * Math.sin(rad)
      const tipR = jitter(3, coherence, rng, 1.5)
      const opacity = (0.5 + (1 - i / rayCount) * 0.4).toFixed(2)

      rays.push(`<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}" stroke="${palette[2]}" stroke-width="0.8" opacity="${opacity}" />`)
      rays.push(`<circle cx="${endX.toFixed(1)}" cy="${endY.toFixed(1)}" r="${tipR.toFixed(1)}" fill="${palette[4]}" opacity="${opacity}" />`)
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.22).toFixed(2)

    // Layer 4: Center circle accent
    const centerR = jitter(W * 0.025, coherence, rng, W * 0.01)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="center-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0.3" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Radiating lines and tip circles -->
      <g filter="url(#${filterId})">
        ${rays.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Center accent -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(centerR * 2.5).toFixed(1)}"
              fill="url(#center-${seed})" />
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${centerR.toFixed(1)}"
              fill="${palette[4]}" opacity="0.9" />
    </svg>`
  },
}
