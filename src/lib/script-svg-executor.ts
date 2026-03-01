import { validateSvg } from './svg-generator'

/**
 * Attempt to repair common syntax errors in LLM-generated code.
 *
 * Fixes three patterns:
 * 1. Leading backtick — LLM wraps code in backticks thinking it's a code block
 * 2. String concatenation inside template literals — `' + W + '` as literal text
 * 3. Broken `return svg` — LLM wraps return statement in backticks
 */
export function repairCode(code: string): string {
  let fixed = code.trim()

  // Fix 1: Strip leading backtick
  if (fixed.startsWith('`')) {
    fixed = fixed.slice(1)
    if (fixed.endsWith('`') && !fixed.endsWith('`;')) {
      fixed = fixed.slice(0, -1)
    }
  }

  // Fix 2: String concatenation inside template literals
  // `... ' + W + ' ...` → `... ${W} ...`
  let prev: string
  do {
    prev = fixed
    fixed = fixed.replace(
      /'\s*\+\s*([A-Za-z_]\w*(?:\*[\d.]+)?(?:\[[^\]]+\])?)\s*\+\s*'/g,
      (_, expr: string) => `\${${expr.trim()}}`,
    )
  } while (fixed !== prev)

  // Fix 3: Broken `return svg` wrapped in backticks
  fixed = fixed.replace(/`;\s*`\s*\+\s*\n?\s*`return\s+svg;\s*`?/g, '`;\nreturn svg;')
  fixed = fixed.replace(/`;\s*`;\s*\n?\s*return\s+svg;/g, '`;\nreturn svg;')

  // Fix 4: Uninterpolated W*/H* in SVG attributes
  fixed = fixed.replace(/='([WH](?:\*[\d.]+)?)'/g, "='${$1}'")

  return fixed
}

/**
 * Execute a JavaScript function body that returns an SVG string.
 * The code receives `width` and `height` as parameters.
 * Returns the validated SVG string, or null if execution fails or output is invalid.
 */
export function executeSvgScript(code: string, width: number, height: number): string | null {
  let result = tryExecute(code, width, height)
  if (result) return result

  // Auto-repair: attempt to fix common LLM syntax errors and retry
  const repaired = repairCode(code)
  if (repaired !== code) {
    result = tryExecute(repaired, width, height)
    if (result) return result
  }

  return null
}

function tryExecute(code: string, width: number, height: number): string | null {
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
