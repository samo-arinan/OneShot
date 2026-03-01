import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { hasSeenOnboarding, markOnboardingSeen } from '../src/lib/onboarding'

function createMockLocalStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { for (const k of Object.keys(store)) delete store[k] },
  }
}

let mockStorage: ReturnType<typeof createMockLocalStorage>

beforeEach(() => {
  mockStorage = createMockLocalStorage()
  vi.stubGlobal('localStorage', mockStorage)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('onboarding', () => {
  describe('hasSeenOnboarding', () => {
    it('returns false when localStorage is empty', () => {
      expect(hasSeenOnboarding()).toBe(false)
    })

    it('returns true when flag is set', () => {
      mockStorage.setItem('oneshot_onboarded', '1')
      expect(hasSeenOnboarding()).toBe(true)
    })

    it('returns false for unexpected values', () => {
      mockStorage.setItem('oneshot_onboarded', 'yes')
      expect(hasSeenOnboarding()).toBe(false)
    })
  })

  describe('markOnboardingSeen', () => {
    it('sets the flag in localStorage', () => {
      markOnboardingSeen()
      expect(mockStorage.getItem('oneshot_onboarded')).toBe('1')
    })

    it('causes hasSeenOnboarding to return true', () => {
      markOnboardingSeen()
      expect(hasSeenOnboarding()).toBe(true)
    })
  })
})
