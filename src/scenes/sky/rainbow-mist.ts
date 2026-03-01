import type { Scene, SceneRenderParams } from '../../types'

export const rainbowMist: Scene = {
  id: 'rainbow-mist',
  name: '虹の霧',
  category: 'sky',

  render({ width: W, height: H, seed, rng }: SceneRenderParams): string {
    const palette = ['#F5F0F0', '#E8E4EE', '#D4E8F4', '#FFE4E1', '#E8F5E9']

    const rainbowCx = W * 0.5
    const rainbowCy = H * 0.85
    const rainbowR = Math.min(W, H) * 0.55

    const mistOpacity = '0.80'
    const arcWidth = 28

    // Rainbow band colors in order
    const rainbowColors = [
      '#FF6B6B', // red
      '#FFA07A', // orange
      '#FFD700', // yellow
      '#90EE90', // green
      '#87CEEB', // blue
      '#9370DB', // violet
    ]

    const rainbowArcs = rainbowColors.map((color, i) => {
      const r = rainbowR - i * arcWidth * 0.9
      if (r <= 0) return ''
      const bandOp = '0.85'
      // Arc as a stroke on a circle, clipped to upper half
      return `<path d="M ${(rainbowCx - r).toFixed(1)} ${rainbowCy.toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(rainbowCx + r).toFixed(1)} ${rainbowCy.toFixed(1)}"
              fill="none" stroke="${color}" stroke-width="${arcWidth.toFixed(1)}" opacity="${bandOp}" stroke-linecap="round" />`
    }).join('\n        ')

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <defs>
        <linearGradient id="fog-${seed}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette[2]}" />
          <stop offset="40%" stop-color="${palette[0]}" />
          <stop offset="100%" stop-color="${palette[3]}" />
        </linearGradient>
        <radialGradient id="mist-${seed}" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stop-color="white" stop-opacity="0.7" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Layer 1: Whitish foggy background -->
      <rect width="${W}" height="${H}" fill="url(#fog-${seed})" />

      <!-- Layer 2: Rainbow arc bands -->
      <g>
        ${rainbowArcs}
      </g>

      <!-- Layer 4: Soft mist accent -->
      <rect width="${W}" height="${H}" fill="url(#mist-${seed})" opacity="${mistOpacity}" />
    </svg>`
  },
}
