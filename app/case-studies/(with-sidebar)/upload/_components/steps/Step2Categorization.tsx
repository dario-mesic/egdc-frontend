"use client";

import { useEffect, useMemo, useState } from "react";
import { useReferenceData } from "../../_context/ReferenceDataContext";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useWizardData } from "../../_context/WizardDataContext";

type FormState = {
  technology: string;
  calculationType: string;
  fundingType: string;
};

export default function Step2Categorization() {
  const { technologies, calculation_types, funding_types } = useReferenceData();
  const { data, setMetadata } = useWizardData();

  const [form, setForm] = useState<FormState>({
    technology: "",
    calculationType: "",
    fundingType: "",
  });

  const [touched, setTouched] = useState({
    technology: false,
    calculationType: false,
  });

  useEffect(() => {
    setForm({
      technology: (data.metadata.tech_code as string) ?? "",
      calculationType: (data.metadata.calc_type_code as string) ?? "",
      fundingType: (data.metadata.funding_type_code as string) ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ECL?.autoInit) {
      (window as any).ECL.autoInit();
    }
  }, []);

  const techOptions = useMemo(
    () => [...technologies].sort((a, b) => a.label.localeCompare(b.label)),
    [technologies]
  );
  const calcOptions = useMemo(
    () => [...calculation_types].sort((a, b) => a.label.localeCompare(b.label)),
    [calculation_types]
  );
  const fundingOptions = useMemo(
    () => [...funding_types].sort((a, b) => a.label.localeCompare(b.label)),
    [funding_types]
  );

  const techError =
    touched.technology && !form.technology ? "Technology is required." : null;

  const calcError =
    touched.calculationType && !form.calculationType
      ? "Calculation type is required."
      : null;

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Categorization</h2>

      <div className="ecl-form-group ecl-u-mb-m">
        <label
          htmlFor="cs-technology"
          id="cs-technology-label"
          className="ecl-form-label"
        >
          Technology
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>

        <div className="ecl-select__container ecl-select__container--m">
          <select
            id="cs-technology"
            className="ecl-select"
            value={form.technology}
            onChange={(e) => {
              const v = e.target.value;
              setForm((p) => ({ ...p, technology: v }));
              setMetadata({ tech_code: v });
            }}
            onBlur={() => setTouched((p) => ({ ...p, technology: true }))}
            aria-describedby="cs-technology-helper"
            required
            data-ecl-auto-init="Select"
          >
            <option value="" disabled>
              Select a technology...
            </option>
            {techOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="ecl-select__icon">
            <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
          </div>
        </div>
        {techError ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {techError}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label
          htmlFor="cs-calculation"
          id="cs-calculation-label"
          className="ecl-form-label"
        >
          Calculation type
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>

        <div className="ecl-select__container ecl-select__container--m">
          <select
            id="cs-calculation"
            className="ecl-select"
            value={form.calculationType}
            onChange={(e) => {
              const v = e.target.value;
              setForm((p) => ({ ...p, calculationType: v }));
              setMetadata({ calc_type_code: v });
            }}
            onBlur={() => setTouched((p) => ({ ...p, calculationType: true }))}
            aria-describedby="cs-calculation-helper"
            required
            data-ecl-auto-init="Select"
          >
            <option value="" disabled>
              Select a calculation type...
            </option>
            {calcOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="ecl-select__icon">
            <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
          </div>
        </div>
        {calcError ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {calcError}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label htmlFor="cs-funding" className="ecl-form-label">
          Funding type
        </label>

        <div className="ecl-select__container ecl-select__container--m">
          <select
            id="cs-funding"
            className="ecl-select"
            value={form.fundingType}
            onChange={(e) => {
              const v = e.target.value;
              setForm((p) => ({ ...p, fundingType: v }));
              setMetadata({ funding_type_code: v || null });
            }}
            data-ecl-auto-init="Select"
          >
            <option disabled>Select a funding type...</option>
            <option value="">-</option>
            {fundingOptions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="ecl-select__icon">
            <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
          </div>
        </div>
      </div>
    </>
  );
}
