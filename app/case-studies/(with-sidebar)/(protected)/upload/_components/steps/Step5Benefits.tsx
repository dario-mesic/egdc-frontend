"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReferenceData } from "../../../../../_context/ReferenceDataContext";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useWizardData } from "../../_context/WizardDataContext";
import { useCombobox, autocomplete } from "@szhsin/react-autocomplete";

const NET_CARBON_NAME = "Net Carbon Impact";
const NET_CARBON_UNIT_CODE = "tco2";

const COMMON_FUNCTIONAL_UNITS = [
  "per vehicle",
  "per vehicle annually",
  "per building",
  "per building block annually",
  "per hectare",
  "per passenger-km",
  "per ton-km",
  "per employee",
  "per user",
  "per device",
  "per square meter",
  "per production line",
  "per transmission line",
  "per municipality annually",
] as const;

type BenefitRow = {
  id: string;
  benefitType: string;
  name: string;
  value: string;
  unit: string;
  functionalUnit: string;
};

type FieldKey =
  | `${string}:benefitType`
  | `${string}:name`
  | `${string}:value`
  | `${string}:unit`
  | `${string}:functionalUnit`;

type Errors = Partial<Record<FieldKey, string>>;
type Touched = Partial<Record<FieldKey, boolean>>;

type FunctionalUnitComboboxProps = Readonly<{
  id: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
}>;

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

const normalize = (s: string) => s.trim().toLowerCase();

function filterFunctionalUnits(value: string) {
  const v = normalize(value);
  if (!v) return [...COMMON_FUNCTIONAL_UNITS];
  return COMMON_FUNCTIONAL_UNITS.filter((x) => normalize(x).startsWith(v));
}

function FunctionalUnitCombobox({
  id,
  value,
  disabled,
  error,
  onChange,
  onBlur,
}: FunctionalUnitComboboxProps) {
  const items = useMemo(() => filterFunctionalUnits(value), [value]);

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
    items,
    getItemValue: (item: string) => item,
    isEqual: (a?: string, b?: string) => (a ?? "") === (b ?? ""),
    value,
    selected: undefined,
    onChange: (v = "") => onChange(v),
    onSelectChange: (item?: string) => onChange(item ?? ""),
    feature: autocomplete({
      select: false,
      closeOnSelect: true,
    }),
  });

  const clearProps = getClearProps();
  const hasValue = isInputEmpty === false;

  let listContent: React.ReactNode;

  if (items.length > 0) {
    listContent = items.map((item, index) => (
      <li
        key={item}
        {...getItemProps({ item, index })}
        className={[
          "ecl-u-ph-s ecl-u-pv-xs",
          focusIndex === index ? "bg-[#0078D7]" : "ecl-u-bg-white",
          focusIndex === index
            ? "ecl-u-type-color-white"
            : "ecl-u-type-color-black",
        ].join(" ")}
      >
        {item}
      </li>
    ));
  } else {
    listContent = (
      <li className="ecl-u-ph-s ecl-u-pv-xs ecl-u-type-color-black">
        No results
      </li>
    );
  }
  const inputProps = getInputProps();
  return (
    <>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          onBlur={(e) => {
            inputProps.onBlur?.(e);
            onBlur();
          }}
          disabled={disabled}
          className={[
            "ecl-text-input ecl-u-width-100 pr-10",
            error ? "ecl-u-border-color-error" : "",
          ].join(" ")}
        />

        {hasValue ? (
          <button
            type="button"
            aria-label="Clear functional unit"
            {...clearProps}
            disabled={disabled}
            onClick={(e) => {
              clearProps.onClick?.(e);
              onChange("");
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 ecl-u-pa-none ecl-u-d-flex ecl-u-align-items-center leading-none"
          >
            <ClientIcon className="wt-icon-close wt-icon--s" />
          </button>
        ) : null}

        <button
          type="button"
          aria-label="Toggle functional unit list"
          {...getToggleProps()}
          disabled={disabled}
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
          {listContent}
        </ul>
      </div>

      {error ? (
        <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
          <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
          {error}
        </div>
      ) : null}
    </>
  );
}

export default function Step5Benefits() {
  const { benefit_types, benefit_units } = useReferenceData();
  const { data, setMetadata, setStepValidity } = useWizardData();

  const idCounter = useRef(2);
  const [rows, setRows] = useState<BenefitRow[]>([
    {
      id: "benefit-1",
      benefitType: "",
      name: NET_CARBON_NAME,
      value: "",
      unit: NET_CARBON_UNIT_CODE,
      functionalUnit: "",
    },
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
          functional_unit?: string | null;
        }>
      | undefined;

    if (existing?.length) {
      const seeded: BenefitRow[] = existing.map((b, idx) => ({
        id: `benefit-${idx + 1}`,
        benefitType: b.type_code ?? "",
        name: b.name ?? "",
        value: String(b.value),
        unit: b.unit_code ?? "",
        functionalUnit: (b.functional_unit ?? "").trim(),
      }));
      setRows(seeded);
      idCounter.current = seeded.length + 1;
    }
  }, []);

  const tco2UnitCode = useMemo(() => {
    const u = benefit_units.find(
      (x) => (x.code ?? "").toLowerCase() === NET_CARBON_UNIT_CODE,
    );
    return u?.code ?? NET_CARBON_UNIT_CODE;
  }, [benefit_units]);

  useEffect(() => {
    if (!environmentalCode) return;

    setRows((prev) => {
      if (!prev[0]) return prev;

      const fixed = prev[0];
      const next0: BenefitRow = {
        ...fixed,
        benefitType: environmentalCode,
        name: NET_CARBON_NAME,
        unit: tco2UnitCode,
      };

      const changed =
        fixed.benefitType !== next0.benefitType ||
        fixed.name !== next0.name ||
        fixed.unit !== next0.unit;

      if (!changed) return prev;

      const next = [...prev];
      next[0] = next0;
      return next;
    });
  }, [environmentalCode, tco2UnitCode]);

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

  const isCompleteRow = (r: BenefitRow, index: number) => {
    if (index === 0)
      return r.value.trim() !== "" && r.functionalUnit.trim() !== "";
    return (
      r.benefitType.trim() !== "" &&
      r.name.trim() !== "" &&
      r.unit.trim() !== "" &&
      r.value.trim() !== "" &&
      r.functionalUnit.trim() !== ""
    );
  };

  useEffect(() => {
    setMetadata({
      benefits: rows.map((r, idx) => {
        const fu = r.functionalUnit.trim();
        if (idx === 0) {
          return {
            type_code: environmentalCode || "environmental",
            name: NET_CARBON_NAME,
            value: r.value.trim() === "" ? Number.NaN : Number(r.value),
            unit_code: tco2UnitCode,
            functional_unit: fu,
            is_net_carbon_impact: true,
          };
        }

        return {
          type_code: r.benefitType,
          name: r.name,
          value: r.value.trim() === "" ? Number.NaN : Number(r.value),
          unit_code: r.unit,
          functional_unit: fu,
        };
      }),
    });

    const allComplete =
      rows.length >= 1 && rows.every((r, i) => isCompleteRow(r, i));

    const hasEnvironmental = true;

    setStepValidity(5, allComplete && hasEnvironmental);
  }, [rows, setMetadata, setStepValidity, environmentalCode, tco2UnitCode]);

  const addRow = () => {
    const id = `benefit-${idCounter.current++}`;
    setRows((p) => [
      ...p,
      {
        id,
        benefitType: "",
        name: "",
        value: "",
        unit: "",
        functionalUnit: "",
      },
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

    rows.forEach((r, index) => {
      const base = r.id;

      if (index === 0) {
        const valueError = validateValue(r.value);
        if (valueError) e[`${base}:value`] = valueError;
        if (isBlank(r.functionalUnit)) {
          e[`${base}:functionalUnit`] = "Functional unit is required.";
        }
        return;
      }

      if (isBlank(r.benefitType))
        e[`${base}:benefitType`] = "Benefit type is required.";

      if (isBlank(r.functionalUnit)) {
        e[`${base}:functionalUnit`] = "Functional unit is required.";
      }

      const nameError = validateName(r.name);
      if (nameError) e[`${base}:name`] = nameError;

      const valueError = validateValue(r.value);
      if (valueError) e[`${base}:value`] = valueError;

      if (isBlank(r.unit)) e[`${base}:unit`] = "Unit is required.";
    });

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
        {rows.map((row, index) => {
          const benefitTypeError = showError(`${row.id}:benefitType`, errors);
          const nameError = showError(`${row.id}:name`, errors);
          const valueError = showError(`${row.id}:value`, errors);
          const unitError = showError(`${row.id}:unit`, errors);
          const functionalUnitError = showError(
            `${row.id}:functionalUnit`,
            errors,
          );
          return (
            <div
              key={row.id}
              className="ecl-u-border-all ecl-u-border-color-grey-50 ecl-u-pv-m rounded-lg"
            >
              {" "}
              <div className="w-full max-w-2xl lg:max-w-4xl">
                <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between ecl-u-mb-m">
                  <div className="ecl-u-type-heading-4">
                    Benefit {index + 1}
                  </div>

                  <button
                    type="button"
                    className="ecl-button ecl-button--tertiary"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1 || index === 0}
                    aria-label="Remove benefit"
                    title={
                      index === 0
                        ? "Net Carbon Impact benefit is required"
                        : rows.length === 1
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

                  <div
                    className={[
                      "ecl-select__container",
                      "ecl-select__container--m",
                      "ecl-u-width-100",
                      index === 0 ? "ecl-select__container--disabled" : "",
                    ].join(" ")}
                  >
                    <select
                      id={`benefit-type-${row.id}`}
                      className={[
                        "ecl-select",
                        benefitTypeError ? "ecl-u-border-color-error" : "",
                      ].join(" ")}
                      value={row.benefitType}
                      onChange={(e) =>
                        updateRow(row.id, { benefitType: e.target.value })
                      }
                      onBlur={() => touch(`${row.id}:benefitType`)}
                      disabled={index === 0}
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
                  {benefitTypeError ? (
                    <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                      <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />{" "}
                      {benefitTypeError}
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
                    className={[
                      "ecl-text-input ecl-u-width-100",
                      nameError ? "ecl-u-border-color-error" : "",
                    ].join(" ")}
                    value={row.name}
                    maxLength={80}
                    onChange={(e) =>
                      updateRow(row.id, { name: e.target.value })
                    }
                    onBlur={() => touch(`${row.id}:name`)}
                    disabled={index === 0}
                    required
                    aria-describedby={`benefit-name-${row.id}-helper`}
                  />
                  {nameError ? (
                    <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                      <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />
                      {nameError}
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
                    className={[
                      "ecl-text-input ecl-u-width-100",
                      valueError ? "ecl-u-border-color-error" : "",
                    ].join(" ")}
                    type="number"
                    min={0}
                    step={1}
                    value={row.value}
                    onChange={(e) =>
                      updateRow(row.id, { value: e.target.value })
                    }
                    onBlur={() => touch(`${row.id}:value`)}
                    required
                  />
                  {valueError ? (
                    <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                      <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />{" "}
                      {valueError}
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

                  <div
                    className={[
                      "ecl-select__container",
                      "ecl-select__container--m",
                      "ecl-u-width-100",
                      index === 0 ? "ecl-select__container--disabled" : "",
                    ].join(" ")}
                  >
                    <select
                      id={`benefit-unit-${row.id}`}
                      className={[
                        "ecl-select",
                        unitError ? "ecl-u-border-color-error" : "",
                      ].join(" ")}
                      value={row.unit}
                      onChange={(e) =>
                        updateRow(row.id, { unit: e.target.value })
                      }
                      onBlur={() => touch(`${row.id}:unit`)}
                      disabled={index === 0}
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
                  {unitError ? (
                    <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
                      <ClientIcon className="wt-icon--error ecl-icon ecl-icon--s ecl-feedback-message__icon " />{" "}
                      {unitError}
                    </div>
                  ) : null}
                </div>
                <div className="ecl-form-group ecl-u-mt-m">
                  <label
                    htmlFor={`benefit-functional-unit-${row.id}`}
                    className="ecl-form-label"
                  >
                    Functional unit{" "}
                    <span
                      className="ecl-form-label__required"
                      role="note"
                      aria-label="required"
                    >
                      *
                    </span>
                  </label>

                  <FunctionalUnitCombobox
                    id={`benefit-functional-unit-${row.id}`}
                    value={row.functionalUnit}
                    onChange={(v) => updateRow(row.id, { functionalUnit: v })}
                    onBlur={() => touch(`${row.id}:functionalUnit`)}
                    error={showError(`${row.id}:functionalUnit`, errors)}
                  />
                </div>
              </div>
            </div>
          );
        })}
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
