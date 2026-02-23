"use client";

import { ReferenceDataProvider } from "../../_context/ReferenceDataContext";
import type { ReferenceData } from "../../_types/referenceData";

type ReferenceDataLayoutClientProps = Readonly<{
  referenceData: ReferenceData;
  children: React.ReactNode;
}>;

export default function ReferenceDataLayoutClient({
  referenceData,
  children,
}: ReferenceDataLayoutClientProps) {
  return (
    <ReferenceDataProvider value={referenceData}>{children}</ReferenceDataProvider>
  );
}
