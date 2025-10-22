"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await copyToClipboard(code);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: filename || "Code copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
        {filename && (
          <span className="text-sm font-mono text-gray-700">{filename}</span>
        )}
        {language && !filename && (
          <span className="text-sm font-mono text-gray-700">{language}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="ml-auto"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="bg-white border border-gray-200 border-t-0 rounded-b-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono text-gray-900">{code}</code>
      </pre>
    </div>
  );
}

