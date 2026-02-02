"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { CaseStudyMetadata } from "../_lib/schemas/caseStudy";

type WizardDataProviderProps = Readonly<{
  children: React.ReactNode;
}>;

type WizardFiles = {
  file_methodology?: File;
  file_dataset?: File;
  file_logo?: File;
};

type WizardData = {
  metadata: Partial<CaseStudyMetadata>;
  files: WizardFiles;
};

type StepValidity = Record<number, boolean>;

type Ctx = {
  data: WizardData;
  setMetadata: (patch: Partial<CaseStudyMetadata>) => void;
  setFiles: (patch: WizardFiles) => void;
  stepValidity: StepValidity;
  setStepValidity: (stepId: number, valid: boolean) => void;
};

const WizardDataContext = createContext<Ctx | null>(null);

function shallowEqualObj(a: Record<string, any>, b: Record<string, any>) {
  if (a === b) return true;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

export function WizardDataProvider({ children }: WizardDataProviderProps) {
  const [data, setData] = useState<WizardData>({ metadata: {}, files: {} });
  const [stepValidity, setStepValidity] = useState<StepValidity>({});

  const setMetadata = useCallback((patch: Partial<CaseStudyMetadata>) => {
    setData((p) => {
      const nextMeta = { ...p.metadata, ...patch };
      if (shallowEqualObj(p.metadata, nextMeta)) return p;
      return { ...p, metadata: nextMeta };
    });
  }, []);

  const setFiles = useCallback((patch: WizardFiles) => {
    setData((p) => {
      const nextFiles = { ...p.files, ...patch };
      if (shallowEqualObj(p.files, nextFiles)) return p;
      return { ...p, files: nextFiles };
    });
  }, []);

  const updateStepValidity = useCallback((stepId: number, valid: boolean) => {
    setStepValidity((prev) => {
      if (prev[stepId] === valid) return prev;
      return { ...prev, [stepId]: valid };
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      data,
      setMetadata,
      setFiles,
      stepValidity,
      setStepValidity: updateStepValidity,
    }),
    [
      data,
      stepMetadataKey(data),
      stepValidity,
      setMetadata,
      setFiles,
      updateStepValidity,
    ],
  );

  return (
    <WizardDataContext.Provider value={value}>
      {children}
    </WizardDataContext.Provider>
  );
}

function stepMetadataKey(data: WizardData) {
  return (
    String(Object.keys(data.metadata).length) +
    ":" +
    String(Object.keys(data.files).length)
  );
}

export function useWizardData() {
  const ctx = useContext(WizardDataContext);
  if (!ctx)
    throw new Error("useWizardData must be used within WizardDataProvider");
  return ctx;
}
