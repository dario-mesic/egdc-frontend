"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReferenceData } from "../../../../../_context/ReferenceDataContext";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useWizardData } from "../../_context/WizardDataContext";

type FormState = {
  technology: string;
  calculationType: string;
  fundingType: string;
  fundingProgrammeUrl: string;
};

function isValidUrl(v: string) {
  try {
    new URL(v.trim());
    return true;
  } catch {
    return false;
  }
}

function validateFundingProgrammeUrl(
  isPublic: boolean,
  touched: boolean,
  value: string,
): string | null {
  if (!isPublic || !touched) return null;

  const url = value.trim();
  if (!url) {
    return "Funding programme URL is required for public funding.";
  }

  if (!isValidUrl(url)) {
    return "Funding programme URL must be a valid URL.";
  }

  return null;
}

export default function Step2Categorization() {
  const { technologies, calculation_types, funding_types } = useReferenceData();
  const { data, setMetadata, editDataLoadedAt } = useWizardData();
  const lastSyncedEditRef = useRef(0);

  const [form, setForm] = useState<FormState>({
    technology: "",
    calculationType: "",
    fundingType: "",
    fundingProgrammeUrl: "",
  });

  const [touched, setTouched] = useState({
    technology: false,
    calculationType: false,
    fundingProgrammeUrl: false,
  });

  useEffect(() => {
    setForm({
      technology: (data.metadata.tech_code as string) ?? "",
      calculationType: (data.metadata.calc_type_code as string) ?? "",
      fundingType: (data.metadata.funding_type_code as string) ?? "",
      fundingProgrammeUrl:
        (data.metadata.funding_programme_url as string) ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editDataLoadedAt <= 0 || editDataLoadedAt === lastSyncedEditRef.current)
      return;
    lastSyncedEditRef.current = editDataLoadedAt;
    setForm({
      technology: (data.metadata.tech_code as string) ?? "",
      calculationType: (data.metadata.calc_type_code as string) ?? "",
      fundingType: (data.metadata.funding_type_code as string) ?? "",
      fundingProgrammeUrl:
        (data.metadata.funding_programme_url as string) ?? "",
    });
  }, [
    editDataLoadedAt,
    data.metadata.tech_code,
    data.metadata.calc_type_code,
    data.metadata.funding_type_code,
    data.metadata.funding_programme_url,
  ]);


  const techOptions = useMemo(
    () => [...technologies].sort((a, b) => a.label.localeCompare(b.label)),
    [technologies],
  );
  const calcOptions = useMemo(
    () => [...calculation_types].sort((a, b) => a.label.localeCompare(b.label)),
    [calculation_types],
  );
  const fundingOptions = useMemo(
    () => [...funding_types].sort((a, b) => a.label.localeCompare(b.label)),
    [funding_types],
  );

  const techError =
    touched.technology && !form.technology ? "Technology is required." : null;

  const calcError =
    touched.calculationType && !form.calculationType
      ? "Calculation type is required."
      : null;
  const isPublicFunding = (form.fundingType || "").toLowerCase() === "public";

  const fundingProgrammeUrlError = validateFundingProgrammeUrl(
    isPublicFunding,
    touched.fundingProgrammeUrl,
    form.fundingProgrammeUrl,
  );

  useEffect(() => {
    const isPublic = (form.fundingType || "").toLowerCase() === "public";
    if (!isPublic && form.fundingProgrammeUrl) {
      setForm((p) => ({ ...p, fundingProgrammeUrl: "" }));
      setMetadata({ funding_programme_url: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fundingType]);
  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Categorization</h2>
      <div className="w-full max-w-2xl lg:max-w-4xl">
        <div className="ecl-form-group ecl-u-mb-m">
          <label
            htmlFor="cs-technology"
            id="cs-technology-label"
            className="ecl-form-label"
          >
            Technology{" "}
            <span
              className="ecl-form-label__required"
              role="note"
              aria-label="required"
            >
              *
            </span>
          </label>

          <div className="ecl-select__container ecl-select__container--m ecl-u-width-100">
            <select
              id="cs-technology"
              className={[
                "ecl-select ",
                techError ? "ecl-u-border-color-error" : "",
              ].join(" ")}
              value={form.technology}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, technology: v }));
                setMetadata({ tech_code: v });
              }}
              onBlur={() => setTouched((p) => ({ ...p, technology: true }))}
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
              <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
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
            Calculation type{" "}
            <span
              className="ecl-form-label__required"
              role="note"
              aria-label="required"
            >
              *
            </span>
          </label>

          <div className="ecl-select__container ecl-select__container--m ecl-u-width-100">
            <select
              id="cs-calculation"
              className={[
                "ecl-select",
                calcError ? "ecl-u-border-color-error" : "",
              ].join(" ")}
              value={form.calculationType}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, calculationType: v }));
                setMetadata({ calc_type_code: v });
              }}
              onBlur={() =>
                setTouched((p) => ({ ...p, calculationType: true }))
              }
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
              <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
              {calcError}
            </div>
          ) : null}
        </div>

        <div className="ecl-form-group ecl-u-mb-m">
          <label htmlFor="cs-funding" className="ecl-form-label">
            Funding type{" "}
            <span className="ecl-form-label__optional">(optional)</span>
          </label>

          <div className="ecl-select__container ecl-select__container--m ecl-u-width-100">
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
        {isPublicFunding && (
          <div className="ecl-form-group ecl-u-mb-m">
            <label
              htmlFor="cs-funding-programme-url"
              className="ecl-form-label"
            >
              Funding programme URL{" "}
              <span
                className="ecl-form-label__required"
                role="note"
                aria-label="required"
              >
                *
              </span>
            </label>

            <input
              id="cs-funding-programme-url"
              type="url"
              className="ecl-text-input ecl-u-width-100"
              value={form.fundingProgrammeUrl}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, fundingProgrammeUrl: v }));
                setMetadata({ funding_programme_url: v });
              }}
              onBlur={() =>
                setTouched((p) => ({ ...p, fundingProgrammeUrl: true }))
              }
              required
            />

            {fundingProgrammeUrlError ? (
              <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
                {fundingProgrammeUrlError}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
