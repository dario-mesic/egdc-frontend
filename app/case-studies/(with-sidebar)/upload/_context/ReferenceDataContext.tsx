"use client";

import { createContext, useContext } from "react";
import type { ReferenceData } from "../../../_types/referenceData";

const ReferenceDataContext = createContext<ReferenceData | null>(null);

export function ReferenceDataProvider({
  value,
  children,
}: {
  value: ReferenceData;
  children: React.ReactNode;
}) {
  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceData() {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx)
    throw new Error(
      "useReferenceData must be used within ReferenceDataProvider"
    );
  return {
    ...ctx,
    organizations: ctx.organizations ?? [],
  };
}
