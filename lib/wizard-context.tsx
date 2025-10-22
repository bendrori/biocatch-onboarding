"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { VendorKey, IntegrationOptionKey } from "@/lib/vendors";

export interface WizardState {
  // Step 1
  clientName: string;
  env: "dev" | "staging" | "production";
  
  // Step 2
  vendor: VendorKey | null;
  
  // Step 3
  selectedOptions: IntegrationOptionKey[];
  
  // Step 4
  inputs: Record<string, any>;
}

interface WizardContextType {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  resetState: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const defaultState: WizardState = {
  clientName: "",
  env: "production",
  vendor: null,
  selectedOptions: [],
  inputs: {},
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(defaultState);

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(defaultState);
  };

  const saveToLocalStorage = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wizardState", JSON.stringify(state));
    }
  };

  const loadFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wizardState");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setState(parsed);
        } catch (e) {
          console.error("Failed to load wizard state", e);
        }
      }
    }
  };

  // Auto-save on state changes
  useEffect(() => {
    saveToLocalStorage();
  }, [state]);

  return (
    <WizardContext.Provider
      value={{ state, updateState, resetState, saveToLocalStorage, loadFromLocalStorage }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}

