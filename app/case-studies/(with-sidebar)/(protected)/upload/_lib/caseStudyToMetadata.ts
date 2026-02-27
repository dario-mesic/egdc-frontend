import type { CaseStudyDetail } from "@/app/case-studies/_types/caseStudyDetail";
import type { CaseStudyMetadata } from "./schemas/caseStudy";

export function caseStudyDetailToMetadata(cs: CaseStudyDetail): Partial<CaseStudyMetadata> {
  const provider = cs.is_provided_by?.[0];
  const funder = cs.is_funded_by?.[0];
  const usedBy = (cs as { is_used_by?: { id: number }[] }).is_used_by?.[0];

  return {
    title: cs.title ?? "",
    short_description: cs.short_description ?? "",
    long_description: cs.long_description ?? "",
    problem_solved: cs.problem_solved ?? "",
    created_date: cs.created_date ?? "",
    tech_code: cs.tech_code ?? cs.tech?.code ?? "",
    calc_type_code: cs.calc_type_code ?? cs.calc_type?.code ?? "",
    funding_type_code: cs.funding_type_code ?? cs.funding_type?.code ?? null,
    funding_programme_url: cs.funding_programme_url ?? null,
    addresses: (cs.addresses ?? []).map((a) => ({
      admin_unit_l1: a.admin_unit_l1 ?? "",
      post_name: a.post_name ?? "",
    })),
    provider_org_id: provider?.id ?? 0,
    funder_org_id: funder?.id ?? null,
    used_by_org_id: usedBy?.id ?? null,
    benefits: (cs.benefits ?? [])
      .map((b) => ({
        type_code: b.type?.code ?? "",
        name: b.name ?? "",
        value: b.value ?? 0,
        unit_code: b.unit?.code ?? "",
        functional_unit: b.functional_unit ?? "",
        is_net_carbon_impact: !!(b as { is_net_carbon_impact?: boolean }).is_net_carbon_impact,
      }))
      .sort((a, b) => (b.is_net_carbon_impact ? 1 : 0) - (a.is_net_carbon_impact ? 1 : 0)),
    methodology_language_code: cs.methodology?.language?.code ?? "",
    dataset_language_code: cs.dataset?.language?.code ?? "",
    additional_language_code: cs.additional_document?.language?.code ?? null,
  };
}
