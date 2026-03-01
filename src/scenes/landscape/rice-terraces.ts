import type { Scene, SceneRenderParams } from '../../types'

export const riceTerraces: Scene = {
  id: 'rice-terraces',
  name: '棚田',
  category: 'landscape',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#4A8A4A', '#6AAA5A', '#8AC87A', '#A8D8C0', '#2A5A3A']

    // Layer 1: Background sky
    const skyH = H * 0.25
    const skyPct = (skyH / H * 100).toFixed(1)

    // Layer 2: Stacked terrace bands - 5 levels
    const numTerraces = 5
    const terraceHeight = (H - skyH) / numTerraces

    const terraces: string[] = []
    for (let i = 0; i < numTerraces; i++) {
      const baseY = skyH + i * terraceHeight
      const topY = baseY
      const bottomY = topY + terraceHeight

      const bandPoints = [
        { x: 0, y: topY },
        { x: W * 0.15, y: topY + 0 },
        { x: W * 0.32, y: topY + 0 },
        { x: W * 0.5, y: topY + 0 },
        { x: W * 0.68, y: topY + 0 },
        { x: W * 0.85, y: topY + 0 },
        { x: W, y: topY },
      ]

      const isWater = i % 2 === 1
      const fillColor = isWater ? palette[3] : palette[i % palette.length]
      const opacity = isWater ? '0.7' : '0.88'

      let d = `M ${bandPoints[0].x.toFixed(1)} ${bandPoints[0].y.toFixed(1)}`
      for (let j = 1; j < bandPoints.length; j++) {
        const prev = bandPoints[j - 1]
        const curr = bandPoints[j]
        const cpx = (prev.x + curr.x) / 2
        d += ` Q ${cpx.toFixed(1)} ${prev.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
      }
      d += ` L ${W} ${bottomY.toFixed(1)} L 0 ${bottomY.toFixed(1)} Z`

      terraces.push(`<path d="${d}" fill="${fillColor}" opacity="${opacity}" />`)
    }

    // Layer 4: Water reflection glint accent
    const glintX = W * 0.4
    const glintY = skyH + terraceHeight * 1.5
    const glintW = W * 0.18
    const showGlint = true

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <defs>
          <linearGradient id="sky-${seed}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#B0D8F0" />
            <stop offset="${skyPct}%" stop-color="#D8EAD0" />
          </linearGradient>
          <linearGradient id="reflection-${seed}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#C8E8F8" stop-opacity="0" />
            <stop offset="50%" stop-color="#E8F8FF" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#C8E8F8" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Background sky -->
        <rect width="${W}" height="${skyH.toFixed(1)}" fill="url(#sky-${seed})" />

        <!-- Layer 2: Terrace bands -->
        ${terraces.join('\n          ')}

        <!-- Layer 4: Water reflection glint -->
        ${showGlint ? `
          <ellipse cx="${glintX.toFixed(1)}" cy="${glintY.toFixed(1)}" rx="${(glintW / 2).toFixed(1)}" ry="${(terraceHeight * 0.15).toFixed(1)}"
                   fill="url(#reflection-${seed})" />
        ` : ''}
      </svg>`
  },
}
