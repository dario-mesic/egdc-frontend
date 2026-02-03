"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadWizardClient from "./wizard/UploadWizardClient";
import type { ReferenceData } from "../../../_types/referenceData";
import LoadingIndicator from "../../../_components/LoadingIndicator";

export default function UploadGateClient({
  referenceData,
}: {
  referenceData: ReferenceData;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("upload-authed") === "1";
    setAuthed(ok);
    setChecked(true);
    if (!ok) router.replace("/case-studies/upload/login");
  }, [router]);

  if (!checked) {
    return <LoadingIndicator />;
  }
  if (!authed) return null;

  return <UploadWizardClient referenceData={referenceData} />;
}
