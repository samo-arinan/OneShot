import type { Scene, SceneRenderParams } from '../../types'

export const spiralStaircase: Scene = {
  id: 'spiral-staircase',
  name: '螺旋階段',
  category: 'structure',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#2C2C3E', '#1A1A2E', '#4A4A6A', '#C8C8D8', '#F0E8D0']

    // Layer 1: Background
    const bgMidPct = (40).toFixed(1)

    // Layer 2: Spiral curves - elliptical arcs descending
    const cx = W * 0.5
    const spiralLevels = 6
    const spiralTopY = H * 0.1
    const levelSpacing = (H * 0.75) / spiralLevels
    const maxRx = W * 0.32
    const minRx = W * 0.05
    const arcRy = H * 0.04
    const strokeW = 3.5

    // Build spiral arcs
    const arcs: string[] = []
    for (let i = 0; i < spiralLevels; i++) {
      const t = i / (spiralLevels - 1)
      const y = spiralTopY + i * levelSpacing
      const rx = maxRx - (maxRx - minRx) * t
      const opacity = (0.4 + (1 - t) * 0.5).toFixed(2)
      // Upper arc
      arcs.push(`<ellipse cx="${cx.toFixed(1)}" cy="${y.toFixed(1)}"
                           rx="${rx.toFixed(1)}" ry="${arcRy.toFixed(1)}"
                           fill="none" stroke="${palette[3]}"
                           stroke-width="${strokeW.toFixed(1)}" opacity="${opacity}" />`)
      // Step lines connecting adjacent arcs
      if (i < spiralLevels - 1) {
        const nextY = spiralTopY + (i + 1) * levelSpacing
        const nextRx = maxRx - (maxRx - minRx) * ((i + 1) / (spiralLevels - 1))
        const rightX = cx + rx
        const nextRightX = cx + nextRx
        arcs.push(`<line x1="${rightX.toFixed(1)}" y1="${y.toFixed(1)}"
                         x2="${nextRightX.toFixed(1)}" y2="${nextY.toFixed(1)}"
                         stroke="${palette[2]}" stroke-width="${(strokeW * 0.6).toFixed(1)}"
                         opacity="${opacity}" />`)
      }
    }

    // Layer 4: Light source above center
    const lightX = cx
    const lightY = spiralTopY - H * 0.06
    const lightR = 22

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="bg-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="${bgMidPct}%" stop-color="${palette[1]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
          <radialGradient id="light-${seed}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.9" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </radialGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

        <!-- Layer 2: Spiral staircase curves -->
          ${arcs.join('\n          ')}
          <!-- Center column -->
          <line x1="${cx.toFixed(1)}" y1="${spiralTopY.toFixed(1)}"
                x2="${cx.toFixed(1)}" y2="${(spiralTopY + spiralLevels * levelSpacing).toFixed(1)}"
                stroke="${palette[2]}" stroke-width="${(strokeW * 1.5).toFixed(1)}" opacity="0.7" />

        <!-- Layer 4: Light source above -->
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${(lightR * 3).toFixed(1)}"
                fill="url(#light-${seed})" />
        <circle cx="${lightX.toFixed(1)}" cy="${lightY.toFixed(1)}" r="${lightR.toFixed(1)}"
                fill="${palette[4]}" opacity="0.88" />
      </svg>`
  },
}
