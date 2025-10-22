import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-12 bg-gray-50 rounded-2xl p-6">
      <ol className="flex items-center justify-center space-x-2 md:space-x-4">
        {steps.map((step, index) => (
          <li key={step.number} className="flex items-center">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-300 font-bold shadow-sm",
                  currentStep > step.number
                    ? "bg-black border-black text-white scale-110"
                    : currentStep === step.number
                    ? "bg-white border-black text-black scale-110 shadow-lg"
                    : "bg-white border-gray-300 text-gray-400"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-base font-bold">{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  "hidden sm:inline text-sm font-semibold transition-colors",
                  currentStep >= step.number
                    ? "text-black"
                    : "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block w-12 h-1 mx-3 rounded-full overflow-hidden bg-gray-200">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    currentStep > step.number ? "bg-black w-full" : "bg-gray-200 w-0"
                  )}
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

