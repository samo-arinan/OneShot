import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const kaleidoscope: Scene = {
  id: 'kaleidoscope',
  name: '万華鏡',
  category: 'abstract',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#1A001A', '#6B0F6B', '#C050C0', '#FF99FF', '#FFE0FF'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    const cx = W * 0.5
    const cy = H * 0.5
    const maxR = Math.min(W, H) * 0.44

    // Layer 2: 6-way symmetric radial petals
    const symmetry = 6
    const petalLayers = 3
    const petals: string[] = []

    for (let layer = 0; layer < petalLayers; layer++) {
      const layerR = jitter(maxR * (1 - layer * 0.28), coherence, rng, maxR * 0.08)
      const innerR = jitter(layerR * 0.35, coherence, rng, layerR * 0.1)
      const colorIdx = layer % palette.length

      for (let i = 0; i < symmetry; i++) {
        const baseAngle = (i / symmetry) * Math.PI * 2
        const angle = jitter(baseAngle, coherence, rng, 0.15)
        const halfSpan = jitter(Math.PI / symmetry * 0.8, coherence, rng, 0.1)

        const x1 = cx + innerR * Math.cos(angle - halfSpan)
        const y1 = cy + innerR * Math.sin(angle - halfSpan)
        const x2 = cx + layerR * Math.cos(angle)
        const y2 = cy + layerR * Math.sin(angle)
        const x3 = cx + innerR * Math.cos(angle + halfSpan)
        const y3 = cy + innerR * Math.sin(angle + halfSpan)

        const opacity = (0.45 + layer * 0.1 + (coherence * 0.2)).toFixed(2)
        petals.push(
          `<path d="M ${x1.toFixed(2)} ${y1.toFixed(2)} Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${x3.toFixed(2)} ${y3.toFixed(2)} Z"
                fill="${palette[colorIdx]}" opacity="${opacity}" />`
        )
      }
    }

    // Center hexagon accent
    const hexPoints: string[] = []
    const hexR = jitter(maxR * 0.12, coherence, rng, maxR * 0.04)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      hexPoints.push(`${(cx + hexR * Math.cos(a)).toFixed(2)},${(cy + hexR * Math.sin(a)).toFixed(2)}`)
    }

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        ${filter}
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Symmetric radial petals -->
      <g filter="url(#${filterId})">
        ${petals.join('\n        ')}
      </g>

      <!-- Layer 3: Texture overlay -->
      <rect width="${W}" height="${H}" filter="url(#${filterId})"
            fill="${palette[0]}" opacity="${texOpacity}" />

      <!-- Layer 4: Center glow + hexagon accent -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(hexR * 3.5).toFixed(1)}"
              fill="url(#glow-${seed})" />
      <polygon points="${hexPoints.join(' ')}"
               fill="${palette[4]}" opacity="0.85" />
    </svg>`
  },
}
