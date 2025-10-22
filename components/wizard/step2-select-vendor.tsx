"use client";

import { useWizard } from "@/lib/wizard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { vendors, VendorKey, getVendorIcon } from "@/lib/vendors";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function Step2SelectVendor() {
  const { state, updateState } = useWizard();

  const handleSelectVendor = (vendorKey: VendorKey) => {
    updateState({ 
      vendor: vendorKey,
      // Reset options and inputs when changing vendor
      selectedOptions: [],
      inputs: {}
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3">Select CDN Vendor</h2>
        <p className="text-xl text-gray-600">
          Choose your edge computing platform
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {Object.values(vendors).map((vendor) => {
          const VendorIcon = getVendorIcon(vendor.key);
          return (
            <Card
              key={vendor.key}
              className={cn(
                "cursor-pointer transition-all hover:shadow-2xl border-2 group relative overflow-hidden",
                state.vendor === vendor.key
                  ? "border-black bg-gradient-to-br from-gray-50 to-white shadow-xl scale-105"
                  : "border-gray-200 hover:border-gray-400"
              )}
              onClick={() => handleSelectVendor(vendor.key)}
            >
              {state.vendor === vendor.key && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-black opacity-5 rounded-bl-full" />
              )}
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
                      state.vendor === vendor.key 
                        ? "bg-black" 
                        : "bg-gray-100 group-hover:bg-gray-200"
                    )}>
                      <VendorIcon className={cn(
                        "h-8 w-8 flex-shrink-0 transition-colors",
                        state.vendor === vendor.key && "text-white"
                      )} />
                    </div>
                    <CardTitle className="text-2xl">{vendor.name}</CardTitle>
                  </div>
                  {state.vendor === vendor.key && (
                    <CheckCircle2 className="h-7 w-7 flex-shrink-0 text-black" />
                  )}
                </div>
              <CardDescription className="text-base">
                {vendor.summary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-semibold">Prerequisites:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {vendor.prerequisites.slice(0, 3).map((prereq, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                  {vendor.prerequisites.length > 3 && (
                    <li className="text-gray-500">
                      +{vendor.prerequisites.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      {state.vendor && (
        <Card className="border-2 border-black bg-gray-50">
          <CardHeader>
            <CardTitle>Selected: {vendors[state.vendor].name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold">All Prerequisites:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {vendors[state.vendor].prerequisites.map((prereq, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

