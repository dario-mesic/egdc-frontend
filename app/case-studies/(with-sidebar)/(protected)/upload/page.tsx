import UploadWizardClient from "../upload/_components/wizard/UploadWizardClient";
import type { Organization } from "../../../_types/referenceData";
import { API_BASE, fetchJson } from "../../../_lib/api";

async function getOrganizations(): Promise<Organization[]> {
  return fetchJson(`${API_BASE}/api/v1/organizations/`);
}

export default async function UploadPage() {
  const organizations = await getOrganizations();
  return <UploadWizardClient organizations={organizations} />;
}
