import type { Scene, SceneRenderParams } from '../../types'

export const fractalBranch: Scene = {
  id: 'fractal-branch',
  name: 'フラクタル枝',
  category: 'abstract',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#0C1A0C', '#1A3A1A', '#3A6B3A', '#7DBF7D', '#C8F0C8']

    // Recursive branch generator
    const branches: string[] = []

    function drawBranch(
      x1: number, y1: number,
      length: number, angle: number,
      depth: number, strokeW: number
    ) {
      if (depth === 0 || length < 4) return
      const x2 = x1 + length * Math.cos(angle)
      const y2 = y1 + length * Math.sin(angle)

      const jx1 = x1
      const jy1 = y1
      const jx2 = x2
      const jy2 = y2

      const colorIdx = Math.min(depth, palette.length - 1)
      const opacity = (0.5 + depth * 0.12).toFixed(2)
      branches.push(
        `<line x1="${jx1.toFixed(2)}" y1="${jy1.toFixed(2)}"
               x2="${jx2.toFixed(2)}" y2="${jy2.toFixed(2)}"
               stroke="${palette[colorIdx]}" stroke-width="${strokeW.toFixed(1)}"
               stroke-linecap="round" opacity="${opacity}" />`
      )

      const spreadAngle = Math.PI / 5
      const scale = 0.68

      drawBranch(jx2, jy2, length * scale, angle - spreadAngle, depth - 1, strokeW * 0.65)
      drawBranch(jx2, jy2, length * scale, angle + spreadAngle, depth - 1, strokeW * 0.65)
    }

    const rootX = W * 0.5
    const rootY = H * 0.88
    const trunkLen = Math.min(W, H) * 0.32
    const levels = 3

    drawBranch(rootX, rootY, trunkLen, -Math.PI / 2, levels, 6)

    const glowR = trunkLen * 0.15

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="bg-${seed}" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="glow-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[3]}" stop-opacity="0.5" />
          <stop offset="100%" stop-color="${palette[3]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Fractal branches -->
        ${branches.join('\n        ')}

      <!-- Layer 4: Root glow accent -->
      <circle cx="${rootX.toFixed(1)}" cy="${rootY.toFixed(1)}" r="${(glowR * 3).toFixed(1)}"
              fill="url(#glow-${seed})" />
      <circle cx="${rootX.toFixed(1)}" cy="${rootY.toFixed(1)}" r="${glowR.toFixed(1)}"
              fill="${palette[2]}" opacity="0.8" />
    </svg>`
  },
}
