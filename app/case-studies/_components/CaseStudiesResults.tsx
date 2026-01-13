import CaseStudiesList from "../_components/CaseStudiesList";
import Pagination from "../_components/Pagination";
import type {
  CaseStudySearchParams,
  PaginatedCaseStudies,
} from "../_types/search";
import { API_BASE, fetchJson } from "../_lib/api";

const appendAll = (
  params: URLSearchParams,
  key: string,
  values?: string | string[]
) => {
  if (!values) return;
  (Array.isArray(values) ? values : [values]).forEach((v) =>
    params.append(key, v)
  );
};

async function searchCaseStudies(
  sp: CaseStudySearchParams
): Promise<PaginatedCaseStudies> {
  const params = new URLSearchParams();

  if (sp.q) params.set("q", sp.q);

  appendAll(params, "sector", sp.sector);
  appendAll(params, "tech_code", sp.tech_code);
  appendAll(params, "funding_type_code", sp.funding_type_code);
  appendAll(params, "calc_type_code", sp.calc_type_code);
  appendAll(params, "country", sp.country);
  appendAll(params, "organization_types", sp.organization_types);
  appendAll(params, "benefit_units", sp.benefit_units);
  appendAll(params, "benefit_types", sp.benefit_types);

  params.set("page", sp.page ?? "1");
  params.set("limit", sp.limit ?? "10");

  return fetchJson(`${API_BASE}/api/v1/search/?${params.toString()}`);
}

export default async function CaseStudiesResults({
  searchParams,
}: {
  searchParams: CaseStudySearchParams;
}) {
  const result = await searchCaseStudies(searchParams);
  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  if (result.total === 0) {
    return (
      <>
        <div className="ecl-row ecl-u-mb-s">
          <div className="ecl-col-12">
            <span className="ecl-u-type-paragraph ecl-u-type-italic">
              Case studies found (0)
            </span>
          </div>
        </div>

        <div className="ecl-row">
          <div className="ecl-col-12">
            <div className="ecl-u-bg-grey-25 ecl-u-pa-l ecl-u-border-all ecl-u-border-color-grey-50">
              <h2 className="ecl-u-type-heading-4 ecl-u-mb-s">
                No results found
              </h2>
              <p className="ecl-u-type-paragraph">
                Sorry, we couldn’t find any case studies matching your search.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="ecl-row ecl-u-mb-s">
        <div className="ecl-col-12">
          <span className="ecl-u-type-paragraph ecl-u-type-italic">
            Case studies found ({result.total})
          </span>
        </div>
      </div>

      <div className="ecl-row">
        <div className="ecl-col-12">
          <div className="ecl-u-d-flex ecl-u-flex-column max-h-[calc(100vh-200px)] min-h-90">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <CaseStudiesList caseStudies={result.items} />
            </div>

            {totalPages > 1 && (
              <div className="mt-auto ecl-u-bg-white ecl-u-pt-2xl">
                <div className="ecl-u-d-flex ecl-u-justify-content-center">
                  <Pagination
                    total={result.total}
                    page={result.page}
                    limit={result.limit}
                    searchParams={searchParams}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
