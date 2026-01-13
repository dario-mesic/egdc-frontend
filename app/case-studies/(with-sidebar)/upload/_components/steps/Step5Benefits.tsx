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

export default function Step5Benefits() {
  const { benefit_types, benefit_units } = useReferenceData();
  const { data, setMetadata, setStepValidity } = useWizardData();

  const idCounter = useRef(2);
  const [rows, setRows] = useState<BenefitRow[]>([
    { id: "benefit-1", benefitType: "", name: "", value: "", unit: "" },
  ]);

  const environmentalCode = useMemo(() => {
    const env = benefit_types.find(
      (b) => (b.code || "").toLowerCase() === "environmental"
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
    if ((window as any)?.ECL?.autoInit) (window as any).ECL.autoInit();
  }, []);

  const typeOptions = useMemo(
    () => [...benefit_types].sort((a, b) => a.label.localeCompare(b.label)),
    [benefit_types]
  );
  const unitOptions = useMemo(
    () => [...benefit_units].sort((a, b) => a.label.localeCompare(b.label)),
    [benefit_units]
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
        value: r.value.trim() === "" ? NaN : Number(r.value),
        unit_code: r.unit,
      })),
    });

    const allComplete = rows.length >= 1 && rows.every(isCompleteRow);
    const hasEnvironmental = rows.some(
      (r) => (r.benefitType || "").toLowerCase() === "environmental"
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
                Benefit type
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
            </div>

            <div className="ecl-form-group ecl-u-mb-m">
              <label
                htmlFor={`benefit-name-${row.id}`}
                className="ecl-form-label"
              >
                Name
                <span
                  className="ecl-form-label__required"
                  role="note"
                  aria-label="required"
                >
                  *
                </span>
              </label>

              <input
                id={`benefit-name-${row.id}`}
                className="ecl-text-input ecl-u-width-100"
                value={row.name}
                maxLength={255}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                required
              />
            </div>

            <div className="ecl-form-group ecl-u-mb-m">
              <label
                htmlFor={`benefit-value-${row.id}`}
                className="ecl-form-label"
              >
                Value
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
                required
              />
            </div>

            <div className="ecl-form-group">
              <label
                htmlFor={`benefit-unit-${row.id}`}
                className="ecl-form-label"
              >
                Unit
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
