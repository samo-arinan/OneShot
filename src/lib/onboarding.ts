const STORAGE_KEY = 'oneshot_onboarded'

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboardingSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Silently ignore (private browsing, etc.)
  }
}
