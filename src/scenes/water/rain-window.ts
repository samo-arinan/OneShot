import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const rainWindow: Scene = {
  id: 'rain-window',
  name: '雨の窓',
  category: 'water',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#2a3a4a', '#3a5060', '#6080a0', '#8090b0', '#c0d0e0'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Blurred background colors (seen through a wet window)
    const bgBlobs: string[] = []
    for (let i = 0; i < 4; i++) {
      const bx = rng() * W
      const by = rng() * H
      const br = jitter(80, coherence, rng, 40)
      const colorIdx = Math.floor(rng() * palette.length)
      bgBlobs.push(`<ellipse cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" rx="${br.toFixed(1)}" ry="${(br * 0.8).toFixed(1)}" fill="${palette[colorIdx]}" opacity="0.4" />`)
    }

    // Layer 2: Vertical rain streaks flowing down
    const rainLines: string[] = []
    const rainCount = Math.floor(jitter(25, coherence, rng, 12))
    for (let i = 0; i < rainCount; i++) {
      const rx = rng() * W
      const startY = rng() * H * 0.3
      const endY = startY + jitter(H * 0.5, coherence, rng, H * 0.3)
      const clampedEndY = Math.min(endY, H)
      // Small horizontal drift
      const drift = jitter(0, coherence, rng, 15)
      const strokeW = (0.5 + rng() * 1.5).toFixed(1)
      const opacity = (0.2 + rng() * 0.5).toFixed(2)
      rainLines.push(`<line x1="${rx.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${(rx + drift).toFixed(1)}" y2="${clampedEndY.toFixed(1)}" stroke="${palette[4]}" stroke-width="${strokeW}" opacity="${opacity}" />`)
    }

    // Droplets (small bulges at the end of streaks)
    const droplets: string[] = []
    const dropCount = Math.floor(jitter(10, coherence, rng, 6))
    for (let i = 0; i < dropCount; i++) {
      const dx = rng() * W
      const dy = rng() * H * 0.9
      const dr = jitter(3, coherence, rng, 2)
      droplets.push(`<ellipse cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" rx="${dr.toFixed(1)}" ry="${(dr * 1.5).toFixed(1)}" fill="${palette[4]}" opacity="0.35" />`)
    }

    const texOpacity = ((1.0 - coherence) * 0.2).toFixed(2)

    // Layer 4: Window glare / light reflection
    const glareX = jitter(W * 0.3, coherence, rng, W * 0.2)
    const glareOpacity = (coherence * 0.15).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="bg-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <radialGradient id="glare-${seed}" cx="${(glareX / W).toFixed(2)}" cy="0.2" r="0.5">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.3" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background (blurred outside view) -->
        <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />
        <g filter="url(#${filterId})">
          ${bgBlobs.join('\n          ')}
        </g>

        <!-- Layer 2: Rain streaks -->
        <g filter="url(#${filterId})">
          ${rainLines.join('\n          ')}
        </g>
        ${droplets.join('\n        ')}

        <!-- Layer 3: Texture -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[2]}" opacity="${texOpacity}" />

        <!-- Layer 4: Window glare -->
        <rect width="${W}" height="${H}" fill="url(#glare-${seed})" opacity="${glareOpacity}" />
      </svg>`
  },
}
