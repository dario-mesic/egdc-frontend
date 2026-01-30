"use client";

import { useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReferenceData } from "../_types/referenceData";
import type { SearchFacets } from "../_types/facets";

const FILTER_KEYS = [
  "sector",
  "tech_code",
  "funding_type_code",
  "calc_type_code",
  "country",
  "organization_types",
  "benefit_units",
  "benefit_types",
] as const;

type FilterKey = (typeof FILTER_KEYS)[number];
function initCollapsibleGroups(dropdownEl: HTMLElement) {
  const groups = Array.from(
    dropdownEl.querySelectorAll<HTMLFieldSetElement>(
      "fieldset.ecl-select__multiple-group",
    ),
  );

  groups.forEach((fs) => {
    const legend = fs.querySelector<HTMLLegendElement>(
      "legend.ecl-select__multiple-group__title",
    );
    if (!legend) return;

    if (legend.dataset.collapsibleLegend !== "1") {
      legend.dataset.collapsibleLegend = "1";
      legend.classList.add("ecl-select__multiple-group__toggle");
      legend.setAttribute("role", "button");
      legend.setAttribute("tabindex", "0");
    }

    const expanded = !fs.classList.contains("is-collapsed");
    legend.setAttribute("aria-expanded", String(expanded));
  });

  if (dropdownEl.dataset.collapsibleDelegation !== "1") {
    dropdownEl.dataset.collapsibleDelegation = "1";

    const toggle = (legend: HTMLLegendElement) => {
      const fs = legend.closest(
        "fieldset.ecl-select__multiple-group",
      ) as HTMLFieldSetElement | null;
      if (!fs) return;

      const nowCollapsed = fs.classList.toggle("is-collapsed");
      legend.setAttribute("aria-expanded", String(!nowCollapsed));
    };

    dropdownEl.addEventListener("click", (e) => {
      const legend = (e.target as HTMLElement).closest(
        "legend.ecl-select__multiple-group__title",
      ) as HTMLLegendElement | null;

      if (!legend) return;
      if (legend.dataset.collapsibleLegend !== "1") return;

      e.preventDefault();
      toggle(legend);
    });

    dropdownEl.addEventListener("keydown", (e) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== "Enter" && ke.key !== " ") return;

      const legend = (e.target as HTMLElement).closest(
        "legend.ecl-select__multiple-group__title",
      ) as HTMLLegendElement | null;

      if (!legend) return;
      if (legend.dataset.collapsibleLegend !== "1") return;

      ke.preventDefault();
      toggle(legend);
    });
  }

  if (dropdownEl.dataset.collapsibleObserver !== "1") {
    dropdownEl.dataset.collapsibleObserver = "1";

    const obs = new MutationObserver(() => {
      initCollapsibleGroups(dropdownEl);
    });

    obs.observe(dropdownEl, { childList: true, subtree: true });
  }
}

export default function Filters({
  referenceData,
  facets,
}: {
  referenceData: ReferenceData;
  facets: SearchFacets;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const selectRef = useRef<HTMLSelectElement | null>(null);

  const facetMaps = useMemo(() => {
    const toMap = (arr: { code: string; count: number }[]) =>
      new Map(arr.map((x) => [x.code.toLowerCase(), x.count]));

    return {
      sector: toMap(facets.sectors),
      tech_code: toMap(facets.technologies),
      funding_type_code: toMap(facets.funding_types),
      calc_type_code: toMap(facets.calculation_types),
      country: toMap(facets.countries),
      organization_types: toMap(facets.organization_types),
      benefit_units: toMap(facets.benefit_units),
      benefit_types: toMap(facets.benefit_types),
    };
  }, [facets]);

  const optGroups = [
    {
      key: "benefit_types",
      label: "Benefit types",
      items: referenceData.benefit_types,
      facetMap: facetMaps.benefit_types,
    },
    {
      key: "benefit_units",
      label: "Benefit units",
      items: referenceData.benefit_units,
      facetMap: facetMaps.benefit_units,
    },
    {
      key: "calc_type_code",
      label: "Calculation types",
      items: referenceData.calculation_types,
      facetMap: facetMaps.calc_type_code,
    },
    {
      key: "country",
      label: "Countries",
      items: referenceData.countries,
      facetMap: facetMaps.country,
    },
    {
      key: "funding_type_code",
      label: "Funding types",
      items: referenceData.funding_types,
      facetMap: facetMaps.funding_type_code,
    },
    {
      key: "organization_types",
      label: "Organization types",
      items: referenceData.organization_types,
      facetMap: facetMaps.organization_types,
    },
    {
      key: "sector",
      label: "Sectors",
      items: referenceData.sectors,
      facetMap: facetMaps.sector,
    },
    {
      key: "tech_code",
      label: "Technologies",
      items: referenceData.technologies,
      facetMap: facetMaps.tech_code,
    },
  ].sort((a, b) => a.label.localeCompare(b.label));
  const defaultValue = useMemo(() => {
    const values: string[] = [];
    FILTER_KEYS.forEach((key) => {
      sp.getAll(key).forEach((v) => values.push(`${key}:${v}`));
    });
    return values;
  }, [sp]);

  const applyToUrl = () => {
    const el = selectRef.current;
    if (!el) return;

    const params = new URLSearchParams(sp.toString());

    FILTER_KEYS.forEach((k) => params.delete(k));

    params.delete("page");

    Array.from(el.selectedOptions).forEach((opt) => {
      const [key, value] = opt.value.split(":") as [
        FilterKey | undefined,
        string | undefined,
      ];
      if (!key || !value) return;
      params.append(key, value);
    });

    router.push(`?${params.toString()}`);
  };
  useEffect(() => {
    const selectId = "select-multiple";
    const dropdownId = `${selectId}-dropdown`;

    const tryInit = () => {
      const dropdown = document.getElementById(dropdownId);
      if (dropdown) initCollapsibleGroups(dropdown);
      return Boolean(dropdown);
    };

    const run = () => {
      let tries = 0;
      const tick = () => {
        tries += 1;
        if (tryInit()) return;
        if (tries < 20) requestAnimationFrame(tick);
      };
      tick();
    };

    run();

    window.addEventListener("ecl:autoinit", run);
    return () => window.removeEventListener("ecl:autoinit", run);
  }, []);
  return (
    <div className="ecl-form-group ecl-u-mt-m ecl-u-mt-xl-none">
      <label htmlFor="select-multiple" className="ecl-form-label">
        Filters
      </label>

      <div className="ecl-select__container ecl-select__container--m ecl-js-gated">
        <select
          ref={selectRef}
          className="ecl-select"
          id="select-multiple"
          multiple
          defaultValue={defaultValue}
          onChange={applyToUrl}
          data-ecl-auto-init="Select"
          data-ecl-select-multiple=""
          data-ecl-select-close="Apply"
          data-ecl-select-default="Choose..."
          data-ecl-select-clear-all="Clear all"
          data-ecl-select-all="Select all"
          data-ecl-select-search="Enter filter keyword"
          data-ecl-select-no-results="No results found"
        >
          {optGroups.map((group) => (
            <optgroup key={group.key} label={group.label}>
              {group.items.map((o) => {
                const count = group.facetMap.get(o.code.toLowerCase()) ?? 0;
                const enabled = count > 0;

                return (
                  <option
                    key={o.code}
                    value={`${group.key}:${o.code}`}
                    disabled={!enabled}
                  >
                    {o.label} ({count})
                  </option>
                );
              })}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
}
