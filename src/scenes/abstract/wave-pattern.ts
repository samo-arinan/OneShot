import type { Scene, SceneRenderParams } from '../../types'

export const wavePattern: Scene = {
  id: 'wave-pattern',
  name: '波紋',
  category: 'abstract',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#001A33', '#003D66', '#006699', '#4DB8E8', '#B3E5FC']

    // Layer 1: center of ripples (slightly off-center)
    const cx = W * 0.5
    const cy = H * 0.5

    // Layer 2: Concentric ellipses (water ripples)
    const ringCount = 8
    const maxRx = W * 0.48
    const maxRy = H * 0.48
    const ellipses: string[] = []

    for (let i = ringCount; i >= 1; i--) {
      const t = i / ringCount
      const baseRx = maxRx * t
      const baseRy = maxRy * t
      const rx = baseRx
      const ry = baseRy
      const colorIdx = Math.min(Math.floor(t * palette.length), palette.length - 1)
      const opacity = (0.3 + (ringCount - i) * 0.06).toFixed(2)
      const strokeW = (1.5 + (ringCount - i) * 0.3).toFixed(1)

      ellipses.push(
        `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}"
                  rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}"
                  fill="none" stroke="${palette[colorIdx]}"
                  stroke-width="${strokeW}" opacity="${opacity}" />`
      )
    }

    // Layer 4: accent bright center
    const centerR = Math.min(W, H) * 0.05

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Concentric ellipses -->
        ${ellipses.join('\n        ')}

      <!-- Layer 4: Center glow and accent -->
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(centerR * 4).toFixed(1)}"
              fill="url(#glow-${seed})" />
      <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${centerR.toFixed(1)}"
              fill="${palette[4]}" opacity="0.9" />
    </svg>`
  },
}
