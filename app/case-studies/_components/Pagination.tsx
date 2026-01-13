"uce client";

import Link from "next/link";
import type { CaseStudySearchParams } from "../_types/search";
import ClientIcon from "../_components/icons/ClientIcon";

function makeHref(searchParams: CaseStudySearchParams, page: number) {
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(searchParams)) {
    if (v == null) continue;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else params.set(k, v);
  }

  params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "?page=1";
}

function getPages(current: number, totalPages: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);

  for (let p = current - 2; p <= current + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);

  const out: Array<number | "…"> = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

export default function Pagination({
  total,
  page,
  limit,
  searchParams,
}: {
  total: number;
  page: number;
  limit: number;
  searchParams: CaseStudySearchParams;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const current = Math.min(Math.max(1, page), totalPages);

  const pages = getPages(current, totalPages);
  const prevPage = Math.max(1, current - 1);
  const nextPage = Math.min(totalPages, current + 1);

  return (
    <nav className="ecl-pagination" aria-label="Pagination">
      <ul className="ecl-pagination__list">
        <li className="ecl-pagination__item ecl-pagination__item--previous">
          <Link
            href={makeHref(searchParams, prevPage)}
            className="ecl-link ecl-link--standalone ecl-link--icon ecl-pagination__link ecl-link--icon-only"
            aria-label="Go to previous page"
          >
            <ClientIcon className="wt-icon-ecl--corner-arrow-left ecl-icon  wt-icon--xs" />
            <span className="ecl-link__label">Previous</span>
          </Link>
        </li>

        {pages.map((p, idx) => {
          if (p === "…") {
            return (
              <li
                key={`t-${idx}`}
                className="ecl-pagination__item ecl-pagination__item--truncation"
              >
                <span className="ecl-pagination__text ecl-pagination__text--summary">
                  ...
                </span>
              </li>
            );
          }

          if (p === current) {
            return (
              <li
                key={p}
                className="ecl-pagination__item ecl-pagination__item--current"
              >
                <span
                  className="ecl-pagination__text ecl-pagination__text--summary"
                  aria-current="true"
                >
                  {p}
                </span>
                <span
                  className="ecl-pagination__text ecl-pagination__text--full"
                  aria-current="true"
                >
                  Page {p} of {totalPages}
                </span>
              </li>
            );
          }

          return (
            <li key={p} className="ecl-pagination__item">
              <Link
                href={makeHref(searchParams, p)}
                className="ecl-link ecl-link--standalone ecl-pagination__link"
                aria-label={`Go to page ${p}`}
              >
                {p}
              </Link>
            </li>
          );
        })}

        <li className="ecl-pagination__item ecl-pagination__item--next">
          <Link
            href={makeHref(searchParams, nextPage)}
            className="ecl-link ecl-link--standalone ecl-link--icon ecl-pagination__link ecl-link--icon-only"
            aria-label="Go to next page"
          >
            <span className="ecl-link__label">Next</span>
            <ClientIcon className="wt-icon-ecl--corner-arrow-right ecl-icon wt-icon--xs" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
