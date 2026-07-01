"use client";

import { create } from "zustand";
import { toast } from "@/components/ui/use-toast";

interface PipelineStore {
  isRunning: boolean;
  lastRunSummary: string | null;
  runPipeline: () => Promise<void>;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  isRunning: false,
  lastRunSummary: null,

  runPipeline: async () => {
    set({ isRunning: true });
    try {
      const res = await fetch("/api/pipeline", { method: "POST" });
      if (!res.ok) throw new Error("Pipeline failed");
      const data = await res.json();
      set({ lastRunSummary: data.agentRun.summary });
      toast({
        title: "Pipeline completed",
        description: data.agentRun.summary,
      });
      window.dispatchEvent(new CustomEvent("biocatch-sdk-foundry:refresh"));
    } catch {
      toast({
        title: "Pipeline failed",
        description: "Could not run the daily research pipeline.",
        variant: "destructive",
      });
    } finally {
      set({ isRunning: false });
    }
  },
}));
