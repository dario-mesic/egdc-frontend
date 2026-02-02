import Link from "next/link";
import Image from "next/image";
import type { CaseStudy } from "../_types/caseStudy";
import { compactLocations } from "../_lib/locations";
import { iso2CountryName } from "../_lib/iso";
import ClientIcon from "../_components/icons/ClientIcon";

type CaseStudyiesListProps = Readonly<{
  caseStudies: CaseStudy[];
}>;

function formatValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function benefit(cs: CaseStudy, code: string) {
  const b = (cs.benefits ?? []).find(
    (x) => x.type?.code?.toLowerCase() === code.toLowerCase(),
  );
  if (!b) return "—";
  return `${formatValue(b.value)} ${b.unit?.code ?? ""} — ${
    b.name ?? ""
  }`.trim();
}

function normalizeUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

export default function CaseStudiesList({
  caseStudies,
}: CaseStudyiesListProps) {
  return (
    <div className="ecl-u-mt-l">
      {caseStudies.map((cs) => {
        const provider = cs.is_provided_by?.[0] ?? null;
        const logoUrl = normalizeUrl(cs.logo?.url);
        return (
          <Link
            key={cs.id}
            href={`/case-studies/${cs.id}`}
            prefetch={false}
            className="ecl-u-display-block ecl-u-text-decoration-none"
          >
            <article className="ecl-content-item ecl-u-mb-l ecl-u-pa-m ecl-u-bg-primary-300 ecl-u-border-all ecl-u-border-width-2 ecl-u-border-color-primary">
              <div className="ecl-u-width-100 grid gap-6 grid-cols-1 min-[1140px]:grid-cols-[152px_minmax(0,1fr)_minmax(320px,1fr)] min-[1140px]:items-stretch">
                <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-center">
                  <div className="relative w-24 h-24 min-[1140px]:w-38 min-[1140px]:h-38 rounded-full overflow-hidden ecl-u-bg-grey-25">
                    <Image
                      src={logoUrl ?? ""}
                      alt={cs.logo?.alt_text ?? cs.title}
                      fill
                      sizes="152px"
                      className="object-contain scale-[0.8] origin-center ecl-u-pa-s"
                      style={{ color: "unset" }}
                    />
                  </div>
                </div>

                <div className="min-[1140px]:pr-6 min-[1140px]:border-r border-right-none ecl-u-d-flex ecl-u-flex-column">
                  <ul className="ecl-content-block__primary-meta-container font-semibold">
                    <li className="ecl-content-block__primary-meta-item ecl-u-type-color-secondary-700">
                      Organization name: {provider?.name ?? "—"}
                    </li>
                    <li className="ecl-content-block__primary-meta-item ecl-u-type-color-secondary-700">
                      Sector: {provider?.sector?.label ?? "—"}
                    </li>
                    <li className="ecl-content-block__primary-meta-item ecl-u-type-color-secondary-700">
                      Funding type: {cs.funding_type?.label ?? "—"}
                    </li>
                  </ul>

                  {(() => {
                    const locations = compactLocations(cs.addresses);

                    return (
                      <>
                        <div className="ecl-u-type-heading-3 ecl-u-type-color-primary-950 font-bold! ecl-u-mt-xs line-clamp-2">
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
                                      title={
                                        iso2CountryName(l.iso2) ?? undefined
                                      }
                                    />
                                  )}
                                  <span>{l.city}</span>
                                  {i < locations.length - 1 ? " • " : ""}
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  <div className="ecl-content-block__description line-clamp-3">
                    <strong>Description:</strong> {cs.short_description}
                  </div>
                </div>

                <div className="min-[1140px]:pl-6 ecl-u-d-flex ecl-u-flex-column">
                  <span className="ecl-u-type-heading-4 ecl-u-type-color-primary-950 underline ecl-u-mb-xs ecl-u-d-block">
                    Benefits
                  </span>

                  <dl className="ecl-description-list ecl-u-bg-grey-25 ecl-u-pa-s">
                    <dd className="ecl-description-list__definition">
                      <ul className="ecl-u-mv-none ecl-u-pl-none">
                        <li className="ecl-u-mb-xs">
                          <strong>Environmental:</strong>{" "}
                          {benefit(cs, "ENVIRONMENTAL")}
                        </li>
                        <li className="ecl-u-mb-xs">
                          <strong>Economic:</strong> {benefit(cs, "ECONOMIC")}
                        </li>
                        <li>
                          <strong>Social:</strong> {benefit(cs, "SOCIAL")}
                        </li>
                      </ul>
                    </dd>
                  </dl>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
