import { t } from '../lib/i18n'
import { markOnboardingSeen } from '../lib/onboarding'

interface OnboardingScreenProps {
  onDone: () => void
}

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const handleStart = () => {
    markOnboardingSeen()
    onDone()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-bold mb-2 tracking-tight">ONE SHOT</h1>
      <p className="text-gray-400 mb-12 text-center">{t().tagline}</p>

      <div className="w-full max-w-sm space-y-6 mb-12">
        <h2 className="text-xl font-semibold text-center">{t().onboardingHeading}</h2>
        <p className="text-gray-300 text-center leading-relaxed">{t().onboardingBody1}</p>
        <p className="text-gray-300 text-center leading-relaxed">{t().onboardingBody2}</p>
        <p className="text-gray-300 text-center leading-relaxed">{t().onboardingBody3}</p>
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-medium transition-colors cursor-pointer"
        >
          {t().onboardingStart}
        </button>
      </div>
    </div>
  )
}
