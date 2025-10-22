import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Zap, FileText, Settings, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-5xl mx-auto space-y-24">
        {/* Hero */}
        <section className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-in-up">
            <img 
              src="/biocatch-logo.svg" 
              alt="BioCatch" 
              className="w-20 h-20"
            />
          </div>
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-300 bg-gray-50 mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Automated CDN Integration</span>
          </div>
          <h1 className="text-7xl font-black tracking-tight leading-tight">
            BioCatch CDN
            <br />
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Integration
            </span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Generate production-ready configuration, code snippets, and
            step-by-step UI guides in minutes. No manual setup required.
          </p>
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button asChild size="lg" className="text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Link href="/wizard">
                Start Integration <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-10 py-7 rounded-xl">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>4 CDN Vendors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Zero Config</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Production Ready</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 hover:border-gray-400 transition-all hover:shadow-xl group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-900 transition-colors">
                    <Zap className="h-6 w-6 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl">Fast Configuration</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Answer a few questions and get complete worker code, DNS
                configuration, and deployment commands tailored to your vendor.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-gray-400 transition-all hover:shadow-xl group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-900 transition-colors">
                    <FileText className="h-6 w-6 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl">UI Navigation Guides</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Step-by-step dashboard instructions with exact button names,
                menu locations, and visual guidance through each CDN&apos;s interface.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-gray-400 transition-all hover:shadow-xl group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-900 transition-colors">
                    <Settings className="h-6 w-6 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl">4 Major CDN Providers</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Cloudflare Workers, Akamai EdgeWorkers, AWS CloudFront
                Functions/Lambda@Edge, and Fastly Compute@Edge all supported.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-gray-400 transition-all hover:shadow-xl group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-gray-900 transition-colors">
                    <CheckCircle2 className="h-6 w-6 group-hover:text-white transition-colors" />
                  </div>
                  <CardTitle className="text-xl">Export & Share</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed text-gray-600">
                Download all artifacts as ZIP, share guides via URL, or
                print to PDF. Everything ready for your team.
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section className="space-y-12 bg-gray-50 rounded-3xl p-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-gray-600">Five simple steps to complete integration</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            <div className="relative">
              <div className="space-y-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="font-bold text-base">Client Details</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Enter client name and environment
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="space-y-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="font-bold text-base">Select CDN</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Choose your vendor with visual icons
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="space-y-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="font-bold text-base">Pick Options</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Worker, DNS, rules configuration
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="space-y-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  4
                </div>
                <h3 className="font-bold text-base">Configure</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Enter URLs and account details
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="space-y-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  5
                </div>
                <h3 className="font-bold text-base">Export</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Get complete guide and files
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 pt-8 pb-8">
          <div className="bg-gradient-to-b from-gray-900 to-gray-700 text-white rounded-3xl p-16 shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Create your first BioCatch CDN integration in under 5 minutes
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-10 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Link href="/wizard">
                Launch Wizard <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

