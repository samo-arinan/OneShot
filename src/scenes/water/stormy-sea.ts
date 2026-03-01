import type { Scene, SceneRenderParams } from '../../types'

export const stormySea: Scene = {
  id: 'stormy-sea',
  name: '荒波',
  category: 'water',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1a2a3a', '#2a3f5a', '#3a5070', '#5a6a7a', '#8090a0']

    // Layer 1: Dark stormy sky + sea split
    const horizonY = H * 0.35

    // Layer 2: Large undulating wave shapes
    const waveCount = 6
    const wavePaths: string[] = []
    for (let i = 0; i < waveCount; i++) {
      const baseY = horizonY + (H - horizonY) * (i / waveCount) * 0.9
      const amp = 25 + i * 8
      const freq = 0.012
      const phase = rng() * Math.PI * 2
      let d = `M 0 ${H}`
      d += ` L 0 ${baseY.toFixed(1)}`
      for (let x = 0; x <= W; x += 8) {
        const y = baseY + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.4
        d += ` L ${x} ${y.toFixed(1)}`
      }
      d += ` L ${W} ${H} Z`
      const opacity = (0.3 + i * 0.1).toFixed(2)
      const colorIdx = Math.min(i, palette.length - 1)
      wavePaths.push(`<path d="${d}" fill="${palette[colorIdx]}" opacity="${opacity}" />`)
    }

    // Layer 3: Texture - foam spray effect
    const foamLines: string[] = []
    const foamCount = Math.floor(8)
    for (let i = 0; i < foamCount; i++) {
      const fx = rng() * W
      const fy = horizonY + rng() * (H - horizonY) * 0.6
      const fw = 40
      foamLines.push(`<ellipse cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" rx="${fw.toFixed(1)}" ry="4" fill="white" opacity="0.15" />`)
    }

    // Layer 4: Storm clouds / dark accent
    const cloudPaths: string[] = []
    for (let i = 0; i < 3; i++) {
      const cx = rng() * W
      const cy = rng() * horizonY * 0.8
      const cr = 60
      cloudPaths.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${cr.toFixed(1)}" ry="${(cr * 0.4).toFixed(1)}" fill="${palette[0]}" opacity="0.5" />`)
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="sea-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[0]}" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#sea-${seed})" />

        <!-- Layer 2: Waves -->
        ${wavePaths.join('\n          ')}

        <!-- Layer 3: Texture / foam -->
        ${foamLines.join('\n        ')}

        <!-- Layer 4: Storm clouds -->
        ${cloudPaths.join('\n          ')}
      </svg>`
  },
}
