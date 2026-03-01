import type { Scene, SceneRenderParams } from '../../types'

export const meteorShower: Scene = {
  id: 'meteor-shower',
  name: '流星群',
  category: 'sky',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#050815', '#0D1428', '#1A2040', '#FFFFFF', '#B8D4FF']

    // Meteors: diagonal lines from upper-right to lower-left direction
    const meteorCount = 12
    const meteors: string[] = []
    for (let i = 0; i < meteorCount; i++) {
      const startX = W * 0.2 + rng() * W * 0.8
      const startY = rng() * H * 0.5
      const length = 80 + rng() * 120
      const angle = Math.PI * 0.6
      const endX = startX - Math.cos(angle) * length
      const endY = startY + Math.sin(angle) * length
      const sw = (0.5 + rng() * 1.5).toFixed(1)
      const op = (0.5 + rng() * 0.5).toFixed(2)
      meteors.push(`<line x1="${startX.toFixed(1)}" y1="${startY.toFixed(1)}" x2="${endX.toFixed(1)}" y2="${endY.toFixed(1)}" stroke="${palette[3]}" stroke-width="${sw}" opacity="${op}" stroke-linecap="round" />`)
      // Glow on the head of meteor
      meteors.push(`<circle cx="${startX.toFixed(1)}" cy="${startY.toFixed(1)}" r="${(1 + rng()).toFixed(1)}" fill="${palette[4]}" opacity="${op}" />`)
    }

    // Background stars
    const starCount = 50
    const stars: string[] = []
    for (let i = 0; i < starCount; i++) {
      const sx = rng() * W
      const sy = rng() * H
      const sr = (0.3 + rng() * 1.5).toFixed(1)
      const sop = (0.2 + rng() * 0.6).toFixed(2)
      stars.push(`<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr}" fill="${palette[3]}" opacity="${sop}" />`)
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}" />
          <stop offset="60%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[2]}" />
        </linearGradient>
      </defs>

      <!-- Layer 1: Dark sky background -->
      <rect width="${W}" height="${H}" fill="url(#sky-${seed})" />

      <!-- Layer 2: Meteors - diagonal light lines -->
      <g>
        ${meteors.join('\n        ')}
      </g>

      <!-- Layer 4: Scattered background stars accent -->
      <g>
        ${stars.join('\n        ')}
      </g>
    </svg>`
  },
}
