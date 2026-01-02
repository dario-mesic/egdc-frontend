import Link from "next/link";
import Image from "next/image";
import type { CaseStudyDetail } from "../_types/caseStudyDetail";
import { notFound } from "next/navigation";
import { compactLocations } from "../_lib/locations";
import { iso2CountryName } from "../_lib/iso";
import { fetchJson, ApiError } from "../_lib/api";
import ClientIcon from "../_components/icons/ClientIcon";

const API_BASE = process.env.API_BASE_URL!;

function formatValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function benefit(cs: CaseStudyDetail, code: string) {
  const b = (cs.benefits ?? []).find(
    (x) => x.type?.code?.toLowerCase() === code.toLowerCase()
  );
  if (!b) return "—";
  return `${formatValue(b.value)} ${b.unit?.code ?? ""} — ${
    b.name ?? ""
  }`.trim();
}

async function getCaseStudy(id: string): Promise<CaseStudyDetail> {
  const url = `${API_BASE}/api/v1/case-studies/${id}/`;

  try {
    return await fetchJson<CaseStudyDetail>(url, { next: { revalidate: 60 } });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 404 || e.status === 422) notFound();
    }
    throw e;
  }
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cs = await getCaseStudy(id);

  const provider = cs.is_provided_by?.[0] ?? null;
  const locations = compactLocations(cs.addresses);

  return (
    <>
      <div className="ecl-u-pa-xl">
        <Link
          href="/case-studies"
          className="ecl-link ecl-link--default ecl-link--icon ecl-u-d-inline-flex ecl-u-align-items-center ecl-u-mb-m"
        >
          <ClientIcon className="wt-icon-ecl--arrow-left ecl-icon ecl-icon--l ecl-link__icon" />
          <span className="ecl-link__label">Back to case studies</span>
        </Link>

        <div className="ecl-row">
          <div className="ecl-col-12 ecl-col-xl-6">
            <article className="ecl-card">
              <picture className="ecl-picture ecl-card__picture relative h-64 ecl-u-bg-grey-25 ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center">
                <Image
                  src={
                    cs.logo?.url ??
                    "https://inno-ecl.s3.amazonaws.com/media/examples/example-image.jpg"
                  }
                  alt={cs.logo?.alt_text ?? cs.title}
                  fill
                  sizes="(min-width: 1200px) 50vw, 100vw"
                  className="object-contain p-6"
                  priority
                />
              </picture>

              <div className="ecl-card__body">
                <div
                  className="ecl-content-block ecl-card__content-block"
                  data-ecl-auto-init="ContentBlock"
                  data-ecl-content-block
                >
                  <div
                    className="ecl-content-block__title ecl-u-type-heading-3 ecl-u-type-color-primary-950 font-bold!"
                    data-ecl-title-link
                  >
                    {cs.title}
                  </div>

                  {locations.length > 0 && (
                    <div className="ecl-u-mt-2xs ecl-u-type-paragraph flex items-center gap-2">
                      <ClientIcon className="wt-icon-location wt-icon--s shrink-0" />
                      <span className="flex flex-wrap gap-x-2">
                        {locations.map((l, i) => (
                          <span
                            key={l.key}
                            className="inline-flex items-center gap-1"
                          >
                            {l.iso2 && (
                              <ClientIcon
                                className={`wt-icon-flags--${l.iso2} wt-icon--s`}
                                title={iso2CountryName(l.iso2) ?? undefined}
                              />
                            )}
                            <span>{l.city}</span>
                            {i < locations.length - 1 ? " • " : ""}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}

                  <div className="ecl-content-block__description">
                    <strong>Description:</strong>{" "}
                    {cs.long_description ?? cs.short_description}
                  </div>

                  <div className="ecl-u-bg-grey-50 ecl-u-pa-m ecl-u-mt-m">
                    <ul className="ecl-unordered-list ecl-unordered-list--no-marker">
                      <li className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between ecl-u-pv-s">
                        <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
                          <ClientIcon className="wt-icon-ecl--file ecl-icon ecl-icon--l" />
                          {cs.methodology?.url ? (
                            <Link
                              className="ecl-link"
                              href={cs.methodology.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              {cs.methodology.name ?? "Methodology report"}{" "}
                              (.pdf)
                            </Link>
                          ) : (
                            <span className="ecl-u-type-color-grey-75">
                              Methodology report (not available)
                            </span>
                          )}
                        </div>

                        {cs.methodology?.url ? (
                          <Link
                            href={cs.methodology.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ecl-link"
                          >
                            <ClientIcon className="wt-icon-ecl--download ecl-icon ecl-icon--l" />
                          </Link>
                        ) : null}
                      </li>

                      {cs.dataset?.url ? (
                        <li className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between ecl-u-pv-s">
                          <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
                            <ClientIcon className="wt-icon-ecl--spreadsheet ecl-icon ecl-icon--l ecl-icon--secondary" />
                            <Link
                              className="ecl-link"
                              href={cs.dataset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                            >
                              {cs.dataset.name ?? "Dataset"} (.xlsx)
                            </Link>
                          </div>

                          <Link
                            href={cs.dataset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ecl-link"
                          >
                            <span
                              className="wt-icon-ecl--download ecl-icon ecl-icon--l"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="ecl-col-12 ecl-col-xl-6 ecl-u-mt-l ecl-u-mt-xl-none">
            <section className="ecl-u-mb-l">
              <div className="ecl-u-bg-black ecl-u-pa-s">
                <div className="ecl-u-type-heading-5 ecl-u-type-color-white">
                  OBSERVED BENEFITS
                </div>
              </div>

              <div className="ecl-u-bg-white ecl-u-pa-m ecl-u-border">
                <dl>
                  <div className="ecl-u-mb-s">
                    <dt className="font-bold">Environmental:</dt>
                    <dd className="ecl-u-mt-2xs">
                      {benefit(cs, "environmental")}
                    </dd>
                  </div>
                  <div className="ecl-u-mb-s">
                    <dt className="font-bold">Economic:</dt>
                    <dd className="ecl-u-mt-2xs">{benefit(cs, "economic")}</dd>
                  </div>
                  <div>
                    <dt className="font-bold">Social:</dt>
                    <dd className="ecl-u-mt-2xs">{benefit(cs, "social")}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="ecl-u-bg-grey-50 ecl-u-pa-m">
              <div className="ecl-row">
                <div className="ecl-col-12 ecl-col-m-6">
                  <div className="ecl-u-bg-primary ecl-u-pa-s">
                    <div className="ecl-u-type-heading-6 ecl-u-type-color-white ecl-u-type-align-center">
                      CASE STUDY DETAILS
                    </div>
                  </div>

                  <div className="ecl-u-pa-m">
                    <dl>
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Problems solved:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {cs.problem_solved ?? "—"}
                        </dd>
                      </div>
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Technology used:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {cs.tech?.label ?? "—"}
                        </dd>
                      </div>
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Type of calculations:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {cs.calc_type?.label ?? "—"}
                        </dd>
                      </div>
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Funding type:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {cs.funding_type?.label ?? "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold">Creation date:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {cs.created_date ?? "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="ecl-col-12 ecl-col-m-6 md:border-l">
                  <div className="ecl-u-bg-primary ecl-u-pa-s">
                    <div className="ecl-u-type-heading-6 ecl-u-type-color-white ecl-u-type-align-center">
                      ORGANISATIONS DETAILS
                    </div>
                  </div>

                  <div className="ecl-u-pa-m">
                    <dl>
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Organisation name:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {provider?.name ?? "—"}
                        </dd>
                      </div>

                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Sector:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {provider?.sector?.label ?? "—"}
                        </dd>
                      </div>

                      <div>
                        <dt className="font-bold">Contact details:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {provider?.contact_points?.length ? (
                            <ul className="ecl-unordered-list ecl-u-mv-none">
                              {provider.contact_points.map((cp) => (
                                <li key={cp.id}>
                                  <span className="font-semibold">
                                    {cp.name}:
                                  </span>{" "}
                                  {cp.has_email ? (
                                    <Link
                                      className="ecl-link"
                                      href={`mailto:${cp.has_email}`}
                                    >
                                      {cp.has_email}
                                    </Link>
                                  ) : (
                                    "—"
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="ecl-u-type-italic">
                              (No contacts provided)
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
