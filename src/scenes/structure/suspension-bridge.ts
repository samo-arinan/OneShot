import type { Scene, SceneRenderParams } from '../../types'

export const suspensionBridge: Scene = {
  id: 'suspension-bridge',
  name: '吊り橋',
  category: 'structure',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#2A3A4A', '#1A2530', '#6A7A8A', '#B8C8D8', '#F0E8D0']

    // Layer 1: Background
    const horizonY = H * 0.52
    const horizonPct = (horizonY / H * 100).toFixed(1)

    // Layer 2: Suspension bridge
    // Deck (horizontal span)
    const deckY = H * 0.58
    const deckH = H * 0.025
    const deckLeft = W * 0.05
    const deckRight = W * 0.95

    // Main towers (pylons)
    const towerW = W * 0.035
    const towerH = H * 0.38
    const leftTowerX = W * 0.25
    const rightTowerX = W * 0.75
    const towerTopY = deckY - towerH

    // Catenary cables: from tower tops, dip to center
    const cableY1 = towerTopY
    const cableDip = H * 0.12
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
      const opacity = (0.9).toFixed(2)
      hangerLines.push(`<line x1="${hx.toFixed(1)}" y1="${cableYAtX.toFixed(1)}"
                              x2="${hx.toFixed(1)}" y2="${deckY.toFixed(1)}"
                              stroke="${palette[2]}" stroke-width="1.2" opacity="${opacity}" />`)
    }

    // Cable path (two cables, one on each side)
    const cablePath = `M ${deckLeft.toFixed(1)} ${cableY1.toFixed(1)} Q ${cableMidX.toFixed(1)} ${cableMidY.toFixed(1)} ${deckRight.toFixed(1)} ${cableY1.toFixed(1)}`

    // Layer 4: Sky glow / atmosphere
    const glowX = cableMidX
    const glowY = horizonY - H * 0.08
    const glowR = W * 0.22

    const cableStrokeW = (3.5).toFixed(1)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
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
      </svg>`
  },
}
