"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReferenceData } from "../../_context/ReferenceDataContext";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useWizardData } from "../../_context/WizardDataContext";

type BenefitRow = {
  id: string;
  benefitType: string;
  name: string;
  value: string;
  unit: string;
};

type FieldKey =
  | `${string}:benefitType`
  | `${string}:name`
  | `${string}:value`
  | `${string}:unit`;

type Errors = Partial<Record<FieldKey, string>>;
type Touched = Partial<Record<FieldKey, boolean>>;

function isBlank(s: string) {
  return s.trim() === "";
}

function validateName(name: string): string | undefined {
  if (isBlank(name)) return "Name is required.";
  if (name.length > 80) return "Maximum 80 characters.";
  return undefined;
}

function validateValue(value: string): string | undefined {
  if (isBlank(value)) return "Value is required.";

  const n = Number(value);
  if (!Number.isFinite(n)) return "Value must be a number.";
  if (!Number.isInteger(n)) return "Value must be an integer.";
  if (n < 0) return "Value must be greater than or equal 0.";

  return undefined;
}

export default function Step5Benefits() {
  const { benefit_types, benefit_units } = useReferenceData();
  const { data, setMetadata, setStepValidity } = useWizardData();

  const idCounter = useRef(2);
  const [rows, setRows] = useState<BenefitRow[]>([
    { id: "benefit-1", benefitType: "", name: "", value: "", unit: "" },
  ]);

  const environmentalCode = useMemo(() => {
    const env = benefit_types.find(
      (b) => (b.code || "").toLowerCase() === "environmental",
    );
    return env?.code ?? "";
  }, [benefit_types]);

  useEffect(() => {
    const existing = data.metadata.benefits as
      | Array<{
          type_code: string;
          name: string;
          value: number;
          unit_code: string;
        }>
      | undefined;

    if (existing?.length) {
      const seeded: BenefitRow[] = existing.map((b, idx) => ({
        id: `benefit-${idx + 1}`,
        benefitType: b.type_code ?? "",
        name: b.name ?? "",
        value: String(b.value),
        unit: b.unit_code ?? "",
      }));
      setRows(seeded);
      idCounter.current = seeded.length + 1;
    }
  }, []);

  useEffect(() => {
    if (!environmentalCode) return;
    setRows((prev) => {
      if (!prev[0]) return prev;
      if (prev[0].benefitType) return prev;
      const next = [...prev];
      next[0] = { ...next[0], benefitType: environmentalCode };
      return next;
    });
  }, [environmentalCode]);

  useEffect(() => {
    globalThis.ECL?.autoInit?.();
  }, []);

  const typeOptions = useMemo(
    () => [...benefit_types].sort((a, b) => a.label.localeCompare(b.label)),
    [benefit_types],
  );
  const unitOptions = useMemo(
    () => [...benefit_units].sort((a, b) => a.label.localeCompare(b.label)),
    [benefit_units],
  );

  const isCompleteRow = (r: BenefitRow) =>
    r.benefitType.trim() !== "" &&
    r.name.trim() !== "" &&
    r.unit.trim() !== "" &&
    r.value.trim() !== "";

  useEffect(() => {
    setMetadata({
      benefits: rows.map((r) => ({
        type_code: r.benefitType,
        name: r.name,
        value: r.value.trim() === "" ? Number.NaN : Number(r.value),
        unit_code: r.unit,
      })),
    });

    const allComplete = rows.length >= 1 && rows.every(isCompleteRow);
    const hasEnvironmental = rows.some(
      (r) => (r.benefitType || "").toLowerCase() === "environmental",
    );

    setStepValidity(5, allComplete && hasEnvironmental);
  }, [rows, setMetadata, setStepValidity]);

  const addRow = () => {
    const id = `benefit-${idCounter.current++}`;
    setRows((p) => [
      ...p,
      { id, benefitType: "", name: "", value: "", unit: "" },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((p) => (p.length === 1 ? p : p.filter((r) => r.id !== id)));
  };

  const updateRow = (id: string, patch: Partial<BenefitRow>) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const [touched, setTouched] = useState<Touched>({});

  const touch = (k: FieldKey) => setTouched((p) => ({ ...p, [k]: true }));

  const showError = (k: FieldKey, errors: Errors) =>
    touched[k] ? errors[k] : undefined;

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};

    for (const r of rows) {
      const base = r.id;

      const benefitTypeBlank = isBlank(r.benefitType);
      if (benefitTypeBlank) {
        e[`${base}:benefitType`] = "Benefit type is required.";
      }

      const nameError = validateName(r.name);
      if (nameError) e[`${base}:name`] = nameError;

      const valueError = validateValue(r.value);
      if (valueError) e[`${base}:value`] = valueError;

      const unitBlank = isBlank(r.unit);
      if (unitBlank) e[`${base}:unit`] = "Unit is required.";
    }

    return e;
  }, [rows]);

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Benefits</h2>

      <p className="ecl-u-type-paragraph">
        Add one or more benefits. All fields are required. At least one benefit
        must be of type <strong>Environmental</strong>.
      </p>

      <div className="space-y-6">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="ecl-u-border-all ecl-u-border-color-grey-50 ecl-u-pa-m rounded-lg"
          >
            <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between ecl-u-mb-m">
              <div className="ecl-u-type-heading-4">Benefit {index + 1}</div>

              <button
                type="button"
                className="ecl-button ecl-button--tertiary"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                aria-label="Remove benefit"
                title={
                  rows.length === 1
                    ? "At least one benefit is required"
                    : "Remove benefit"
                }
              >
                <span className="ecl-button__container">
                  <span className="ecl-button__label">Remove</span>
                  <ClientIcon className="wt-icon-ecl--trash ecl-icon ecl-icon--s ecl-u-ml-xs" />
                </span>
              </button>
            </div>

            <div className="ecl-form-group ecl-u-mb-m">
              <label
                htmlFor={`benefit-type-${row.id}`}
                className="ecl-form-label"
              >
                Benefit type{" "}
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
                  id={`benefit-type-${row.id}`}
                  className="ecl-select"
                  value={row.benefitType}
                  onChange={(e) =>
                    updateRow(row.id, { benefitType: e.target.value })
                  }
                  onBlur={() => touch(`${row.id}:benefitType`)}
                  required
                  data-ecl-auto-init="Select"
                >
                  <option value="" disabled>
                    Select a benefit type…
                  </option>
                  {typeOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="ecl-select__icon">
                  <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
                </div>
              </div>
              {showError(`${row.id}:benefitType`, errors) ? (
                <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                  {showError(`${row.id}:benefitType`, errors)}
                </div>
              ) : null}
            </div>

            <div className="ecl-form-group ecl-u-mb-m">
              <label
                htmlFor={`benefit-name-${row.id}`}
                className="ecl-form-label"
              >
                Name{" "}
                <span
                  className="ecl-form-label__required"
                  role="note"
                  aria-label="required"
                >
                  *
                </span>
              </label>
              <div
                className="ecl-help-block"
                id={`benefit-name-${row.id}-helper`}
              >
                Max. 80 characters ({row.name.length}/80)
              </div>
              <input
                id={`benefit-name-${row.id}`}
                className="ecl-text-input ecl-u-width-100"
                value={row.name}
                maxLength={80}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                onBlur={() => touch(`${row.id}:name`)}
                required
                aria-describedby={`benefit-name-${row.id}-helper`}
              />
              {showError(`${row.id}:name`, errors) ? (
                <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                  {showError(`${row.id}:name`, errors)}
                </div>
              ) : null}
            </div>

            <div className="ecl-form-group ecl-u-mb-m">
              <label
                htmlFor={`benefit-value-${row.id}`}
                className="ecl-form-label"
              >
                Value{" "}
                <span
                  className="ecl-form-label__required"
                  role="note"
                  aria-label="required"
                >
                  *
                </span>
              </label>

              <input
                id={`benefit-value-${row.id}`}
                className="ecl-text-input ecl-u-width-100"
                type="number"
                min={0}
                step={1}
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
                onBlur={() => touch(`${row.id}:value`)}
                required
              />
              {showError(`${row.id}:value`, errors) ? (
                <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                  {showError(`${row.id}:value`, errors)}
                </div>
              ) : null}
            </div>

            <div className="ecl-form-group">
              <label
                htmlFor={`benefit-unit-${row.id}`}
                className="ecl-form-label"
              >
                Unit{" "}
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
                  id={`benefit-unit-${row.id}`}
                  className="ecl-select"
                  value={row.unit}
                  onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                  onBlur={() => touch(`${row.id}:unit`)}
                  required
                  data-ecl-auto-init="Select"
                >
                  <option value="" disabled>
                    Select a unit…
                  </option>
                  {unitOptions.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="ecl-select__icon">
                  <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
                </div>
              </div>
              {showError(`${row.id}:unit`, errors) ? (
                <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                  {showError(`${row.id}:unit`, errors)}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="ecl-u-mt-l">
        <button
          type="button"
          className="ecl-button ecl-button--primary"
          onClick={addRow}
        >
          + Add Benefit
        </button>
      </div>
    </>
  );
}
