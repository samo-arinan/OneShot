import type { Scene, SceneRenderParams } from '../../types'

export const riverBend: Scene = {
  id: 'river-bend',
  name: '蛇行する川',
  category: 'water',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#4a6a30', '#5a7a40', '#3a7090', '#6ab0d0', '#c0e8f8']

    // Layer 1: Green landscape background
    // Layer 2: S-curve river band
    const riverWidth = W * 0.2

    // S-curve control: enter top-right, exit bottom-left
    const startX = W * 0.7
    const midX = W * 0.5
    const endX = W * 0.3

    // Build S-curve centerline points
    const centerPoints: Array<{x: number, y: number}> = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      // Cubic bezier: start top, curve through mid, end bottom
      // Simple S via sin
      const x = startX + (endX - startX) * t + Math.sin(t * Math.PI) * (midX - startX) * 1.0
      const y = t * H
      centerPoints.push({ x, y })
    }

    // River left and right edges
    let leftEdge = `M ${(centerPoints[0].x - riverWidth / 2).toFixed(1)} 0`
    for (const p of centerPoints) {
      leftEdge += ` L ${(p.x - riverWidth / 2).toFixed(1)} ${p.y.toFixed(1)}`
    }
    leftEdge += ` L ${(centerPoints[centerPoints.length - 1].x - riverWidth / 2).toFixed(1)} ${H}`

    let rightEdge = ` L ${(centerPoints[centerPoints.length - 1].x + riverWidth / 2).toFixed(1)} ${H}`
    for (let i = centerPoints.length - 1; i >= 0; i--) {
      rightEdge += ` L ${(centerPoints[i].x + riverWidth / 2).toFixed(1)} ${centerPoints[i].y.toFixed(1)}`
    }
    rightEdge += ` L ${(centerPoints[0].x + riverWidth / 2).toFixed(1)} 0 Z`

    const riverPath = leftEdge + rightEdge

    // Shimmer lines along the river
    const shimmerLines: string[] = []
    const shimmerCount = Math.floor(8)
    for (let i = 0; i < shimmerCount; i++) {
      const t = rng()
      const p = centerPoints[Math.floor(t * (centerPoints.length - 1))]
      const offset = (rng() - 0.5) * riverWidth * 0.7
      const shimmerLen = 30
      const sx = p.x + offset
      const sy = p.y
      shimmerLines.push(`<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${(sx + shimmerLen * 0.3).toFixed(1)}" y2="${(sy + shimmerLen).toFixed(1)}" stroke="${palette[4]}" stroke-width="1.5" opacity="0.4" />`)
    }

    // Layer 4: River surface highlight
    const highlightOpacity = (0.4).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="land-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="river-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="50%" stop-color="${palette[4]}" />
            <stop offset="100%" stop-color="${palette[3]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background land -->
        <rect width="${W}" height="${H}" fill="url(#land-${seed})" />

        <!-- Layer 2: River S-curve -->
        <path d="${riverPath}" fill="url(#river-${seed})" />

        <!-- Layer 3: Shimmer texture -->
        ${shimmerLines.join('\n        ')}

        <!-- Layer 4: River highlight -->
        <path d="${riverPath}" fill="${palette[4]}" opacity="${highlightOpacity}" />
      </svg>`
  },
}
