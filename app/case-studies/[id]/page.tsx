import Link from "next/link";
import Image from "next/image";
import type { CaseStudyDetail } from "../_types/caseStudyDetail";
import { notFound } from "next/navigation";
import { compactLocations } from "../_lib/locations";
import { iso2CountryName } from "../_lib/iso";
import { API_BASE, fetchJson, ApiError } from "../_lib/api";
import ClientIcon from "../_components/icons/ClientIcon";

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
    return await fetchJson<CaseStudyDetail>(url);
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
                  className="object-contain ecl-u-pa-l"
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
                    <div className="ecl-u-mt-2xs ecl-u-type-paragraph ecl-u-d-flex ecl-u-align-items-center gap-2">
                      <ClientIcon className="wt-icon-location wt-icon--s shrink-0" />
                      <span className="ecl-u-d-flex ecl-u-flex-wrap gap-x-2">
                        {locations.map((l, i) => (
                          <span
                            key={l.key}
                            className="ecl-u-d-inline-flex ecl-u-align-items-center gap-1"
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

                  <div className="ecl-u-bg-grey-50 ecl-u-pa-m ecl-u-mt-m ecl-u-d-flex ecl-u-flex-column gap-3">
                    <div className="ecl-file" data-ecl-file>
                      <div className="ecl-file__container">
                        <ClientIcon className="wt-icon-ecl--file ecl-icon ecl-icon--2xl ecl-file__icon" />
                        <div className="ecl-file__info">
                          <div className="ecl-file__title">
                            {cs.methodology?.url
                              ? cs.methodology.name ?? "Methodology report"
                              : "Methodology report (not available)"}
                          </div>
                        </div>
                      </div>

                      {cs.methodology?.url && (
                        <div className="ecl-file__footer">
                          <div
                            className="ecl-file__language"
                            id="ecl-file-1200506283-lang"
                          >
                            English
                          </div>
                          <div className="ecl-file__meta">(16.2 MB - PDF)</div>
                          <div className="ecl-file__action">
                            <Link
                              href={cs.methodology.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="ecl-link ecl-link--standalone ecl-link--icon ecl-file__download ecl-u-d-inline-flex ecl-u-align-items-center"
                            >
                              <span className="ecl-link__label">Download</span>
                              <ClientIcon className="wt-icon-ecl--download ecl-icon ecl-icon--fluid ecl-link__icon" />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {cs.dataset?.url && (
                      <div className="ecl-file" data-ecl-file>
                        <div className="ecl-file__container">
                          <ClientIcon className="wt-icon-ecl--spreadsheet ecl-icon ecl-icon--2xl ecl-file__icon ecl-icon--secondary" />

                          <div className="ecl-file__info">
                            <div className="ecl-file__title">
                              {cs.dataset.url
                                ? cs.dataset.name ?? "Dataset"
                                : "Dataset (not available)"}
                            </div>
                          </div>
                        </div>

                        <div className="ecl-file__footer">
                          <div
                            className="ecl-file__language"
                            id="ecl-file-1200506233-lang"
                          >
                            English
                          </div>
                          <div className="ecl-file__meta">(16.2 MB - PDF)</div>
                          <div className="ecl-file__action">
                            <Link
                              href={cs.dataset.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="ecl-link ecl-link--standalone ecl-link--icon ecl-file__download ecl-u-d-inline-flex ecl-u-align-items-center"
                            >
                              <span className="ecl-link__label">Download</span>
                              <ClientIcon className="wt-icon-ecl--download ecl-icon ecl-icon--fluid ecl-link__icon" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
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
                      ORGANIZATIONS DETAILS
                    </div>
                  </div>

                  <div className="ecl-u-pa-m">
                    <dl>
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Organization name:</dt>
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
