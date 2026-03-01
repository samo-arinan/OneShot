import type { Scene, SceneRenderParams } from '../../types'

export const calmOcean: Scene = {
  id: 'calm-ocean',
  name: '凪の海',
  category: 'water',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#87CEEB', '#1E90FF', '#004080', '#003060', '#FFD700']

    // Layer 1: Sky + ocean split
    const horizonY = H * 0.4

    // Layer 2: Waves
    const waveCount = 5
    const wavePaths: string[] = []
    for (let i = 0; i < waveCount; i++) {
      const baseY = horizonY + (H - horizonY) * (i / waveCount) * 0.8 + (H - horizonY) * 0.15
      const amp = 8 + i * 3
      const freq = 0.015
      const phase = rng() * Math.PI * 2
      let d = `M 0 ${baseY.toFixed(1)}`
      for (let x = 0; x <= W; x += 10) {
        const y = baseY + Math.sin(x * freq + phase) * amp
        d += ` L ${x} ${y.toFixed(1)}`
      }
      const opacity = (0.15 + i * 0.05).toFixed(2)
      wavePaths.push(`<path d="${d}" stroke="${palette[1]}" stroke-width="2" fill="none" opacity="${opacity}" />`)
    }

    // Layer 4: Sun reflection
    const sunX = W * 0.7
    const sunY = H * 0.12
    const sunR = 20
    const showSun = true

    // Sun reflection on water
    const reflectY = horizonY + 10
    const reflectH = H * 0.3

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="ocean-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[2]}" />
            <stop offset="100%" stop-color="${palette[3]}" />
          </linearGradient>
          <linearGradient id="reflect-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.4" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${horizonY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${horizonY.toFixed(1)}" width="${W}" height="${(H - horizonY).toFixed(1)}" fill="url(#ocean-${seed})" />

        <!-- Layer 2: Waves -->
        ${wavePaths.join('\n          ')}

        <!-- Layer 4: Sun + reflection -->
        ${showSun ? `
          <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${(sunR * 2).toFixed(1)}"
                  fill="${palette[4]}" opacity="0.2" />
          <circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(1)}"
                  fill="${palette[4]}" opacity="0.6" />
          <rect x="${(sunX - 3).toFixed(1)}" y="${reflectY.toFixed(1)}"
                width="6" height="${reflectH.toFixed(1)}"
                fill="url(#reflect-${seed})" />
        ` : ''}
      </svg>`
  },
}
