"use client";

import { useState, useEffect } from "react";
import { WizardProvider, useWizard } from "@/lib/wizard-context";
import { StepIndicator } from "@/components/step-indicator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Step1ClientDetails } from "@/components/wizard/step1-client-details";
import { Step2SelectVendor } from "@/components/wizard/step2-select-vendor";
import { Step3IntegrationOptions } from "@/components/wizard/step3-integration-options";
import { Step4VendorSettings } from "@/components/wizard/step4-vendor-settings";
import { Step5ReviewGenerate } from "@/components/wizard/step5-review-generate";

const STEPS = [
  { number: 1, title: "Client Details" },
  { number: 2, title: "Select Vendor" },
  { number: 3, title: "Integration Options" },
  { number: 4, title: "Vendor Settings" },
  { number: 5, title: "Review & Generate" },
];

function WizardContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const { state, loadFromLocalStorage } = useWizard();

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return state.clientName.trim().length > 0;
      case 2:
        return state.vendor !== null;
      case 3:
        return state.selectedOptions.length > 0;
      case 4:
        return true; // Fields are optional
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        <div className="min-h-[500px]">
          {currentStep === 1 && <Step1ClientDetails />}
          {currentStep === 2 && <Step2SelectVendor />}
          {currentStep === 3 && <Step3IntegrationOptions />}
          {currentStep === 4 && <Step4VendorSettings />}
          {currentStep === 5 && <Step5ReviewGenerate />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t-2 mt-12 bg-gray-50 rounded-2xl p-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            size="lg"
            className="rounded-xl"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>

          <div className="text-center">
            <div className="text-sm font-semibold text-gray-500">
              Step {currentStep} of {STEPS.length}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {STEPS[currentStep - 1].title}
            </div>
          </div>

          {currentStep < 5 ? (
            <Button 
              onClick={handleNext} 
              disabled={!canProceed()}
              size="lg"
              className="rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <div className="w-32" /> 
          )}
        </div>
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

