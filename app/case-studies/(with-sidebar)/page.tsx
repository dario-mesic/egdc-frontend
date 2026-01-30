import { Suspense } from "react";
import Search from "../_components/Search";
import Filters from "../_components/Filters";
import MatchTypeToggle from "../_components/MatchTypeToggle";
import CaseStudiesResults from "../_components/CaseStudiesResults";
import LoadingIndicator from "../_components/LoadingIndicator";
import CreatedNotification from "../_components/CreatedNotification";
import type { ReferenceData } from "../_types/referenceData";
import type { CaseStudySearchParams } from "../_types/search";
import type { SearchFacets } from "../_types/facets";
import { API_BASE, fetchJson } from "../_lib/api";

export const dynamic = "force-dynamic";

async function getFacets(): Promise<SearchFacets> {
  return fetchJson(`${API_BASE}/api/v1/search/facets/`);
}

async function getReferenceData(): Promise<ReferenceData> {
  return fetchJson(`${API_BASE}/api/v1/reference-data/`);
}

function suspenseKeyFrom(sp: CaseStudySearchParams) {
  const norm = (v?: string | string[]) =>
    Array.isArray(v) ? v.join(",") : (v ?? "");

  return [
    sp.q ?? "",
    sp.page ?? "1",
    sp.limit ?? "10",
    sp.sort_by ?? "created_date",
    sp.sort_order ?? "desc",
    sp.match_type ?? "exact",
    norm(sp.sector),
    norm(sp.tech_code),
    norm(sp.funding_type_code),
    norm(sp.calc_type_code),
    norm(sp.country),
    norm(sp.organization_types),
    norm(sp.benefit_units),
    norm(sp.benefit_types),
  ].join("|");
}

function ResultsFallback() {
  return (
    <div className="ecl-u-d-flex ecl-u-flex-column h-[calc(100vh-200px)] min-h-100">
      <div className="flex-1 min-h-0 relative">
        <LoadingIndicator />
      </div>
    </div>
  );
}

export default async function CaseStudies({
  searchParams,
}: {
  searchParams: Promise<CaseStudySearchParams>;
}) {
  const resolved = await searchParams;
  const [referenceData, facets] = await Promise.all([
    getReferenceData(),
    getFacets(),
  ]);

  return (
    <>
      <CreatedNotification />
      <div className="ecl-row ecl-u-align-items-end ecl-u-mb-s">
        <div className="ecl-col-12 ecl-col-l-8 ecl-col-xl-9">
          <Search />
        </div>
        <div className="ecl-col-12 ecl-col-l-4 ecl-col-xl-3">
          <Filters referenceData={referenceData} facets={facets} />
        </div>
      </div>
      <div className="ecl-row ecl-u-mb-s">
        <div className="ecl-col-12">
          <MatchTypeToggle />
        </div>
      </div>
      <Suspense key={suspenseKeyFrom(resolved)} fallback={<ResultsFallback />}>
        <CaseStudiesResults searchParams={resolved} />
      </Suspense>
    </>
  );
}
