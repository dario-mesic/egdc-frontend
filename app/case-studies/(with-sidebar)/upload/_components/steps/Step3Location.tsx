"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizardData } from "../../_context/WizardDataContext";
import { useReferenceData } from "../../_context/ReferenceDataContext";
import { useCombobox, autocomplete } from "@szhsin/react-autocomplete";

import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { iso3ToIso2 } from "@/app/case-studies/_lib/iso";

type FormState = {
  country: string;
  cityRegion: string;
};

type CountryItem = { code: string; label: string };
type CityItem = {
  id: number;
  name: string;
  countryCode: string;
  stateCode?: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function Step3Location() {
  const { countries } = useReferenceData();
  const { data, setMetadata } = useWizardData();
  const [form, setForm] = useState<FormState>({
    country: "",
    cityRegion: "",
  });

  useEffect(() => {
    const first = (data.metadata.addresses as any)?.[0];
    if (first) {
      const match = countries?.find(
        (c: CountryItem) => c.code === first.admin_unit_l1,
      );

      setForm({
        country: match?.label ?? "",
        cityRegion: first.post_name ?? "",
      });

      setCountrySelected(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries]);

  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};
    if (!form.country.trim()) e.country = "Country is required.";
    return e;
  }, [form]);

  const showError = (k: keyof FormState) =>
    touched[k] ? errors[k] : undefined;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const touch = (k: keyof FormState) =>
    setTouched((p) => ({ ...p, [k]: true }));

  const syncAddresses = (countryIso3: string, cityRegion: string) => {
    setMetadata({
      addresses: [
        {
          admin_unit_l1: countryIso3.trim(),
          post_name: cityRegion.trim(),
        },
      ],
    });
  };

  const [countrySelected, setCountrySelected] = useState<
    CountryItem | undefined
  >(undefined);

  useEffect(() => {
    const match = countries?.find((c: CountryItem) => c.label === form.country);
    setCountrySelected(match);
  }, [countries, form.country]);

  const filteredCountries: CountryItem[] = useMemo(() => {
    const v = form.country.trim().toLowerCase();
    if (!v) return countries ?? [];
    return (countries ?? []).filter((c: CountryItem) =>
      c.label.toLowerCase().startsWith(v),
    );
  }, [countries, form.country]);

  const countryLabelSet = useMemo(() => {
    return new Set((countries ?? []).map((c) => c.label.trim().toLowerCase()));
  }, [countries]);

  const normalize = (s: string) => s.trim().toLowerCase();

  const findCountryByLabel = (label: string) =>
    (countries ?? []).find(
      (c: CountryItem) => normalize(c.label) === normalize(label),
    );

  const hasValidCountry = useMemo(() => {
    return countryLabelSet.has(normalize(form.country));
  }, [countryLabelSet, form.country]);

  const [cities, setCities] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const findCityByLabel = (label: string) =>
    cities.find(
      (c) => c.name.trim().toLowerCase() === label.trim().toLowerCase(),
    );

  const loadCitiesForCountry = async (iso2: string) => {
    setCitiesLoading(true);
    try {
      const res = await fetch(
        `/api/geo/cities?country=${encodeURIComponent(iso2)}`,
      );
      if (!res.ok) {
        console.error("[cities] API error:", res.status);
        setCities([]);
        return;
      }

      const json = (await res.json()) as { cities: CityItem[] };

      const nextCities: CityItem[] = (json.cities ?? []).filter(
        (c): c is CityItem =>
          !!c &&
          typeof c.name === "string" &&
          typeof c.countryCode === "string",
      );

      setCities(nextCities);
    } catch (e) {
      console.error("[cities] fetch failed:", e);
      setCities([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  const [citySelected, setCitySelected] = useState<CityItem | undefined>(
    undefined,
  );

  useEffect(() => {
    setCitySelected(findCityByLabel(form.cityRegion));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cityRegion, cities]);

  const filteredCities: CityItem[] = useMemo(() => {
    const v = form.cityRegion.trim().toLowerCase();
    if (!v) return cities;
    return cities.filter((c) => c.name.trim().toLowerCase().startsWith(v));
  }, [cities, form.cityRegion]);

  const toIso2CountryCode = (code: string) => {
    const iso2 = iso3ToIso2(code) ?? code;
    return iso2.toUpperCase();
  };

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

    value: form.country,
    onChange: async (v?: string) => {
      const next = v ?? "";
      set("country", next);

      const match = findCountryByLabel(next);

      if (match) {
        set("cityRegion", "");
        setCities([]);
        syncAddresses(match.code, "");

        await loadCitiesForCountry(toIso2CountryCode(match.code));
      } else {
        set("cityRegion", "");
        setCities([]);
        syncAddresses("", "");
      }
    },

    selected: countrySelected,
    onSelectChange: async (item?: CountryItem) => {
      setCountrySelected(item);

      set("country", item?.label ?? "");
      set("cityRegion", "");
      setCitySelected(undefined);
      setCities([]);

      syncAddresses(item?.code ?? "", "");

      if (item?.code) {
        await loadCitiesForCountry(toIso2CountryCode(item.code));
      }
    },

    feature: autocomplete({
      select: false,
      closeOnSelect: true,
    }),
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
      a?.name.trim().toLowerCase() === b?.name.trim().toLowerCase(),

    value: form.cityRegion,
    onChange: (v?: string) => {
      const next = v ?? "";
      set("cityRegion", next);

      const match = findCityByLabel(next);
      syncAddresses(countrySelected?.code ?? "", match ? match.name : "");
    },

    selected: citySelected,
    onSelectChange: (item?: CityItem) => {
      setCitySelected(item);
      set("cityRegion", item?.name ?? "");
      syncAddresses(countrySelected?.code ?? "", item?.name ?? "");
    },

    feature: autocomplete({
      select: false,
      closeOnSelect: true,
    }),
  });

  const countryClearProps = getClearProps();
  const cityClearProps = getCityClearProps();

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Location</h2>
      <p className="ecl-u-type-paragraph ecl-u-mb-l">
        Specify the geographical location relevant to this case study.
      </p>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-country">
          Country <span className="ecl-u-type-color-error">*</span>
        </label>{" "}
        <div className="relative">
          <input
            id="cs-country"
            required
            onBlur={() => touch("country")}
            className="ecl-text-input ecl-u-width-100 pr-10"
            {...getInputProps()}
          />

          {!isInputEmpty ? (
            <button
              type="button"
              aria-label="Clear country"
              {...countryClearProps}
              onClick={(e) => {
                countryClearProps.onClick?.(e);
                setCountrySelected(undefined);
                setCitySelected(undefined);
                setCities([]);
                setForm((p) => ({ ...p, country: "", cityRegion: "" }));
                syncAddresses("", "");
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
              "absolute left-0 right-0 z-20",
              "ecl-u-bg-white",
              "ecl-u-border-all ecl-u-border-width-1 ecl-u-border-style-solid ecl-u-border-color-black",
              "ecl-u-ma-none ecl-u-pa-none",
              "ecl-u-mt-2xs",
              "max-h-64 overflow-auto",
            ].join(" ")}
          >
            {filteredCountries.length ? (
              filteredCountries.map((item, index) => (
                <li
                  key={item.code}
                  {...getItemProps({ item, index })}
                  className={[
                    "ecl-u-ph-s ecl-u-pv-xs",
                    focusIndex === index ? "bg-[#0078D7]" : "ecl-u-bg-white",
                    focusIndex === index
                      ? "ecl-u-type-color-white"
                      : "ecl-u-type-color-black",
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
        {showError("country") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("country")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-city-region">
          City / Region
        </label>
        <div className="relative">
          <input
            id="cs-city-region"
            disabled={!hasValidCountry || citiesLoading}
            onBlur={() => touch("cityRegion")}
            className="ecl-text-input ecl-u-width-100 pr-10"
            {...getCityInputProps()}
          />

          {!isCityInputEmpty ? (
            <button
              type="button"
              aria-label="Clear city"
              {...cityClearProps}
              onClick={(e) => {
                cityClearProps.onClick?.(e);
                setCitySelected(undefined);
                set("cityRegion", "");
                syncAddresses(form.country, "");
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
              "absolute left-0 right-0 z-20",
              "ecl-u-bg-white",
              "ecl-u-border-all ecl-u-border-width-1 ecl-u-border-style-solid ecl-u-border-color-black",
              "ecl-u-ma-none ecl-u-pa-none",
              "ecl-u-mt-2xs",
              "max-h-64 overflow-auto",
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
                      ? "bg-[#0078D7]"
                      : "ecl-u-bg-white",
                    cityFocusIndex === index
                      ? "ecl-u-type-color-white"
                      : "ecl-u-type-color-black",
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
    </>
  );
}
