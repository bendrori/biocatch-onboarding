"use client";

import { useWizard } from "@/lib/wizard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getVendor, getVendorOption } from "@/lib/vendors";
import { Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Step4VendorSettings() {
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
  if (!vendor) return null;

  if (state.selectedOptions.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please select at least one integration option first.
        </AlertDescription>
      </Alert>
    );
  }

  const updateInput = (optionKey: string, fieldKey: string, value: any) => {
    const newInputs = { ...state.inputs };
    if (!newInputs[optionKey]) {
      newInputs[optionKey] = {};
    }
    newInputs[optionKey][fieldKey] = value;
    updateState({ inputs: newInputs });
  };

  const getInputValue = (optionKey: string, fieldKey: string, defaultValue: any = "") => {
    return state.inputs[optionKey]?.[fieldKey] ?? defaultValue;
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3">Vendor Configuration</h2>
        <p className="text-xl text-gray-600">
          Enter vendor-specific settings for your integration
        </p>
      </div>

      <Accordion type="multiple" defaultValue={state.selectedOptions} className="space-y-4">
        {state.selectedOptions.map((optionKey) => {
          const option = getVendorOption(vendor, optionKey);
          if (!option) return null;

          return (
            <AccordionItem key={optionKey} value={optionKey} className="border-2 rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{option.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                {option.fields.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No additional configuration required for this option.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {option.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={`${optionKey}-${field.key}`}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {field.type === "text" && (
                          <Input
                            id={`${optionKey}-${field.key}`}
                            placeholder={field.placeholder}
                            value={getInputValue(optionKey, field.key)}
                            onChange={(e) => updateInput(optionKey, field.key, e.target.value)}
                          />
                        )}

                        {field.type === "textarea" && (
                          <Textarea
                            id={`${optionKey}-${field.key}`}
                            placeholder={field.placeholder}
                            value={getInputValue(optionKey, field.key)}
                            onChange={(e) => updateInput(optionKey, field.key, e.target.value)}
                            rows={4}
                          />
                        )}

                        {field.type === "checkbox" && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${optionKey}-${field.key}`}
                              checked={getInputValue(optionKey, field.key, false)}
                              onCheckedChange={(checked) =>
                                updateInput(optionKey, field.key, checked)
                              }
                            />
                            <label
                              htmlFor={`${optionKey}-${field.key}`}
                              className="text-sm cursor-pointer"
                            >
                              {field.placeholder || "Enable"}
                            </label>
                          </div>
                        )}

                        {field.type === "select" && field.options && (
                          <Select
                            value={getInputValue(optionKey, field.key)}
                            onValueChange={(value) => updateInput(optionKey, field.key, value)}
                          >
                            <SelectTrigger id={`${optionKey}-${field.key}`}>
                              <SelectValue placeholder={field.placeholder || "Select..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {field.help && (
                          <p className="text-sm text-gray-500">{field.help}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All fields are optional unless marked with *. You can leave fields empty and fill them in
          manually later in the generated configuration files.
        </AlertDescription>
      </Alert>
    </div>
  );
}

