import CaseStudiesList from "../../../../_components/CaseStudiesList";
import Pagination from "../../../../_components/Pagination";
import PageSizeSelect from "../../../../_components/PageSizeSelect";
import SortPopover from "../../../../_components/SortPopover";

import type {
  CaseStudySearchParams,
  PaginatedCaseStudies,
} from "../../../../_types/search";
import { API_BASE, fetchJson } from "../../../../_lib/api";
import Link from "next/link";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";

type MyCaseStudiesResultsProps = Readonly<{
  searchParams: CaseStudySearchParams;
}>;

const appendAll = (
  params: URLSearchParams,
  key: string,
  values?: string | string[],
) => {
  if (!values) return;
  (Array.isArray(values) ? values : [values]).forEach((v) =>
    params.append(key, v),
  );
};

async function searchCaseStudies(
  sp: CaseStudySearchParams,
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

  params.set("page", "1");
  params.set("limit", "50");

  params.set("sort_by", "created_date");
  params.set("sort_order", "desc");
  params.set("match_type", sp.match_type ?? "exact");

  return fetchJson(`${API_BASE}/api/v1/search/?${params.toString()}`);
}

function sortLocal(
  items: PaginatedCaseStudies["items"],
  sp: CaseStudySearchParams,
) {
  const sortBy = sp.sort_by ?? "created_date";
  const sortOrder = sp.sort_order ?? "desc";

  const dir = sortOrder === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    if (sortBy === "title") {
      return (
        (a.title ?? "").localeCompare(b.title ?? "", "en", {
          sensitivity: "base",
        }) * dir
      );
    }

    return 0;
  });
}

export default async function MyCaseStudiesResults({
  searchParams,
}: MyCaseStudiesResultsProps) {
  const result = await searchCaseStudies(searchParams);

  const myAll = [...result.items]
    .sort((a, b) =>
      (a.title ?? "").localeCompare(b.title ?? "", "en", {
        sensitivity: "base",
      }),
    )
    .slice(0, 3);

  const sorted = sortLocal(myAll, searchParams);

  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const limit = Math.max(1, Number(searchParams.limit ?? "10"));

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);

  const start = (safePage - 1) * limit;
  const end = start + limit;
  const pageItems = sorted.slice(start, end);

  return (
    <>
      <div className="ecl-row ecl-u-mb-s">
        <div className="ecl-col-12">
          <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center ecl-u-justify-content-between gap-4">
            <span className="ecl-u-type-s ecl-u-type-italic">
              My case studies ({total})
            </span>{" "}
            <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
              <Link
                className="ecl-button ecl-button--primary"
                href="/case-studies/upload"
              >
                <span className="ecl-button__container">
                  <ClientIcon className="wt-icon--plus ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
                  Upload new
                </span>
              </Link>
              <SortPopover />
            </div>
          </div>
        </div>
      </div>

      <div className="ecl-row">
        <div className="ecl-col-12">
          <div className="ecl-u-d-flex ecl-u-flex-column max-h-[calc(100vh-200px)] min-h-90">
            <div
              id="case-studies-scroll"
              className="flex-1 min-h-0 overflow-y-auto"
            >
              <CaseStudiesList caseStudies={pageItems} />
            </div>

            <div className="mt-auto ecl-u-bg-white ecl-u-pt-2xl">
              <div className="ecl-u-d-flex gap-4 flex-col min-[1140px]:flex-row min-[1140px]:items-end min-[1140px]:justify-between">
                <div className="order-2 min-[1140px]:order-1 ecl-u-d-flex ecl-u-justify-content-center min-[1140px]:ecl-u-justify-content-start! mt-4 min-[1140px]:mt-0">
                  <PageSizeSelect />
                </div>

                {totalPages > 1 && (
                  <div className="order-1 min-[1140px]:order-2 ecl-u-d-flex ecl-u-justify-content-center min-[1140px]:flex-1">
                    <Pagination
                      total={total}
                      page={safePage}
                      limit={limit}
                      searchParams={searchParams}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
