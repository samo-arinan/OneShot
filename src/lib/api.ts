import type { JudgeRequest, JudgeResponse } from '../types'
import { getLocale } from './i18n'

export async function judgeGuesses(request: JudgeRequest): Promise<JudgeResponse> {
  const res = await fetch('/api/judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, lang: getLocale() }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }

  return res.json()
}
