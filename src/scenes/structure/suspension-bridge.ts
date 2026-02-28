import type { Scene, SceneRenderParams } from '../../types'
import { jitter, buildDistortionFilter, distortPalette } from '../../lib/coherence-utils'

export const suspensionBridge: Scene = {
  id: 'suspension-bridge',
  name: '吊り橋',
  category: 'structure',

  render({ width: W, height: H, seed, coherence, rng }: SceneRenderParams): string {
    const palette = distortPalette(
      ['#2A3A4A', '#1A2530', '#6A7A8A', '#B8C8D8', '#F0E8D0'],
      coherence, rng
    )
    const filterId = `distort-${seed}`
    const filter = buildDistortionFilter(coherence, filterId, seed)

    // Layer 1: Background
    const horizonY = jitter(H * 0.52, coherence, rng, H * 0.07)
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Suspension bridge
    // Deck (horizontal span)
    const deckY = jitter(H * 0.58, coherence, rng, H * 0.05)
    const deckH = jitter(H * 0.025, coherence, rng, H * 0.008)
    const deckLeft = jitter(W * 0.05, coherence, rng, W * 0.03)
    const deckRight = jitter(W * 0.95, coherence, rng, W * 0.03)

    // Main towers (pylons)
    const towerW = jitter(W * 0.035, coherence, rng, W * 0.008)
    const towerH = jitter(H * 0.38, coherence, rng, H * 0.05)
    const leftTowerX = jitter(W * 0.25, coherence, rng, W * 0.04)
    const rightTowerX = jitter(W * 0.75, coherence, rng, W * 0.04)
    const towerTopY = deckY - towerH

    // Catenary cables: from tower tops, dip to center
    const cableY1 = towerTopY
    const cableDip = jitter(H * 0.12, coherence, rng, H * 0.03)
    const cableMidY = towerTopY + cableDip
    const cableMidX = (leftTowerX + rightTowerX) / 2

    // Vertical hanger lines
    const hangerCount = 10
    const hangerLines: string[] = []
    for (let i = 0; i <= hangerCount; i++) {
      const t = i / hangerCount
      const hx = leftTowerX + t * (rightTowerX - leftTowerX)
      // Catenary approximation: quadratic
      const dt = t - 0.5
      const cableYAtX = towerTopY + cableDip * (1 - 4 * dt * dt)
      const opacity = (0.6 + coherence * 0.3).toFixed(2)
      hangerLines.push(`<line x1="${hx.toFixed(1)}" y1="${cableYAtX.toFixed(1)}"
                              x2="${hx.toFixed(1)}" y2="${deckY.toFixed(1)}"
                              stroke="${palette[2]}" stroke-width="1.2" opacity="${opacity}" />`)
    }

    // Cable path (two cables, one on each side)
    const cablePath = `M ${deckLeft.toFixed(1)} ${cableY1.toFixed(1)} Q ${cableMidX.toFixed(1)} ${cableMidY.toFixed(1)} ${deckRight.toFixed(1)} ${cableY1.toFixed(1)}`

    // Layer 3: Texture
    const texOpacity = ((1.0 - coherence) * 0.22).toFixed(2)

    // Layer 4: Sky glow / atmosphere
    const glowX = jitter(cableMidX, coherence, rng, W * 0.06)
    const glowY = jitter(horizonY - H * 0.08, coherence, rng, H * 0.04)
    const glowR = jitter(W * 0.22, coherence, rng, W * 0.05)

    const cableStrokeW = jitter(3.5, coherence, rng, 1).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          ${filter}
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[1]}" />
            <stop offset="${horizonPct}%" stop-color="${palette[0]}" />
          </linearGradient>
          <linearGradient id="water-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" stop-opacity="0.7" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="tower-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[3]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background sky and water -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#water-${seed})" />

        <!-- Layer 4: Atmosphere glow (behind bridge) -->
        <ellipse cx="${glowX.toFixed(1)}" cy="${glowY.toFixed(1)}"
                 rx="${glowR.toFixed(1)}" ry="${(glowR * 0.5).toFixed(1)}"
                 fill="url(#glow-${seed})" />

        <!-- Layer 2: Suspension bridge -->
        <g filter="url(#${filterId})">
          <!-- Left tower -->
          <rect x="${(leftTowerX - towerW / 2).toFixed(1)}" y="${towerTopY.toFixed(1)}"
                width="${towerW.toFixed(1)}" height="${(deckY - towerTopY + deckH).toFixed(1)}"
                fill="url(#tower-${seed})" opacity="0.93" />
          <!-- Right tower -->
          <rect x="${(rightTowerX - towerW / 2).toFixed(1)}" y="${towerTopY.toFixed(1)}"
                width="${towerW.toFixed(1)}" height="${(deckY - towerTopY + deckH).toFixed(1)}"
                fill="url(#tower-${seed})" opacity="0.93" />
          <!-- Catenary main cable -->
          <path d="${cablePath}" fill="none" stroke="${palette[3]}"
                stroke-width="${cableStrokeW}" opacity="0.88" />
          <!-- Vertical hanger lines -->
          ${hangerLines.join('\n          ')}
          <!-- Bridge deck -->
          <rect x="${deckLeft.toFixed(1)}" y="${deckY.toFixed(1)}"
                width="${(deckRight - deckLeft).toFixed(1)}" height="${deckH.toFixed(1)}"
                fill="${palette[2]}" opacity="0.92" />
        </g>

        <!-- Layer 3: Texture overlay -->
        <rect width="${W}" height="${H}" filter="url(#${filterId})"
              fill="${palette[0]}" opacity="${texOpacity}" />
      </svg>`
  },
}
