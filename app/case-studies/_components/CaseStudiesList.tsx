import Image from "next/image";
import type { CaseStudy } from "../_types/caseStudy";
import { compactLocations } from "../_lib/locations";
import { iso2CountryName } from "../_lib/iso";
import ClientIcon from "../_components/icons/ClientIcon";
import CaseStudyCardLink from "./CaseStudyCardLink";
import ViewTransition from "./ViewTransition";
import Flag from "react-world-flags";

type CaseStudyiesListProps = Readonly<{
  caseStudies: CaseStudy[];
}>;

function formatValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function benefit(cs: CaseStudy, code: string) {
  const matches = (cs.benefits ?? [])
    .filter((x) => x.type?.code?.toLowerCase() === code.toLowerCase())
    .sort((a, b) => {
      const aN = a.is_net_carbon_impact ? 1 : 0;
      const bN = b.is_net_carbon_impact ? 1 : 0;
      return bN - aN;
    });

  const b = matches[0];
  if (!b) return null;

  return {
    data: {
      value: formatValue(b.value),
      unit: (b.unit?.label ?? "").toLowerCase(),
      functionalUnit: b.functional_unit ?? "",
      name: b.name ?? "",
    },
    extraCount: Math.max(0, matches.length - 1),
  };
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
      {caseStudies.map((cs, index) => {
        const provider = cs.is_provided_by?.[0] ?? null;
        const logoUrl = normalizeUrl(cs.logo?.url);

        const benefitsList = [
          { label: "Environmental", r: benefit(cs, "ENVIRONMENTAL") },
          { label: "Economic", r: benefit(cs, "ECONOMIC") },
          { label: "Social", r: benefit(cs, "SOCIAL") },
        ].filter(
          (
            b,
          ): b is {
            label: string;
            r: NonNullable<ReturnType<typeof benefit>>;
          } => !!b.r,
        );
        return (
          <ViewTransition
            key={cs.id}
            index={index}
            rootId="case-studies-scroll"
          >
            <CaseStudyCardLink
              key={cs.id}
              href={`/case-studies/${cs.id}`}
              prefetch={false}
              className="ecl-u-display-block ecl-u-text-decoration-none"
            >
              <article
                className="ecl-content-item ecl-u-mb-l ecl-u-pa-m ecl-u-bg-primary-300 ecl-u-border-all ecl-u-border-width-2 ecl-u-border-color-primary   transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                will-change-transform
                hover:bg-(--ecl-color-primary-400)!
                hover:-translate-y-1 hover:shadow-xl
                focus-within:-translate-y-1  focus-within:shadow-xl
                focus-within:bg-(--ecl-color-primary-400)!
                cursor-pointer"
              >
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
                      {cs.funding_type?.label && (
                        <li className="ecl-content-block__primary-meta-item ecl-u-type-color-secondary-700">
                          Funding type: {cs.funding_type.label}
                        </li>
                      )}
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
                      {benefitsList.length > 0 && (
                        <dd className="ecl-description-list__definition">
                          <ul className="ecl-u-mv-none ecl-u-pl-none">
                            {benefitsList.map((b, index) => (
                              <li
                                key={b.label}
                                className={
                                  benefitsList.length > 1 &&
                                  index !== benefitsList.length - 1
                                    ? "ecl-u-mb-xs"
                                    : ""
                                }
                              >
                                <span className="font-semibold">
                                  {b.label}:
                                </span>{" "}
                                {b.r.data.name ? (
                                  <span className="ecl-u-type-italic ecl-u-type-color-secondary-700">
                                    {b.r.data.name} -
                                  </span>
                                ) : null}
                                <span className="font-bold ecl-u-type-color-primary-950">
                                  {" "}
                                  {b.r.data.value} {b.r.data.unit}
                                </span>
                                {b.r.data.functionalUnit ? (
                                  <span> {b.r.data.functionalUnit}</span>
                                ) : null}
                                {b.r.extraCount > 0 ? (
                                  <span className="font-bold">
                                    {" "}
                                    ( + {b.r.extraCount} )
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      )}
                    </dl>
                  </div>
                </div>
              </article>
            </CaseStudyCardLink>
          </ViewTransition>
        );
      })}
    </div>
  );
}
