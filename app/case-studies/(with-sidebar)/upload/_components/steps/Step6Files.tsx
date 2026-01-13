"use client";

import { useEffect, useRef, useState } from "react";
import { useWizardData } from "../../_context/WizardDataContext";

type LocalTouched = {
  methodology?: boolean;
  dataset?: boolean;
  logo?: boolean;
};
type LocalErrors = {
  methodology?: string;
  dataset?: string;
  logo?: string;
};

const IDS = {
  methodology: {
    input: "cs-methodology",
    label: "cs-methodology-label",
    helper: "cs-methodology-helper",
  },
  dataset: {
    input: "cs-dataset",
    label: "cs-dataset-label",
    helper: "cs-dataset-helper",
  },
  logo: {
    input: "cs-logo",
    label: "cs-logo-label",
    helper: "cs-logo-helper",
  },
} as const;

function isPdf(f: File) {
  const name = (f.name || "").toLowerCase();
  return f.type === "application/pdf" || name.endsWith(".pdf");
}

function isDataset(f: File) {
  const name = (f.name || "").toLowerCase();
  const datasetMimes = new Set([
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);

  return (
    datasetMimes.has(f.type) ||
    name.endsWith(".csv") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  );
}

export default function Step6Files() {
  const { data, setFiles, setStepValidity } = useWizardData();
  const [touched, setTouched] = useState<LocalTouched>({});
  const [errors, setErrors] = useState<LocalErrors>({});

  const methodologyRef = useRef<HTMLInputElement | null>(null);
  const datasetRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ECL?.autoInit) {
      (window as any).ECL.autoInit();
    }
  }, []);

  const hasLogo = !!data.files.file_logo;
  const hasMethodology = !!data.files.file_methodology;
  const hasDatasetFile = !!data.files.file_dataset;

  const stepValid = hasLogo && hasMethodology && hasDatasetFile;

  function isImage(file: File) {
    const name = (file.name || "").toLowerCase();
    return (
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg")
    );
  }

  useEffect(() => {
    setStepValidity(6, stepValid);
  }, [setStepValidity, stepValid]);

  const onPickMethodology = (file?: File) => {
    setErrors((p) => ({ ...p, methodology: "" }));

    if (!file) {
      setFiles({ file_methodology: undefined });
      return;
    }

    if (!isPdf(file)) {
      if (methodologyRef.current) methodologyRef.current.value = "";
      setFiles({ file_methodology: undefined });
      setErrors((p) => ({ ...p, methodology: "Only PDF files are allowed." }));
      return;
    }

    setFiles({ file_methodology: file });
  };

  const onPickDataset = (file?: File) => {
    setErrors((p) => ({ ...p, dataset: "" }));

    if (!file) {
      setFiles({ file_dataset: undefined });
      return;
    }

    if (!isDataset(file)) {
      if (datasetRef.current) datasetRef.current.value = "";
      setFiles({ file_dataset: undefined });
      setErrors((p) => ({
        ...p,
        dataset: "Only CSV, XLS or XLSX files are allowed.",
      }));
      return;
    }

    setFiles({ file_dataset: file });
  };

  const onPickLogo = (file?: File) => {
    setErrors((p) => ({ ...p, logo: "" }));

    if (!file) {
      setFiles({ file_logo: undefined });
      return;
    }

    if (!isImage(file)) {
      setFiles({ file_logo: undefined });
      setErrors((p) => ({ ...p, logo: "Only PNG or JPG images are allowed." }));
      return;
    }

    setFiles({ file_logo: file });
  };

  const methodologyError = touched.methodology
    ? errors.methodology ||
      (!hasMethodology ? "Methodology report (PDF) is required." : "")
    : "";

  const datasetError = touched.dataset
    ? errors.dataset ||
      (!hasDatasetFile ? "Calculator/Dataset (CSV/XLS/XLSX) is required." : "")
    : "";

  const logoError = touched.logo
    ? errors.logo || (!hasLogo ? "Logo is required." : "")
    : "";

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Files</h2>

      <div
        className="ecl-form-group ecl-u-mb-l"
        data-ecl-file-upload-group="true"
        data-ecl-auto-init="FileUpload"
      >
        <label
          htmlFor={IDS.methodology.input}
          id={IDS.methodology.label}
          className="ecl-form-label"
        >
          Methodology Report (PDF)
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>

        <div className="ecl-help-block" id={IDS.methodology.helper}>
          Upload a <strong>PDF</strong>.
        </div>

        <input
          ref={methodologyRef}
          type="file"
          className="ecl-file-upload"
          data-ecl-file-upload-input
          data-ecl-auto-init="FileUpload"
          id={IDS.methodology.input}
          name="file_methodology"
          accept="application/pdf,.pdf"
          required
          aria-describedby={[
            IDS.methodology.label,
            IDS.methodology.helper,
            methodologyError ? `${IDS.methodology.input}-error` : "",
          ].join(" ")}
          onChange={(e) => {
            setTouched((p) => ({ ...p, methodology: true }));
            onPickMethodology(e.currentTarget.files?.[0]);
          }}
        />

        <label
          className="ecl-file-upload__button-container"
          htmlFor={IDS.methodology.input}
        >
          <span
            className="ecl-file-upload__button ecl-button ecl-button--primary"
            data-ecl-file-upload-button
            data-ecl-file-upload-label-choose="Choose file"
            data-ecl-file-upload-label-replace="Replace file"
          >
            Choose file
          </span>
        </label>

        <ul
          className="ecl-file-upload__list"
          data-ecl-file-upload-list
          aria-live="polite"
        />

        {methodologyError ? (
          <div
            id={`${IDS.methodology.input}-error`}
            className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs"
          >
            {methodologyError}
          </div>
        ) : null}
      </div>

      <div
        className="ecl-form-group ecl-u-mb-l"
        data-ecl-file-upload-group="true"
        data-ecl-auto-init="FileUpload"
      >
        <label
          htmlFor={IDS.dataset.input}
          id={IDS.dataset.label}
          className="ecl-form-label"
        >
          Calculator/Dataset (CSV/XLS/XLSX)
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>

        <div className="ecl-help-block" id={IDS.dataset.helper}>
          Upload <strong>CSV</strong> or <strong>Excel</strong>.
        </div>

        <input
          ref={datasetRef}
          type="file"
          className="ecl-file-upload"
          data-ecl-file-upload-input
          data-ecl-auto-init="FileUpload"
          id={IDS.dataset.input}
          name="file_dataset"
          accept={[
            ".xlsx,.xls,.csv",
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ].join(",")}
          required
          aria-describedby={[
            IDS.dataset.label,
            IDS.dataset.helper,
            datasetError ? `${IDS.dataset.input}-error` : "",
          ].join(" ")}
          onChange={(e) => {
            setTouched((p) => ({ ...p, dataset: true }));
            onPickDataset(e.currentTarget.files?.[0]);
          }}
        />

        <label
          className="ecl-file-upload__button-container"
          htmlFor={IDS.dataset.input}
        >
          <span
            className="ecl-file-upload__button ecl-button ecl-button--primary"
            data-ecl-file-upload-button
            data-ecl-file-upload-label-choose="Choose file"
            data-ecl-file-upload-label-replace="Replace file"
          >
            Choose file
          </span>
        </label>

        <ul
          className="ecl-file-upload__list"
          data-ecl-file-upload-list
          aria-live="polite"
        />

        {datasetError ? (
          <div
            id={`${IDS.dataset.input}-error`}
            className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs"
          >
            {datasetError}
          </div>
        ) : null}
      </div>

      <div
        className="ecl-form-group ecl-u-mb-l"
        data-ecl-file-upload-group="true"
        data-ecl-auto-init="FileUpload"
      >
        <label
          htmlFor={IDS.logo.input}
          id={IDS.logo.label}
          className="ecl-form-label"
        >
          Case Study Logo
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>

        <div className="ecl-help-block" id={IDS.logo.helper}>
          Only <strong>PNG/JPG/JPEG</strong>.
        </div>

        <input
          type="file"
          className="ecl-file-upload"
          data-ecl-file-upload-input
          data-ecl-auto-init="FileUpload"
          id={IDS.logo.input}
          name="file_logo"
          accept="image/png,image/jpeg,.png,.jpg,.jpeg"
          required
          aria-describedby={[
            IDS.logo.label,
            IDS.logo.helper,
            logoError ? `${IDS.logo.input}-error` : "",
          ].join(" ")}
          onChange={(e) => {
            setTouched((p) => ({ ...p, logo: true }));
            onPickLogo(e.currentTarget.files?.[0]);
          }}
        />

        <label
          className="ecl-file-upload__button-container"
          htmlFor={IDS.logo.input}
        >
          <span
            className="ecl-file-upload__button ecl-button ecl-button--primary"
            data-ecl-file-upload-button
            data-ecl-file-upload-label-choose="Choose file"
            data-ecl-file-upload-label-replace="Replace file"
          >
            Choose file
          </span>
        </label>

        <ul
          className="ecl-file-upload__list"
          data-ecl-file-upload-list
          aria-live="polite"
        />

        {logoError ? (
          <div
            id={`${IDS.logo.input}-error`}
            className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs"
          >
            {logoError}
          </div>
        ) : null}
      </div>
    </>
  );
}
