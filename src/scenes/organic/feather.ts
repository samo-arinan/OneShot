import type { Scene, SceneRenderParams } from '../../types'

export const feather: Scene = {
  id: 'feather',
  name: '羽',
  category: 'organic',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#1A1A2E', '#2D2D4E', '#7B9EA8', '#B8D4DC', '#F0F4F8']

    // Layer 1: Background
    const cx = W * 0.5
    const cy = H * 0.5

    // Layer 2: Central shaft (rachis) - elongated ellipse
    const shaftLen = H * 0.7
    const shaftW = W * 0.025
    const angle = -15
    const rad = angle * Math.PI / 180

    // Barbs - diagonal lines on both sides
    const barbCount = 12
    const barbs: string[] = []
    for (let i = 0; i < barbCount; i++) {
      const t = (i / (barbCount - 1)) * 2 - 1 // -1 to 1
      const alongShaft = t * shaftLen / 2
      const bx = cx + alongShaft * Math.sin(rad)
      const by = cy + alongShaft * Math.cos(rad)
      const barbLen = shaftLen * 0.25 * (1 - Math.abs(t) * 0.6)
      const barbAngle = rad + Math.PI / 4
      // Left barb
      const lEndX = bx - barbLen * Math.cos(barbAngle)
      const lEndY = by - barbLen * Math.sin(barbAngle)
      // Right barb
      const rEndX = bx + barbLen * Math.cos(barbAngle)
      const rEndY = by + barbLen * Math.sin(barbAngle)
      const opacity = (0.5 + (1 - Math.abs(t)) * 0.4).toFixed(2)
      barbs.push(`<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${lEndX.toFixed(1)}" y2="${lEndY.toFixed(1)}" stroke="${palette[3]}" stroke-width="1.2" opacity="${opacity}" />`)
      barbs.push(`<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${rEndX.toFixed(1)}" y2="${rEndY.toFixed(1)}" stroke="${palette[3]}" stroke-width="1.2" opacity="${opacity}" />`)
    }

    // Layer 4: Tip highlight
    const tipX = cx + (shaftLen / 2) * Math.sin(rad)
    const tipY = cy + (shaftLen / 2) * Math.cos(rad)
    const tipGlowR = W * 0.04

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <radialGradient id="bg-${seed}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${palette[1]}" />
          <stop offset="100%" stop-color="${palette[0]}" />
        </radialGradient>
        <radialGradient id="tip-${seed}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${palette[4]}" stop-opacity="0.7" />
          <stop offset="100%" stop-color="${palette[4]}" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Background -->
      <rect width="${W}" height="${H}" fill="url(#bg-${seed})" />

      <!-- Layer 2: Feather shaft and barbs -->
      <ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}"
               rx="${shaftW.toFixed(1)}" ry="${(shaftLen / 2).toFixed(1)}"
               transform="rotate(${angle.toFixed(1)}, ${cx.toFixed(1)}, ${cy.toFixed(1)})"
               fill="${palette[3]}" opacity="0.9" />
      ${barbs.join('\n        ')}

      <!-- Layer 4: Tip glow -->
      <circle cx="${tipX.toFixed(1)}" cy="${tipY.toFixed(1)}" r="${tipGlowR.toFixed(1)}"
              fill="url(#tip-${seed})" />
    </svg>`
  },
}
