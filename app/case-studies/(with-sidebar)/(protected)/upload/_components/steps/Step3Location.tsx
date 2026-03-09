"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWizardData } from "../../_context/WizardDataContext";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useCombobox, autocomplete } from "@szhsin/react-autocomplete";

type CountryItem = { code: string; label: string; iso3?: string };
type CityItem = { id: number; name: string; countryCode: string };

type AddressRowState = {
  id: string;
  countryLabel: string;
  cityLabel: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function AddressRow({
  row,
  index,
  countries,
  countriesLoading,
  onChange,
  onRemove,
  disableRemove,
  loadCitiesForCountry,
}: {
  row: AddressRowState;
  index: number;
  countries: CountryItem[];
  countriesLoading: boolean;
  onChange: (patch: Partial<AddressRowState>) => void;
  onRemove: () => void;
  disableRemove: boolean;
  loadCitiesForCountry: (iso2: string) => Promise<CityItem[]>;
}) {
  const [cities, setCities] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const countrySelected = useMemo(() => {
    return countries.find(
      (c) => normalize(c.label) === normalize(row.countryLabel),
    );
  }, [countries, row.countryLabel]);

  const countryLabelSet = useMemo(
    () => new Set(countries.map((c) => normalize(c.label))),
    [countries],
  );

  const hasValidCountry = countryLabelSet.has(normalize(row.countryLabel));

  useEffect(() => {
    const iso2 = countrySelected?.code;
    if (!iso2) {
      setCities([]);
      return;
    }

    let alive = true;
    (async () => {
      setCitiesLoading(true);
      try {
        const next = await loadCitiesForCountry(iso2);
        if (!alive) return;
        setCities(next);
      } finally {
        if (alive) setCitiesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [countrySelected?.code, loadCitiesForCountry]);

  const filteredCountries = useMemo(() => {
    const v = normalize(row.countryLabel);
    if (!v) return countries;
    return countries.filter((c) => normalize(c.label).startsWith(v));
  }, [countries, row.countryLabel]);

  const filteredCities = useMemo(() => {
    const v = normalize(row.cityLabel);
    if (!v) return cities;
    return cities.filter((c) => normalize(c.name).startsWith(v));
  }, [cities, row.cityLabel]);

  const {
    getInputProps,
    getListProps,
    getItemProps,
    getToggleProps,
    getClearProps,
    open,
    focusIndex,
    isInputEmpty,
  } = useCombobox({
    items: filteredCountries,
    getItemValue: (item: CountryItem) => item.label,
    isEqual: (a?: CountryItem, b?: CountryItem) => a?.code === b?.code,
    value: row.countryLabel,
    selected: countrySelected,
    onChange: (v = "") => {
      onChange({ countryLabel: v, cityLabel: "" });
    },
    onSelectChange: (item?: CountryItem) => {
      onChange({ countryLabel: item?.label ?? "", cityLabel: "" });
    },
    feature: autocomplete({ select: false, closeOnSelect: true }),
  });

  const {
    getInputProps: getCityInputProps,
    getListProps: getCityListProps,
    getItemProps: getCityItemProps,
    getToggleProps: getCityToggleProps,
    getClearProps: getCityClearProps,
    open: cityOpen,
    focusIndex: cityFocusIndex,
    isInputEmpty: isCityInputEmpty,
  } = useCombobox({
    items: filteredCities,
    getItemValue: (item: CityItem) => item.name,
    isEqual: (a?: CityItem, b?: CityItem) =>
      normalize(a?.name ?? "") === normalize(b?.name ?? ""),
    value: row.cityLabel,
    selected: undefined,
    onChange: (v = "") => onChange({ cityLabel: v }),
    onSelectChange: (item?: CityItem) =>
      onChange({ cityLabel: item?.name ?? "" }),
    feature: autocomplete({ select: false, closeOnSelect: true }),
  });

  const countryClearProps = getClearProps();
  const cityClearProps = getCityClearProps();

  const hasCountryValue = isInputEmpty === false;
  const hasCityValue = isCityInputEmpty === false;

  return (
    <div className="ecl-u-border-all ecl-u-border-color-grey-50 ecl-u-pa-m rounded-lg">
      <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between ecl-u-mb-m">
        <div className="ecl-u-type-heading-5">Location {index + 1}</div>

        <button
          type="button"
          className="ecl-button ecl-button--tertiary"
          onClick={onRemove}
          disabled={disableRemove}
          aria-label="Remove location"
          title={
            disableRemove
              ? "At least one location is required"
              : "Remove location"
          }
        >
          <span className="ecl-button__container">
            <span className="ecl-button__label">Remove</span>
            <ClientIcon className="wt-icon-ecl--trash ecl-icon ecl-icon--s ecl-u-ml-xs" />
          </span>
        </button>
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor={`cs-country-${row.id}`}>
          Country{" "}
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>

        <div className="relative">
          <input
            {...getInputProps()}
            id={`cs-country-${row.id}`}
            autoComplete="new-password"
            spellCheck={false}
            required
            disabled={countriesLoading}
            className="ecl-text-input ecl-u-width-100 pr-10"
          />

          {hasCountryValue ? (
            <button
              type="button"
              aria-label="Clear country"
              {...countryClearProps}
              onClick={(e) => {
                countryClearProps.onClick?.(e);
                onChange({ countryLabel: "", cityLabel: "" });
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 ecl-u-pa-none ecl-u-d-flex ecl-u-align-items-center leading-none"
            >
              <ClientIcon className="wt-icon-close wt-icon--s" />
            </button>
          ) : null}

          <button
            type="button"
            aria-label="Toggle country list"
            {...getToggleProps()}
            className="ecl-select__icon ecl-u-bg-transparent"
          >
            <ClientIcon className="wt-icon-corner-arrow-down wt-icon--s" />
          </button>

          <ul
            {...getListProps()}
            className={[
              open ? "ecl-u-d-block" : "ecl-u-d-none",
              "absolute left-0 right-0 z-20 ecl-u-bg-white",
              "ecl-u-border-all ecl-u-border-width-1 ecl-u-border-style-solid ecl-u-border-color-black",
              "ecl-u-ma-none ecl-u-pa-none ecl-u-mt-2xs max-h-64 overflow-auto",
            ].join(" ")}
          >
            {filteredCountries.length ? (
              filteredCountries.map((item, index) => (
                <li
                  key={item.code}
                  {...getItemProps({ item, index })}
                  className={[
                    "ecl-u-ph-s ecl-u-pv-xs",
                    focusIndex === index
                      ? "bg-[#0078D7] ecl-u-type-color-white"
                      : "ecl-u-bg-white ecl-u-type-color-black",
                  ].join(" ")}
                >
                  {item.label}
                </li>
              ))
            ) : (
              <li className="ecl-u-ph-s ecl-u-pv-xs ecl-u-type-color-black">
                No results
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="ecl-form-group">
        <label className="ecl-form-label" htmlFor={`cs-city-${row.id}`}>
          City / Region{" "}
          <span className="ecl-form-label__optional">(optional)</span>
        </label>

        <div className="relative">
          <input
            {...getCityInputProps()}
            id={`cs-city-${row.id}`}
            autoComplete="new-password"
            spellCheck={false}
            disabled={!hasValidCountry || citiesLoading}
            className="ecl-text-input ecl-u-width-100 pr-10"
          />

          {hasCityValue ? (
            <button
              type="button"
              aria-label="Clear city"
              {...cityClearProps}
              onClick={(e) => {
                cityClearProps.onClick?.(e);
                onChange({ cityLabel: "" });
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 ecl-u-pa-none ecl-u-d-flex ecl-u-align-items-center leading-none"
            >
              <ClientIcon className="wt-icon-close wt-icon--s" />
            </button>
          ) : null}

          <button
            type="button"
            aria-label="Toggle city list"
            {...getCityToggleProps()}
            className="ecl-select__icon ecl-u-bg-transparent"
            disabled={!hasValidCountry || citiesLoading}
          >
            <ClientIcon className="wt-icon-corner-arrow-down wt-icon--s" />
          </button>

          <ul
            {...getCityListProps()}
            className={[
              cityOpen ? "ecl-u-d-block" : "ecl-u-d-none",
              "absolute left-0 right-0 z-20 ecl-u-bg-white",
              "ecl-u-border-all ecl-u-border-width-1 ecl-u-border-style-solid ecl-u-border-color-black",
              "ecl-u-ma-none ecl-u-pa-none ecl-u-mt-2xs max-h-64 overflow-auto",
            ].join(" ")}
          >
            {citiesLoading ? (
              <li className="ecl-u-ph-s ecl-u-pv-xs ecl-u-type-color-black">
                Loading…
              </li>
            ) : filteredCities.length ? (
              filteredCities.map((item, index) => (
                <li
                  key={item.id}
                  {...getCityItemProps({ item, index })}
                  className={[
                    "ecl-u-ph-s ecl-u-pv-xs",
                    cityFocusIndex === index
                      ? "bg-[#0078D7] ecl-u-type-color-white"
                      : "ecl-u-bg-white ecl-u-type-color-black",
                  ].join(" ")}
                >
                  {item.name}
                </li>
              ))
            ) : (
              <li className="ecl-u-ph-s ecl-u-pv-xs ecl-u-type-color-black">
                No results
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Step3Location() {
  const { data, setMetadata, editDataLoadedAt } = useWizardData();
  const lastSyncedEditRef = useRef(0);

  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const idCounter = useRef(2);
  const [rows, setRows] = useState<AddressRowState[]>([
    { id: "addr-1", countryLabel: "", cityLabel: "" },
  ]);

  useEffect(() => {
    const existing = (data.metadata.addresses ?? []) as Array<{
      admin_unit_l1?: string;
      post_name?: string;
    }>;

    if (!existing.length) return;
    setRows(
      existing.map((a, idx) => ({
        id: `addr-${idx + 1}`,
        countryLabel: (a.admin_unit_l1 ?? "").toUpperCase(),
        cityLabel: a.post_name ?? "",
      })),
    );
    idCounter.current = existing.length + 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editDataLoadedAt <= 0 || editDataLoadedAt === lastSyncedEditRef.current)
      return;
    const existing = (data.metadata.addresses ?? []) as Array<{
      admin_unit_l1?: string;
      post_name?: string;
    }>;
    lastSyncedEditRef.current = editDataLoadedAt;
    if (existing.length > 0) {
      setRows(
        existing.map((a, idx) => ({
          id: `addr-${idx + 1}`,
          countryLabel: (a.admin_unit_l1 ?? "").toUpperCase(),
          cityLabel: a.post_name ?? "",
        })),
      );
      idCounter.current = existing.length + 1;
    }
  }, [editDataLoadedAt, data.metadata.addresses]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setCountriesLoading(true);
      try {
        const res = await fetch("/api/geo/countries");
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { countries: CountryItem[] };
        if (!alive) return;
        setCountries(json.countries ?? []);
      } catch {
        if (alive) setCountries([]);
      } finally {
        if (alive) setCountriesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // On edit: backend may send admin_unit_l1 as ISO2 (e.g. SE, HR) or ISO3 (e.g. CRO).
  // Resolve code → full name for display. Run when countries or rows change so we
  // resolve after edit data has set rows to codes (e.g. "SE") and countries have loaded.
  useEffect(() => {
    if (!countries.length) return;

    setRows((prev) => {
      const next = prev.map((r) => {
        const value = r.countryLabel.trim().toUpperCase();
        // Only treat as a code when it looks like one (2 or 3 letters), so we don't overwrite user typing a name
        if (!value || (value.length !== 2 && value.length !== 3)) return r;
        const matchByIso2 = countries.find((c) => c.code === value);
        const matchByIso3 = countries.find((c) => c.iso3 === value);
        const match = matchByIso2 ?? matchByIso3;
        if (!match) return r;
        return { ...r, countryLabel: match.label };
      });
      const changed = next.some((n, i) => n.countryLabel !== prev[i].countryLabel);
      return changed ? next : prev;
    });
  }, [countries, rows]);

  const citiesCache = useRef(new Map<string, CityItem[]>());

  const loadCitiesForCountry = async (iso2: string) => {
    const key = iso2.toUpperCase();
    const cached = citiesCache.current.get(key);
    if (cached) return cached;

    const res = await fetch(
      `/api/geo/cities?country=${encodeURIComponent(key)}`,
    );
    if (!res.ok) return [];

    const json = (await res.json()) as { cities: CityItem[] };
    const next = (json.cities ?? []).filter(
      (c): c is CityItem =>
        !!c && typeof c.name === "string" && typeof c.countryCode === "string",
    );
    citiesCache.current.set(key, next);
    return next;
  };

  // We save admin_unit_l1 as ISO2 (2-letter code); backend may store or return ISO2 or ISO3.
  useEffect(() => {
    const toIso2 = (labelOrIso2: string) => {
      const v = labelOrIso2.trim();
      if (!v) return "";
      const match = countries.find((c) => normalize(c.label) === normalize(v));
      if (match) return match.code.toUpperCase(); // save ISO2
      if (v.length === 2) return v.toUpperCase();
      return "";
    };

    setMetadata({
      addresses: rows.map((r) => ({
        admin_unit_l1: toIso2(r.countryLabel),
        post_name: r.cityLabel.trim(),
      })),
    });
  }, [rows, countries, setMetadata]);

  const addRow = () => {
    const id = `addr-${idCounter.current++}`;
    setRows((p) => [...p, { id, countryLabel: "", cityLabel: "" }]);
  };

  const removeRow = (id: string) => {
    setRows((p) => (p.length === 1 ? p : p.filter((r) => r.id !== id)));
  };

  const updateRow = (id: string, patch: Partial<AddressRowState>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Location</h2>
      <p className="ecl-u-type-paragraph ecl-u-mb-l">
        Specify one or more geographical locations relevant to this case study.
      </p>

      <div className="space-y-6 w-full max-w-2xl lg:max-w-4xl">
        {rows.map((row, index) => (
          <AddressRow
            key={row.id}
            index={index}
            row={row}
            countries={countries}
            countriesLoading={countriesLoading}
            loadCitiesForCountry={loadCitiesForCountry}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
            disableRemove={rows.length === 1}
          />
        ))}

        <div className="ecl-u-mt-l">
          <button
            type="button"
            className="ecl-button ecl-button--primary"
            onClick={addRow}
          >
            + Add Location
          </button>
        </div>
      </div>
    </>
  );
}
