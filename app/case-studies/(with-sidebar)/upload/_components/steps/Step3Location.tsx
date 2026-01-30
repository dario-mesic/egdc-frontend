"use client";

import { useEffect, useMemo, useState } from "react";
import { useWizardData } from "../../_context/WizardDataContext";

type FormState = {
  country: string;
  cityRegion: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export default function Step3Location() {
  const { data, setMetadata } = useWizardData();

  const [form, setForm] = useState<FormState>({
    country: "",
    cityRegion: "",
  });

  useEffect(() => {
    const first = (data.metadata.addresses as any)?.[0];
    if (first) {
      setForm({
        country: first.admin_unit_l1 ?? "",
        cityRegion: first.post_name ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const syncAddresses = (next: Partial<FormState>) => {
    const country = (next.country ?? form.country).trim();
    const cityRegion = (next.cityRegion ?? form.cityRegion).trim();

    setMetadata({
      addresses: [
        {
          admin_unit_l1: country,
          post_name: cityRegion || "",
        },
      ],
    });
  };

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Location</h2>
      <p className="ecl-u-type-paragraph ecl-u-mb-l">
        Specify the geographical location relevant to this case study.
      </p>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-country">
          Country <span className="ecl-u-type-color-error">*</span>
        </label>
        <input
          id="cs-country"
          className="ecl-text-input ecl-u-width-100"
          value={form.country}
          required
          onChange={(e) => {
            const v = e.target.value;
            set("country", v);
            syncAddresses({ country: v });
          }}
          onBlur={() => touch("country")}
        />
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
        <input
          id="cs-city-region"
          className="ecl-text-input ecl-u-width-100"
          value={form.cityRegion}
          onChange={(e) => {
            const v = e.target.value;
            set("cityRegion", v);
            syncAddresses({ cityRegion: v });
          }}
          onBlur={() => touch("cityRegion")}
        />
      </div>
    </>
  );
}
