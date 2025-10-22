import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-12">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About BioCatch CDN Integrator</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            A production-ready tool for generating BioCatch edge integration configuration, code, UI guides, and documentation.
          </p>
        </section>

        <Separator />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">What Is BioCatch CDN Integrator?</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              BioCatch CDN Integrator is a web application that helps you configure and deploy BioCatch edge
              integrations across multiple CDN vendors. Instead of manually writing configuration files,
              worker code, and deployment scripts, you answer a few questions and get production-ready
              artifacts with UI navigation guides instantly.
            </p>
            <p>
              The tool supports four major edge computing platforms: Cloudflare Workers, Akamai
              EdgeWorkers, AWS CloudFront (Functions and Lambda@Edge), and Fastly Compute@Edge.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Key Features</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Multi-Vendor Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Configure integrations for Cloudflare, Akamai, AWS CloudFront, and Fastly using
                  a unified interface. Each vendor gets tailored configuration and code.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Integration Options</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose from worker forwarding, DNS configuration, page rules, and vendor-specific
                  options. Mix and match to fit your architecture.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Generated Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get comprehensive step-by-step guides with prerequisites, architecture diagrams,
                  verification commands, and troubleshooting tips.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export & Share</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Download all configuration files and scripts as a ZIP archive. Share integration
                  guides via URL or print to PDF.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Supported Vendors</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cloudflare</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Workers with routing</li>
                  <li>DNS configuration</li>
                  <li>Page Rules & Transform Rules</li>
                  <li>WAF & custom headers</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Akamai</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>EdgeWorkers deployment</li>
                  <li>Property Manager config</li>
                  <li>PAPI JSON snippets</li>
                  <li>Behavior rules</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AWS CloudFront</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>CloudFront Functions</li>
                  <li>Lambda@Edge</li>
                  <li>Route53 DNS</li>
                  <li>Cache behaviors</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fastly</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Compute@Edge (Rust/JS)</li>
                  <li>VCL snippets</li>
                  <li>Backend configuration</li>
                  <li>Cache rules</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Tech Stack</h2>
          <p className="text-gray-700 leading-relaxed">
            Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and shadcn/ui components.
            The design is strictly monochrome with a focus on typography, spacing, and accessibility.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Framework:</strong> Next.js 14 with App Router</li>
            <li><strong>Language:</strong> TypeScript</li>
            <li><strong>Styling:</strong> Tailwind CSS (monochrome palette)</li>
            <li><strong>UI Components:</strong> shadcn/ui + Radix UI primitives</li>
            <li><strong>Icons:</strong> Lucide React</li>
            <li><strong>Forms:</strong> React Hook Form + Zod validation</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Extending the Tool</h2>
          <p className="text-gray-700 leading-relaxed">
            Edge Integrator is designed to be easily extensible. To add a new vendor or integration option:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Add the vendor definition to <code className="bg-gray-100 px-2 py-1 rounded">lib/vendors.ts</code></li>
            <li>Define integration options with form fields, guide templates, and artifacts</li>
            <li>The wizard and guide generation will automatically adapt</li>
          </ol>
          <p className="text-gray-700 leading-relaxed">
            See the README for detailed instructions on extending the schema.
          </p>
        </section>
      </div>
    </div>
  );
}

