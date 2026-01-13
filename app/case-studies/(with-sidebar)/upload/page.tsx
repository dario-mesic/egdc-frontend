import UploadWizardClient from "../upload/_components/wizard/UploadWizardClient";
import type { ReferenceData, Organization } from "../../_types/referenceData";
import { API_BASE, fetchJson } from "../../_lib/api";

async function getReferenceData(): Promise<ReferenceData> {
  return fetchJson(`${API_BASE}/api/v1/reference-data/`);
}

async function getOrganizations(): Promise<Organization[]> {
  return fetchJson(`${API_BASE}/api/v1/organizations/`);
}

export default async function UploadPage() {
  const [referenceData, organizations] = await Promise.all([
    getReferenceData(),
    getOrganizations(),
  ]);
  return (
    <UploadWizardClient
      referenceData={{
        ...referenceData,
        organizations,
      }}
    />
  );
}
