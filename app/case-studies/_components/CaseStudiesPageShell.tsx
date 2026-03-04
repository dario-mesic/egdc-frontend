import { ReactNode, Suspense } from "react";
import Search from "../_components/Search";
import Filters from "../_components/Filters";
import MatchTypeToggle from "../_components/MatchTypeToggle";
import LoadingIndicator from "../_components/LoadingIndicator";
import CreatedNotification from "../_components/CreatedNotification";
import type { CaseStudySearchParams } from "../_types/search";
import type { SearchFacets } from "../_types/facets";
import { API_BASE, fetchJson } from "../_lib/api";

export const dynamic = "force-dynamic";

type CaseStudiesPageShellProps = Readonly<{
  searchParams: Promise<CaseStudySearchParams>;
  Results: (p: { searchParams: CaseStudySearchParams }) => ReactNode;
  showSearchAndFilters?: boolean;
}>;

async function getFacets(): Promise<SearchFacets> {
  return fetchJson(`${API_BASE}/api/v1/search/facets/`);
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

export default async function CaseStudiesPageShell({
  searchParams,
  Results,
  showSearchAndFilters = true,
}: CaseStudiesPageShellProps) {
  const resolved = await searchParams;
  const facets = await getFacets();

  return (
    <>
      <CreatedNotification />

      {showSearchAndFilters && (
        <div className="ecl-row ecl-u-align-items-end ecl-u-mb-s">
          <div className="ecl-col-12 ecl-col-l-8 ecl-col-xl-9 order-0">
            <Search />
          </div>

          <div className="ecl-col-12 order-1 ecl-u-mt-s min-[1140px]:order-2 min-[1140px]:ecl-u-mt-none">
            <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between gap-3">
              <MatchTypeToggle />
            </div>
          </div>

          <div className="ecl-col-12 ecl-col-l-4 ecl-col-xl-3 order-2 min-[1140px]:order-1">
            <Filters facets={facets} />
          </div>
        </div>
      )}

      <Suspense key={suspenseKeyFrom(resolved)} fallback={<ResultsFallback />}>
        <Results searchParams={resolved} />
      </Suspense>
    </>
  );
}
