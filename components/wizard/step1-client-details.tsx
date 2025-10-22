"use client";

import { useWizard } from "@/lib/wizard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Step1ClientDetails() {
  const { state, updateState } = useWizard();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3">Client Details</h2>
        <p className="text-xl text-gray-600">
          Start by providing basic information about your integration
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            This information will be used throughout the configuration and in generated documentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientName">
              Client Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientName"
              placeholder="e.g., acme-corp"
              value={state.clientName}
              onChange={(e) => updateState({ clientName: e.target.value })}
              className="max-w-md"
            />
            <p className="text-sm text-gray-500">
              A short identifier for this client (used in filenames and configuration).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Target Environment</Label>
            <Select
              value={state.env}
              onValueChange={(value: "dev" | "staging" | "production") =>
                updateState({ env: value })
              }
            >
              <SelectTrigger id="environment" className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              The environment where this integration will be deployed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

