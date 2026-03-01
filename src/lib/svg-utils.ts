import type { Point } from '../types'

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
