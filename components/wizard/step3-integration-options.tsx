"use client";

import { useWizard } from "@/lib/wizard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getVendor, IntegrationOptionKey } from "@/lib/vendors";
import { Info } from "lucide-react";

export function Step3IntegrationOptions() {
  const { state, updateState } = useWizard();

  if (!state.vendor) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please select a vendor first.
        </AlertDescription>
      </Alert>
    );
  }

  const vendor = getVendor(state.vendor);
  if (!vendor || !vendor.options) return null;

  const toggleOption = (optionKey: IntegrationOptionKey) => {
    const isSelected = state.selectedOptions.includes(optionKey);
    const newOptions = isSelected
      ? state.selectedOptions.filter((o) => o !== optionKey)
      : [...state.selectedOptions, optionKey];
    updateState({ selectedOptions: newOptions });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3">Integration Options</h2>
        <p className="text-xl text-gray-600">
          Select configuration options for {vendor.name}
        </p>
      </div>

      <div className="space-y-4">
        {vendor.options.map((option) => {
          const isSelected = state.selectedOptions.includes(option.option);
          return (
            <Card
              key={option.option}
              className={isSelected ? "border-2 border-black bg-gray-50" : "border-2"}
            >
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={option.option}
                    checked={isSelected}
                    onCheckedChange={() => toggleOption(option.option)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={option.option}
                      className="cursor-pointer"
                    >
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {option.description}
                      </CardDescription>
                    </label>
                  </div>
                </div>
              </CardHeader>
              {isSelected && option.fields.length > 0 && (
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You'll configure the specific settings for this option in the next step.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {state.selectedOptions.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please select at least one integration option to continue.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

