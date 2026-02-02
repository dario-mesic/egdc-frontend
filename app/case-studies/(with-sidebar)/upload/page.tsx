"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadWizardClient from "../upload/_components/wizard/UploadWizardClient";
import type { ReferenceData, Organization } from "../../_types/referenceData";
import { API_BASE, fetchJson } from "../../_lib/api";
import LoadingIndicator from "../../_components/LoadingIndicator";

async function getReferenceData(): Promise<ReferenceData> {
  return fetchJson(`${API_BASE}/api/v1/reference-data/`);
}

async function getOrganizations(): Promise<Organization[]> {
  return fetchJson(`${API_BASE}/api/v1/organizations/`);
}

export default function UploadPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [refData, setRefData] = useState<ReferenceData | null>(null);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    const ok = sessionStorage.getItem("upload-authed") === "1";
    setAuthed(ok);
    setChecked(true);

    if (!ok) {
      router.replace("/case-studies/upload/login");
      return;
    }

    (async () => {
      try {
        const [referenceData, organizations] = await Promise.all([
          getReferenceData(),
          getOrganizations(),
        ]);
        setRefData({ ...referenceData, organizations });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load data.");
      }
    })();
  }, [router]);

  if (!checked) return null;
  if (!authed) return null;

  if (err) {
    return (
      <div className="ecl-u-pa-l">
        <div className="ecl-feedback-message ecl-feedback-message--error">
          {err}
        </div>
      </div>
    );
  }

  if (!refData) {
    return <LoadingIndicator />;
  }
  return <UploadWizardClient referenceData={refData} />;
}
