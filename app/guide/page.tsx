"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CodeBlock } from "@/components/code-block";
import { Printer, AlertCircle, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { WizardState } from "@/lib/wizard-context";
import { getVendor, getVendorOption, TemplateContext } from "@/lib/vendors";

function GuideContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<WizardState | null>(null);
  const [guideMarkdown, setGuideMarkdown] = useState<string>("");
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stateParam = searchParams.get("state");
    if (!stateParam) {
      setError("No configuration found. Please complete the wizard first.");
      setLoading(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(decodeURIComponent(stateParam)));
      setState(decoded);
      generateGuide(decoded);
    } catch (e) {
      setError("Failed to load configuration. The link may be invalid.");
      setLoading(false);
    }
  }, [searchParams]);

  const generateGuide = async (wizardState: WizardState) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizardState),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();
      setGuideMarkdown(data.guideMarkdown);
      setArtifacts(data.artifacts);
    } catch (e) {
      setError("Failed to generate guide. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto" />
          <p className="text-lg text-gray-600">Generating your integration guide...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!state) return null;

  const vendor = state.vendor ? getVendor(state.vendor) : null;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Print Button */}
        <div className="mb-6 no-print">
          <Button onClick={handlePrint} size="lg">
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 pb-6 border-b-2">
          <h1 className="text-4xl font-bold mb-2">
            BioCatch CDN Integration Guide
          </h1>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge variant="outline" className="text-base px-3 py-1">
              Client: {state.clientName}
            </Badge>
            <Badge variant="outline" className="text-base px-3 py-1">
              Environment: {state.env.toUpperCase()}
            </Badge>
            {vendor && (
              <Badge variant="outline" className="text-base px-3 py-1">
                Vendor: {vendor.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Guide Content */}
        <div className="prose prose-gray max-w-none mb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-5 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-base leading-relaxed mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 mb-4">{children}</ol>
              ),
              code: ({ inline, children, ...props }: any) =>
                inline ? (
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto mb-4">
                    <code className="text-sm font-mono">{children}</code>
                  </pre>
                ),
              hr: () => <Separator className="my-6" />,
            }}
          >
            {guideMarkdown}
          </ReactMarkdown>
        </div>

        {/* Artifacts Section */}
        {artifacts.length > 0 && (
          <div className="space-y-6 mb-12">
            <Separator />
            <h2 className="text-3xl font-bold">Artifacts</h2>
            <p className="text-gray-600">
              Configuration files and commands generated for your integration.
            </p>

            <div className="space-y-6">
              {artifacts.map((artifact, idx) => (
                <div key={idx}>
                  {artifact.type === "file" && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        {artifact.path}
                      </h3>
                      <CodeBlock
                        code={artifact.contents}
                        filename={artifact.path}
                      />
                    </div>
                  )}
                  {artifact.type === "command" && (
                    <Card className="border-2">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold mb-3">
                          {artifact.label}
                        </h3>
                        <CodeBlock code={artifact.cmd} language="bash" />
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <Separator className="my-8" />
        <div className="text-center text-sm text-gray-600">
          <p>Generated by BioCatch CDN Integrator</p>
          <p className="mt-2">
            For BioCatch support, contact your BioCatch representative. For vendor-specific issues, refer to vendor documentation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-6 py-16 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    }>
      <GuideContent />
    </Suspense>
  );
}

