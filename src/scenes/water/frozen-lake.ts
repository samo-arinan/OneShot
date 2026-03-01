import type { Scene, SceneRenderParams } from '../../types'

export const frozenLake: Scene = {
  id: 'frozen-lake',
  name: '凍った湖',
  category: 'water',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#b8d4e8', '#d8ecf8', '#e8f4ff', '#f4faff', '#ffffff']

    // Layer 1: Sky above, flat ice surface below
    const iceY = H * 0.45

    // Layer 2: Ice surface with horizontal banding
    const iceLines: string[] = []
    const bandCount = Math.floor(8)
    for (let i = 0; i < bandCount; i++) {
      const by = iceY + (H - iceY) * (i / bandCount)
      const opacity = (0.08 + i * 0.02).toFixed(2)
      iceLines.push(`<line x1="0" y1="${by.toFixed(1)}" x2="${W}" y2="${by.toFixed(1)}" stroke="${palette[0]}" stroke-width="1" opacity="${opacity}" />`)
    }

    // Layer 3: Crack patterns on ice
    const crackPaths: string[] = []
    const crackCount = Math.floor(5)
    for (let i = 0; i < crackCount; i++) {
      const startX = rng() * W
      const startY = iceY + rng() * (H - iceY)
      let d = `M ${startX.toFixed(1)} ${startY.toFixed(1)}`
      const segments = Math.floor(3 + rng() * 4)
      let cx = startX
      let cy = startY
      for (let s = 0; s < segments; s++) {
        const angle = rng() * Math.PI * 2
        const len = 30
        cx += Math.cos(angle) * len
        cy += Math.sin(angle) * len * 0.4
        d += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`
      }
      const crackOpacity = (0.4 + 0.1).toFixed(2)
      crackPaths.push(`<path d="${d}" stroke="${palette[0]}" stroke-width="0.8" fill="none" opacity="${crackOpacity}" />`)
    }

    // Layer 4: Reflective sheen on ice
    const sheenOpacity = (0.25).toFixed(2)

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[0]}" />
            <stop offset="100%" stop-color="${palette[2]}" />
          </linearGradient>
          <linearGradient id="ice-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${palette[3]}" />
            <stop offset="100%" stop-color="${palette[1]}" />
          </linearGradient>
          <linearGradient id="sheen-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0" />
            <stop offset="40%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="60%" stop-color="${palette[4]}" stop-opacity="0.5" />
            <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background -->
        <rect width="${W}" height="${iceY.toFixed(1)}" fill="url(#sky-${seed})" />
        <rect y="${iceY.toFixed(1)}" width="${W}" height="${(H - iceY).toFixed(1)}" fill="url(#ice-${seed})" />

        <!-- Layer 2: Ice banding -->
        ${iceLines.join('\n        ')}

        <!-- Layer 3: Cracks -->
        ${crackPaths.join('\n          ')}

        <!-- Layer 4: Reflective sheen -->
        <rect y="${iceY.toFixed(1)}" width="${W}" height="${(H - iceY).toFixed(1)}"
              fill="url(#sheen-${seed})" opacity="${sheenOpacity}" />
      </svg>`
  },
}
