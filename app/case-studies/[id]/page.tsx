import type { CaseStudyDetail } from "../_types/caseStudyDetail";
import { notFound } from "next/navigation";
import { API_BASE, fetchJson, ApiError } from "../_lib/api";
import CaseStudyDetails from "../_components/CaseStudyDetails";

type CaseStudyPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

async function getCaseStudy(id: string): Promise<CaseStudyDetail> {
  const url = `${API_BASE}/api/v1/case-studies/${id}/`;
  try {
    return await fetchJson<CaseStudyDetail>(url);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404 || e.status === 422) notFound();
    }
    throw e;
  }
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { id } = await params;
  const cs = await getCaseStudy(id);
  return <CaseStudyDetails cs={cs} />;
}
