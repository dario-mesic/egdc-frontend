import Link from "next/link";
import Image from "next/image";
import type { CaseStudyDetail } from "../_types/caseStudyDetail";
import { compactLocations } from "../_lib/locations";
import ClientIcon from "../_components/icons/ClientIcon";
import CaseStudyDetailsActions from "./CaseStudyDetailsActions";
import Flag from "react-world-flags";

type Props = Readonly<{
  cs: CaseStudyDetail;
  preview?: boolean;
}>;

function formatValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function benefitsByType(cs: CaseStudyDetail, code: string) {
  const items = (cs.benefits ?? [])
    .filter((x) => x.type?.code?.toLowerCase() === code.toLowerCase())
    .sort((a, b) => {
      const aN = a.is_net_carbon_impact ? 1 : 0;
      const bN = b.is_net_carbon_impact ? 1 : 0;
      if (aN !== bN) return bN - aN;
      return 0;
    });

  return items
    .map((b) => ({
      key: b.id ?? `${b.type?.code ?? code}-${b.unit?.code ?? ""}-${b.value}`,
      value: formatValue(b.value),
      unit: (b.unit?.label ?? "").toLowerCase(),
      functionalUnit: (b.functional_unit ?? "").trim(),
      name: (b.name ?? "").trim(),
    }))
    .filter((b) => b.value);
}

export default function CaseStudyDetails({ cs, preview = false }: Props) {
  const provider = cs.is_provided_by?.[0] ?? null;
  const locations = compactLocations(cs.addresses);

  let methodologyTitle = "Methodology report (not available)";

  if (cs.methodology?.url) {
    methodologyTitle = cs.methodology.name ?? "Methodology report";
  } else if (preview && cs.methodology?.name) {
    methodologyTitle = cs.methodology.name;
  }

  let datasetTitle = "Dataset (not available)";

  if (cs.dataset?.url) {
    datasetTitle = cs.dataset.name ?? "Dataset";
  } else if (preview && cs.dataset?.name) {
    datasetTitle = cs.dataset.name;
  }

  let additionalTitle = "Additional document (not available)";

  if (cs.additional_document?.url) {
    additionalTitle = cs.additional_document.name ?? "Additional document";
  } else if (preview && cs.additional_document?.name) {
    additionalTitle = cs.additional_document.name;
  }

  const benefitsList = [
    { label: "Environmental", code: "environmental" },
    { label: "Economic", code: "economic" },
    { label: "Social", code: "social" },
  ]
    .map((t) => ({ label: t.label, items: benefitsByType(cs, t.code) }))
    .filter((t) => t.items.length > 0);

  return (
    <div className="ecl-u-pa-xl">
      {!preview && (
        <CaseStudyDetailsActions
          id={cs.id}
          title={cs.title ?? "this case study"}
          status={cs.status}
        />
      )}

      <div className="ecl-row">
        <div className="ecl-col-12 ecl-col-xl-6">
          <article className="ecl-card">
            <picture className="ecl-picture ecl-card__picture relative h-64 ecl-u-bg-grey-25 ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center overflow-hidden">
              <div className="relative h-full w-full p-6">
                <Image
                  src={
                    cs.logo?.url ??
                    "https://inno-ecl.s3.amazonaws.com/media/examples/example-image.jpg"
                  }
                  alt={cs.logo?.alt_text ?? cs.title}
                  fill
                  sizes="(min-width: 1200px) 420px, 100vw"
                  className="object-contain scale-[0.8]"
                  priority
                />
              </div>
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
                          {l.iso3 && (
                            <Flag
                              height={14}
                              width={20}
                              code={l.iso3.toLowerCase()}
                              fallback={<span></span>}
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

                <div className="ecl-u-bg-grey-75 ecl-u-pa-m ecl-u-mt-m ecl-u-d-flex ecl-u-flex-column gap-3">
                  <div className="ecl-file" data-ecl-file>
                    <div
                      className={[
                        "ecl-file__container",
                        preview ? "ecl-u-align-items-center ecl-u-pb-xl" : "",
                      ].join(" ")}
                    >
                      <ClientIcon className="wt-icon-ecl--file ecl-icon ecl-icon--2xl ecl-file__icon ecl-u-flex-shrink-0" />
                      <div className="ecl-file__info min-w-0">
                        <div className=" ecl-file__title wrap-anywhere leading-snug max-sm:text-base">
                          {methodologyTitle}
                        </div>
                      </div>
                    </div>

                    {cs.methodology && (
                      <div className="ecl-file__footer">
                        {cs.methodology.language?.label ? (
                          <div className="ecl-file__language">
                            {cs.methodology.language.label}
                          </div>
                        ) : null}

                        <div className="ecl-file__meta" />

                        {!preview && cs.methodology.url && (
                          <div className="ecl-file__action mt-0!">
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
                        )}
                      </div>
                    )}
                  </div>

                  {(preview ? !!cs.dataset?.name : !!cs.dataset?.url) && (
                    <div className="ecl-file" data-ecl-file>
                      <div
                        className={[
                          "ecl-file__container",
                          preview ? "ecl-u-align-items-center ecl-u-pb-xl" : "",
                        ].join(" ")}
                      >
                        <ClientIcon className="wt-icon-ecl--spreadsheet ecl-icon ecl-icon--2xl ecl-file__icon ecl-icon--secondary ecl-u-flex-shrink-0" />
                        <div className="ecl-file__info min-w-0">
                          <div className="ecl-file__title wrap-anywhere leading-snug max-sm:text-base">
                            {datasetTitle}
                          </div>
                        </div>
                      </div>

                      {cs.dataset && (
                        <div className="ecl-file__footer">
                          {cs.dataset.language?.label ? (
                            <div className="ecl-file__language">
                              {cs.dataset.language.label}
                            </div>
                          ) : null}

                          <div className="ecl-file__meta" />

                          {!preview && cs.dataset.url && (
                            <div className="ecl-file__action mt-0!">
                              <Link
                                href={cs.dataset.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="ecl-link ecl-link--standalone ecl-link--icon ecl-file__download ecl-u-d-inline-flex ecl-u-align-items-center"
                              >
                                <span className="ecl-link__label">
                                  Download
                                </span>
                                <ClientIcon className="wt-icon-ecl--download ecl-icon ecl-icon--fluid ecl-link__icon" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {(preview
                    ? !!cs.additional_document?.name
                    : !!cs.additional_document?.url) && (
                    <div className="ecl-file" data-ecl-file>
                      <div
                        className={[
                          "ecl-file__container",
                          preview ? "ecl-u-align-items-center ecl-u-pb-xl" : "",
                        ].join(" ")}
                      >
                        <ClientIcon className="wt-icon-ecl--file ecl-icon ecl-icon--2xl ecl-file__icon ecl-u-flex-shrink-0" />
                        <div className="ecl-file__info min-w-0">
                          <div className="ecl-file__title wrap-anywhere leading-snug max-sm:text-base">
                            {additionalTitle}
                          </div>
                        </div>
                      </div>

                      {cs.additional_document && (
                        <div className="ecl-file__footer">
                          {cs.additional_document.language?.label ? (
                            <div className="ecl-file__language">
                              {cs.additional_document.language.label}
                            </div>
                          ) : null}

                          <div className="ecl-file__meta" />

                          {!preview && cs.additional_document.url && (
                            <div className="ecl-file__action mt-0!">
                              <Link
                                href={cs.additional_document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="ecl-link ecl-link--standalone ecl-link--icon ecl-file__download ecl-u-d-inline-flex ecl-u-align-items-center"
                              >
                                <span className="ecl-link__label">
                                  Download
                                </span>
                                <ClientIcon className="wt-icon-ecl--download ecl-icon ecl-icon--fluid ecl-link__icon" />
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="ecl-col-12 ecl-col-xl-6 ecl-u-mt-l ecl-u-mt-xl-none ecl-u-d-xl-flex ecl-u-flex-column">
          {benefitsList.length > 0 && (
            <section className="ecl-u-mb-l">
              <div className="ecl-u-bg-black ecl-u-pa-s">
                <div className="ecl-u-type-heading-5 ecl-u-type-color-white">
                  OBSERVED BENEFITS
                </div>
              </div>

              <div className="ecl-u-bg-white ecl-u-pa-m ecl-u-border">
                <dl>
                  {benefitsList.map((group, groupIndex) => (
                    <div
                      key={group.label}
                      className={
                        benefitsList.length > 1 &&
                        groupIndex !== benefitsList.length - 1
                          ? "ecl-u-mb-s"
                          : ""
                      }
                    >
                      <dt className="font-semibold! ecl-u-type-heading-6">
                        {group.label} :
                      </dt>

                      <dd className="ecl-u-mt-2xs">
                        <ul className="ecl-u-mv-none ecl-u-pl-none">
                          {group.items.map((it, i) => (
                            <li
                              key={it.key}
                              className={
                                group.items.length > 1 &&
                                i !== group.items.length - 1
                                  ? "ecl-u-mb-xs"
                                  : ""
                              }
                            >
                              {it.name ? (
                                <span className="ecl-u-type-italic ecl-u-type-color-secondary-700">
                                  {it.name} -
                                </span>
                              ) : null}

                              <span className="font-bold ecl-u-type-color-primary-950">
                                {" "}
                                {it.value} {it.unit}
                              </span>

                              {it.functionalUnit ? (
                                <span> {it.functionalUnit}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          )}

          <section className="ecl-u-bg-primary-200 ecl-u-pa-m">
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
                      <dd className="ecl-u-mt-2xs">{cs.tech?.label ?? "—"}</dd>
                    </div>
                    <div className="ecl-u-mb-s">
                      <dt className="font-bold">Type of calculations:</dt>
                      <dd className="ecl-u-mt-2xs">
                        {cs.calc_type?.label ?? "—"}
                      </dd>
                    </div>
                    {cs.funding_type?.label ? (
                      <div className="ecl-u-mb-s">
                        <dt className="font-bold">Funding type:</dt>
                        <dd className="ecl-u-mt-2xs">
                          {cs.funding_type.label}
                        </dd>
                      </div>
                    ) : null}

                    {cs.funding_type?.label?.toLowerCase() === "public" &&
                      cs.funding_programme_url && (
                        <div className="ecl-u-mb-s">
                          <dt className="font-bold">Funding programme:</dt>
                          <dd className="ecl-u-mt-2xs">
                            <Link
                              className="ecl-link"
                              href={cs.funding_programme_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {cs.funding_programme_url}
                            </Link>
                          </dd>
                        </div>
                      )}
                    <div>
                      <dt className="font-bold">Creation date:</dt>
                      <dd className="ecl-u-mt-2xs">{cs.created_date ?? "—"}</dd>
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
                      <dd className="ecl-u-mt-2xs">{provider?.name ?? "—"}</dd>
                    </div>
                    <div className="ecl-u-mb-s">
                      <dt className="font-bold">Organization website:</dt>
                      <dd className="ecl-u-mt-2xs">
                        {provider.website_url ? (
                          <Link
                            className="ecl-link"
                            href={provider.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {provider.website_url}
                          </Link>
                        ) : (
                          "—"
                        )}
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
  );
}
