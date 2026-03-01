import type { Scene, SceneRenderParams } from '../../types'

export const dawnClouds: Scene = {
  id: 'dawn-clouds',
  name: '夜明けの雲',
  category: 'sky',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1A0A1E', '#FF6B6B', '#FFB347', '#FFE4B5', '#87CEEB']

    const horizonY = H * 0.72

    // Generate cloud bands - horizontal flowing layers
    const bandCount = 4
    const bands: Array<{ y: number; h: number; color: string; op: number }> = []
    for (let i = 0; i < bandCount; i++) {
      const t = i / (bandCount - 1)
      const bandY = H * 0.1 + t * H * 0.55
      const bandH = H * 0.1
      const colorIdx = Math.floor(rng() * palette.length)
      bands.push({
        y: bandY,
        h: bandH,
        color: palette[colorIdx],
        op: 0.3 + rng() * 0.4,
      })
    }

    // Cloud ellipses along bands
    const cloudEls: string[] = []
    for (let i = 0; i < bandCount; i++) {
      const band = bands[i]
      const cloudCount = 2 + Math.floor(rng() * 3)
      for (let j = 0; j < cloudCount; j++) {
        const cx = (j + 0.5) * (W / cloudCount)
        const cy = band.y + band.h * 0.5
        const rx = W * 0.12
        const ry = band.h * 0.6
        cloudEls.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${band.color}" opacity="${band.op.toFixed(2)}" />`)
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="50%" stop-color="${palette[1]}" />
          <stop offset="80%" stop-color="${palette[2]}" />
          <stop offset="100%" stop-color="${palette[3]}" />
        </linearGradient>
        <linearGradient id="ground-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2A1A00" />
          <stop offset="100%" stop-color="#0A0508" />
        </linearGradient>
        <linearGradient id="glow-${seed}" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="${palette[2]}" stop-opacity="0.6" />
          <stop offset="100%" stop-color="${palette[2]}" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Layer 1: Background gradient sky -->
      <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />
      <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ground-${seed})" />

      <!-- Layer 2: Horizontal cloud bands -->
      <g>
        ${cloudEls.join('\n        ')}
      </g>

      <!-- Layer 4: Orange glow from horizon accent -->
      <rect y="${(horizonY - H * 0.2).toFixed(1)}" width="${W}" height="${(H * 0.2).toFixed(1)}"
            fill="url(#glow-${seed})" />
    </svg>`
  },
}
