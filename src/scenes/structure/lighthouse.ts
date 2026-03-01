import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const lighthouse: Scene = {
  id: 'lighthouse',
  name: '灯台',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#1C3557', '#0D1B2A', '#E8E0D0', '#B8C8D8', '#FFE066'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const horizonY = jitter(H * 0.62, coherence, rng, H * 0.06)
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Lighthouse - right-leaning tall narrow silhouette
    const towerBaseX = jitter(W * 0.68, coherence, rng, W * 0.05)
    const towerBaseY = jitter(horizonY + H * 0.02, coherence, rng, H * 0.03)
    const towerBaseW = jitter(W * 0.07, coherence, rng, W * 0.01)
    const towerH = jitter(H * 0.48, coherence, rng, H * 0.05)
    const towerTopW = jitter(W * 0.045, coherence, rng, W * 0.008)
    const towerTopY = towerBaseY - towerH

    // Lantern room at top
    const lanternH = jitter(H * 0.07, coherence, rng, H * 0.015)
    const lanternW = jitter(towerTopW * 1.4, coherence, rng, W * 0.005)
    const lanternY = towerTopY - lanternH

    // Light beam rays
    const lightX = towerBaseX + towerTopW / 2
    const lightY = lanternY + lanternH * 0.4
    const beamCount = 5
    const beamAngleBase = jitter(-0.6, coherence, rng, 0.3)
    const beamSpread = jitter(0.8, coherence, rng, 0.15)

    const beams: string[] = []
    for (let i = 0; i < beamCount; i++) {
      const angle = beamAngleBase + (i / (beamCount - 1)) * beamSpread - Math.PI * 0.1
      const beamLen = jitter(W * 0.55, coherence, rng, W * 0.1)
      const endX = lightX + Math.cos(angle) * beamLen
      const endY = lightY + Math.sin(angle) * beamLen
      const opacity = (0.12 + (1 - Math.abs(i - beamCount / 2) / beamCount) * 0.15).toFixed(2)
      beams.push(`<line x1="${lightX.toFixed(1)}" y1="${lightY.toFixed(1)}"
                        x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}"
                        stroke="${palette[4]}" stroke-width="${(W * 0.04).toFixed(1)}"
                        stroke-linecap="round" opacity="${opacity}" />`)
    }

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.22).toFixed(2)

    // Layer 4: Lantern glow
    const glowR = jitter(30, coherence, rng, 10)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${horizonPct}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="sea-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[3]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="tower-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="60%" stop-color="${palette[2]}" stop-opacity="0.85" />
            <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0.7" />
          </linearGradient>
          <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.95" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background sky and sea -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#sea-${seed})" />

        <!-- Light beams (behind tower) -->
        ${beams.join('\n        ')}

        <!-- Layer 2: Lighthouse tower -->
        <g filter="url(#${filterId})">
          <!-- Tower body (slightly tapered) -->
          <polygon points="${(towerBaseX).toFixed(1)},${towerBaseY.toFixed(1)} ${(towerBaseX + towerBaseW).toFixed(1)},${towerBaseY.toFixed(1)} ${(towerBaseX + towerBaseW - (towerBaseW - towerTopW) / 2).toFixed(1)},${towerTopY.toFixed(1)} ${(towerBaseX + (towerBaseW - towerTopW) / 2).toFixed(1)},${towerTopY.toFixed(1)}"
                   fill="url(#tower-${seed})" opacity="0.95" />
          <!-- Lantern room -->
          <rect x="${(lightX - lanternW / 2).toFixed(1)}" y="${lanternY.toFixed(1)}"
                width="${lanternW.toFixed(1)}" height="${lanternH.toFixed(1)}"
                fill="${palette[4]}" opacity="0.85" />
          <!-- Lantern cap -->
          <polygon points="${(lightX - lanternW / 2 - W * 0.01).toFixed(1)},${lanternY.toFixed(1)} ${(lightX + lanternW / 2 + W * 0.01).toFixed(1)},${lanternY.toFixed(1)} ${lightX.toFixed(1)},${(lanternY - lanternH * 0.5).toFixed(1)}"
                   fill="${palette[2]}" opacity="0.9" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />

        <!-- Layer 4: Lantern glow accent -->
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${(glowR * 2.5).toFixed(1)}"
                fill="url(#glow-${seed})" />
      </svg>`
  },
}
