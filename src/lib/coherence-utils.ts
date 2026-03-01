import type { Point } from '../types'

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t))
}

export function jitter(value: number, coherence: number, rng: () => number, maxOffset: number): number {
  const noise = (rng() - 0.5) * 2 * maxOffset * (1.0 - coherence)
  return value + noise
}

export function distortPath(points: Point[], coherence: number, rng: () => number): Point[] {
  return points.map(p => ({
    x: jitter(p.x, coherence, rng, 50),
    y: jitter(p.y, coherence, rng, 50),
  }))
}

export function buildDistortionFilter(coherence: number, filterId: string, seed: number): string {
  const turbFreq = lerp(0.0, 0.04, 1.0 - coherence)
  const turbOctaves = Math.ceil(lerp(1, 5, 1.0 - coherence))
  const dispScale = lerp(0, 60, 1.0 - coherence)
  const blurRadius = lerp(0, 8, 1.0 - coherence)

  return `<filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise"
        baseFrequency="${turbFreq}"
        numOctaves="${turbOctaves}"
        seed="${seed}"
        result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise"
        scale="${dispScale}"
        xChannelSelector="R" yChannelSelector="G" />
      <feGaussianBlur stdDeviation="${blurRadius}" />
    </filter>`
}

export function distortPalette(
  baseColors: string[],
  coherence: number,
  rng: () => number
): string[] {
  if (coherence > 0.7) return baseColors

  const mutated = [...baseColors]
  const extraCount = Math.floor((1.0 - coherence) * 3)
  for (let i = 0; i < extraCount; i++) {
    const randomHue = Math.floor(rng() * 360)
    mutated.push(`hsl(${randomHue}, ${(50 + rng() * 30).toFixed(1)}%, ${(30 + rng() * 40).toFixed(1)}%)`)
  }
  return mutated
}

export function ridgePointsToPath(points: Point[], W: number, H: number): string {
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` Q ${cpx.toFixed(1)} ${prev.y.toFixed(1)} ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
  }
  d += ` L ${W} ${H} L 0 ${H} Z`
  return d
}
