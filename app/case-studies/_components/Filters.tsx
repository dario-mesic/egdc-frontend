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
      "fieldset.ecl-select__multiple-group"
    )
  );

  groups.forEach((fs) => {
    const legend = fs.querySelector<HTMLLegendElement>(
      "legend.ecl-select__multiple-group__title"
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
        "fieldset.ecl-select__multiple-group"
      ) as HTMLFieldSetElement | null;
      if (!fs) return;

      const nowCollapsed = fs.classList.toggle("is-collapsed");
      legend.setAttribute("aria-expanded", String(!nowCollapsed));
    };

    dropdownEl.addEventListener("click", (e) => {
      const legend = (e.target as HTMLElement).closest(
        "legend.ecl-select__multiple-group__title"
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
        "legend.ecl-select__multiple-group__title"
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

  const facetSets = useMemo(() => {
    const toSet = (arr: { code: string }[]) =>
      new Set(arr.map((x) => x.code.toLowerCase()));

    return {
      sector: toSet(facets.sectors),
      tech_code: toSet(facets.technologies),
      funding_type_code: toSet(facets.funding_types),
      calc_type_code: toSet(facets.calculation_types),
      country: toSet(facets.countries),
      organization_types: toSet(facets.organization_types),
      benefit_units: toSet(facets.benefit_units),
      benefit_types: toSet(facets.benefit_types),
    };
  }, [facets]);

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
        string | undefined
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
          <optgroup label="Sectors">
            {referenceData.sectors.map((o) => {
              const enabled = facetSets.sector.has(o.code.toLowerCase());
              return (
                <option
                  key={o.code}
                  value={`sector:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Technologies">
            {referenceData.technologies.map((o) => {
              const enabled = facetSets.tech_code.has(o.code.toLowerCase());
              return (
                <option
                  key={o.code}
                  value={`tech_code:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Funding types">
            {referenceData.funding_types.map((o) => {
              const enabled = facetSets.funding_type_code.has(
                o.code.toLowerCase()
              );
              return (
                <option
                  key={o.code}
                  value={`funding_type_code:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Calculation types">
            {referenceData.calculation_types.map((o) => {
              const enabled = facetSets.calc_type_code.has(
                o.code.toLowerCase()
              );
              return (
                <option
                  key={o.code}
                  value={`calc_type_code:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Organisation types">
            {referenceData.organization_types.map((o) => {
              const enabled = facetSets.organization_types.has(
                o.code.toLowerCase()
              );
              return (
                <option
                  key={o.code}
                  value={`organization_types:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Benefit types">
            {referenceData.benefit_types.map((o) => {
              const enabled = facetSets.benefit_types.has(o.code.toLowerCase());
              return (
                <option
                  key={o.code}
                  value={`benefit_types:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Benefit units">
            {referenceData.benefit_units.map((o) => {
              const enabled = facetSets.benefit_units.has(o.code.toLowerCase());
              return (
                <option
                  key={o.code}
                  value={`benefit_units:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>

          <optgroup label="Countries">
            {referenceData.countries.map((o) => {
              const enabled = facetSets.country.has(o.code.toLowerCase());
              return (
                <option
                  key={o.code}
                  value={`country:${o.code}`}
                  disabled={!enabled}
                >
                  {o.label}
                </option>
              );
            })}
          </optgroup>
        </select>
      </div>
    </div>
  );
}
