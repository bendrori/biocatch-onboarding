import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BioCatch CDN Integrator",
  description: "Configure and deploy BioCatch edge integration solutions across CDN providers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-white">
              <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 no-print">
                <div className="container mx-auto px-6 py-5">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                      <img 
                        src="/biocatch-logo.svg" 
                        alt="BioCatch" 
                        className="w-10 h-10 group-hover:opacity-70 transition-opacity"
                      />
                      <h1 className="text-2xl font-black tracking-tight group-hover:text-gray-600 transition-colors">
                        BioCatch CDN Integrator
                      </h1>
                    </Link>
                <nav className="flex items-center space-x-8">
                  <Link
                    href="/wizard"
                    className="text-sm font-semibold hover:text-gray-600 transition-colors"
                  >
                    Wizard
                  </Link>
                  <Link
                    href="/about"
                    className="text-sm font-semibold hover:text-gray-600 transition-colors"
                  >
                    About
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 no-print">
            <div className="container mx-auto px-6 text-center text-sm text-gray-600">
              <p>&copy; 2025 BioCatch CDN Integrator. All rights reserved.</p>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

