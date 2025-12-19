import { Check } from 'lucide-react'

interface Step {
  label: string
  completed: boolean
  current: boolean
}

interface ProgressIndicatorProps {
  steps: Step[]
}

export default function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${step.completed
                    ? 'bg-success-600 text-white'
                    : step.current
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={`
                  mt-2 text-sm font-medium arabic-text whitespace-nowrap
                  ${step.current ? 'text-primary-600' : step.completed ? 'text-success-600' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 transition-all
                  ${steps[index + 1].completed || steps[index + 1].current
                    ? 'bg-success-600'
                    : 'bg-gray-200'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
