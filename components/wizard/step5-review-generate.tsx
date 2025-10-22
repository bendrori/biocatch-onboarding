"use client";

import { useState } from "react";
import { useWizard } from "@/lib/wizard-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getVendor, getVendorOption } from "@/lib/vendors";
import { FileText, Download, Share2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function Step5ReviewGenerate() {
  const { state } = useWizard();
  const { toast } = useToast();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const vendor = state.vendor ? getVendor(state.vendor) : null;

  const handleViewGuide = async () => {
    setGenerating(true);
    try {
      // Encode state and navigate to guide page
      const stateString = btoa(JSON.stringify(state));
      router.push(`/guide?state=${encodeURIComponent(stateString)}`);
    } catch (error) {
      toast({
        title: "Failed to generate guide",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleShareGuide = async () => {
    try {
      const stateString = btoa(JSON.stringify(state));
      const url = `${window.location.origin}/guide?state=${encodeURIComponent(stateString)}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied to clipboard",
        description: "Share this link to give others access to this guide",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleExportZip = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/export-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.clientName}-edge-integration.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: "Your integration files have been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (!vendor) {
    return <Alert><AlertDescription>Invalid configuration</AlertDescription></Alert>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-3">Review & Generate</h2>
        <p className="text-xl text-gray-600">
          Your integration is ready to deploy
        </p>
      </div>

      {/* Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Client Name</p>
            <p className="text-lg font-mono">{state.clientName}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-semibold text-gray-600">Environment</p>
            <Badge variant="outline" className="mt-1">
              {state.env.toUpperCase()}
            </Badge>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-semibold text-gray-600">Vendor</p>
            <p className="text-lg">{vendor.name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Selected Options</p>
            <div className="flex flex-wrap gap-2">
              {state.selectedOptions.map((optionKey) => {
                const option = getVendorOption(vendor, optionKey);
                return option ? (
                  <Badge key={optionKey} variant="secondary">
                    {option.title}
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-2 hover:shadow-2xl transition-all hover:scale-105 group cursor-pointer">
          <CardHeader>
            <div className="p-4 rounded-2xl bg-gray-100 group-hover:bg-black transition-colors w-fit">
              <Eye className="h-8 w-8 mb-0 group-hover:text-white transition-colors" />
            </div>
            <CardTitle className="text-xl pt-4">View Guide</CardTitle>
            <CardDescription>
              See the full integration guide with all steps and code snippets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={handleViewGuide}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  View Guide
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-2xl transition-all hover:scale-105 group cursor-pointer">
          <CardHeader>
            <div className="p-4 rounded-2xl bg-gray-100 group-hover:bg-black transition-colors w-fit">
              <Share2 className="h-8 w-8 mb-0 group-hover:text-white transition-colors" />
            </div>
            <CardTitle className="text-xl pt-4">Share Guide</CardTitle>
            <CardDescription>
              Copy a shareable link to this integration guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleShareGuide}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-2xl transition-all hover:scale-105 group cursor-pointer">
          <CardHeader>
            <div className="p-4 rounded-2xl bg-gray-100 group-hover:bg-black transition-colors w-fit">
              <Download className="h-8 w-8 mb-0 group-hover:text-white transition-colors" />
            </div>
            <CardTitle className="text-xl pt-4">Export Files</CardTitle>
            <CardDescription>
              Download all configuration files and scripts as a ZIP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleExportZip}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export ZIP
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Your configuration is complete! View the guide to see step-by-step instructions,
          share it with your team, or export all files for deployment.
        </AlertDescription>
      </Alert>
    </div>
  );
}

