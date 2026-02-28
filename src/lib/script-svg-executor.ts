import { validateSvg } from './svg-generator'

/**
 * Execute a JavaScript function body that returns an SVG string.
 * The code receives `width` and `height` as parameters.
 * Returns the validated SVG string, or null if execution fails or output is invalid.
 */
export function executeSvgScript(code: string, width: number, height: number): string | null {
  try {
    const fn = new Function('width', 'height', code)
    const result = fn(width, height)
    if (typeof result !== 'string') return null
    const validated = validateSvg(result)
    if (!validated) return null
    // Ensure explicit dimensions for proper rendering in containers
    if (!/<svg[^>]+width\s*=/.test(validated)) {
      return validated.replace('<svg', `<svg width="${width}" height="${height}"`)
    }
    return validated
  } catch {
    return null
  }
}
