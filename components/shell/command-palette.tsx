"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Beaker,
  FileText,
  FlaskConical,
  GitBranch,
  Home,
  Lightbulb,
  Network,
  Play,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPalette } from "@/store/ui-store";
import { usePipelineStore } from "@/store/pipeline-store";

const navigation = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Research", href: "/dashboard/feed", icon: FileText },
  { label: "Signals", href: "/dashboard/ideas", icon: Lightbulb },
  { label: "Experiments", href: "/dashboard/validation?tab=pocs", icon: Beaker },
  { label: "Knowledge Graph", href: "/dashboard/topics", icon: Network },
  { label: "Validation", href: "/dashboard/validation?tab=results", icon: FlaskConical },
  { label: "RFCs", href: "/dashboard/pipeline", icon: GitBranch },
  { label: "Settings", href: "/dashboard/agents", icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const { runPipeline } = usePipelineStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands, pages, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => run(() => router.push(item.href))}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => runPipeline())}>
            <Play className="mr-2 h-4 w-4 text-muted-foreground" />
            Run Daily Pipeline
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/dashboard/ideas"))}>
            <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
            Review Signal Ideas
          </CommandItem>
          <CommandItem onSelect={() => run(() => router.push("/dashboard/pipeline"))}>
            <GitBranch className="mr-2 h-4 w-4 text-muted-foreground" />
            View RFCs & Artifacts
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
