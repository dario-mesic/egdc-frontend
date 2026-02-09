"use client";

import { useEffect, useRef, useState } from "react";
import { useWizardData } from "../../_context/WizardDataContext";
import { useReferenceData } from "../../_context/ReferenceDataContext";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useDropzone, type Accept } from "react-dropzone";

type SingleFileDropzoneProps = Readonly<{
  label: string;
  accept: Accept;
  disabled?: boolean;
  file?: File;
  error?: string;
  onDropFile: (f?: File, errorCode?: string) => void;
  onReject?: (message: string) => void;
  onClear: () => void;
  className?: string;
}>;

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
  methodologyLanguage: {
    input: "cs-methodology-language",
    label: "cs-methodology-language-label",
  },
  datasetLanguage: {
    input: "cs-dataset-language",
    label: "cs-dataset-language-label",
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

function SingleFileDropzone({
  label,
  accept,
  disabled,
  file,
  error,
  onDropFile,
  onClear,
  className,
}: SingleFileDropzoneProps) {
  const {
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragReject,
    isDragActive,
  } = useDropzone({
    multiple: false,
    disabled,
    accept,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const code = fileRejections[0]?.errors?.[0]?.code;
        onDropFile(undefined, code);
        return;
      }

      const f = acceptedFiles?.[0];
      if (f) onDropFile(f);
    },
  });

  let borderClass = "ecl-u-border-color-grey-300";
  if (isDragActive) {
    if (isDragAccept) borderClass = "ecl-u-border-color-success";
    else if (isDragReject) borderClass = "ecl-u-border-color-error";
  } else if (error) {
    borderClass = "ecl-u-border-color-error";
  } else if (file) {
    borderClass = "ecl-u-border-color-success";
  }

  return (
    <div className={className}>
      <div
        {...getRootProps({
          className: [
            "ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-justify-content-center",
            "border-3 ecl-u-border-style-dashed ecl-u-border-radius-4",
            "ecl-u-bg-grey-50 ecl-u-type-color-grey-400",
            "transition-[border] duration-200",
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            borderClass,
            "h-40",
          ].join(" "),
        })}
      >
        <input {...getInputProps()} />
        <p className="text-sm ecl-u-type-align-center ecl-u-ph-s">{label}</p>

        {file ? (
          <p className="ecl-u-mt-xs text-xs ecl-u-type-color-grey-700 ecl-u-ph-s ecl-u-type-align-center break-all">
            <span className="font-semibold">Selected:</span> {file.name}
          </p>
        ) : null}

        {file ? (
          <button
            type="button"
            className="ecl-u-mt-xs text-xs ecl-u-type-underline ecl-u-type-color-grey-600 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClear();
            }}
            disabled={disabled}
          >
            Remove file
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function Step6Files() {
  const { languages } = useReferenceData();
  const { data, setFiles, setStepValidity, setMetadata } = useWizardData();
  const [touched, setTouched] = useState<LocalTouched>({});
  const [errors, setErrors] = useState<LocalErrors>({});

  const methodologyRef = useRef<HTMLInputElement | null>(null);
  const datasetRef = useRef<HTMLInputElement | null>(null);
  const logoRef = useRef<HTMLInputElement | null>(null);

  const hasMethodology = !!data.files.file_methodology;
  const hasDatasetFile = !!data.files.file_dataset;
  const hasLogo = !!data.files.file_logo;

  const [resetKeys, setResetKeys] = useState({
    methodology: 0,
    dataset: 0,
    logo: 0,
  });

  const bumpResetKey = (k: keyof typeof resetKeys) =>
    setResetKeys((p) => ({ ...p, [k]: p[k] + 1 }));

  const clearNative = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.value = "";
  };

  const clearPickedFile = (
    key: "methodology" | "dataset" | "logo",
    ref: React.RefObject<HTMLInputElement | null>,
  ) => {
    if (key === "methodology") setFiles({ file_methodology: undefined });
    if (key === "dataset") setFiles({ file_dataset: undefined });
    if (key === "logo") setFiles({ file_logo: undefined });

    clearNative(ref);
    bumpResetKey(key);
  };

  const setFileError = (key: keyof LocalErrors, message: string) => {
    setErrors((p) => ({ ...p, [key]: message }));
  };

  const handleDrop =
    <K extends keyof LocalTouched>(
      key: K,
      ref: React.RefObject<HTMLInputElement | null>,
    ) =>
    (pick: (f?: File) => void, invalidTypeMessage: string) =>
    (f?: File, errorCode?: string) => {
      setTouched((p) => ({ ...p, [key]: true }));

      if (errorCode === "file-invalid-type") {
        if (key === "methodology") setFiles({ file_methodology: undefined });
        if (key === "dataset") setFiles({ file_dataset: undefined });
        if (key === "logo") setFiles({ file_logo: undefined });

        clearNative(ref);
        setFileError(key, invalidTypeMessage);
        return;
      }

      syncFileToNativeInput(ref, f);
      pick(f);
    };

  const requiredMessages = {
    methodology: "Methodology report (PDF) is required.",
    dataset: "Calculator/Dataset (CSV/XLS/XLSX) is required.",
    logo: "Logo is required.",
  } as const;

  function resolveFieldError(
    touchedField: boolean | undefined,
    localError: string | undefined,
    hasFile: boolean,
    requiredMsg: string,
  ) {
    if (!touchedField) return undefined;
    if (localError) return localError;
    if (!hasFile) return requiredMsg;
    return undefined;
  }

  useEffect(() => {
    globalThis.ECL?.autoInit?.();
  }, [resetKeys.methodology, resetKeys.dataset, resetKeys.logo]);

  const stepValid = hasLogo && hasMethodology && hasDatasetFile;

  useEffect(() => {
    setStepValidity(6, stepValid);
  }, [setStepValidity, stepValid]);

  const onPickMethodology = (file?: File) => {
    setFileError("methodology", "");

    if (!file) {
      clearPickedFile("methodology", methodologyRef);
      return;
    }

    if (!isPdf(file)) {
      clearNative(methodologyRef);
      setFiles({ file_methodology: undefined });
      setFileError("methodology", "Only PDF files are allowed.");
      return;
    }

    setFiles({ file_methodology: file });
    if (!data.metadata.methodology_language_code) {
      setMetadata({ methodology_language_code: "en" });
    }
  };

  const onPickDataset = (file?: File) => {
    setFileError("dataset", "");

    if (!file) {
      clearPickedFile("dataset", datasetRef);
      return;
    }

    if (!isDataset(file)) {
      clearNative(datasetRef);
      setFiles({ file_dataset: undefined });
      setFileError("dataset", "Only CSV, XLS or XLSX files are allowed.");
      return;
    }

    setFiles({ file_dataset: file });
    if (!data.metadata.dataset_language_code) {
      setMetadata({ dataset_language_code: "en" });
    }
  };

  const onPickLogo = (file?: File) => {
    setFileError("logo", "");

    if (!file) {
      clearPickedFile("logo", logoRef);
      return;
    }

    if (!isImage(file)) {
      clearNative(logoRef);
      setFiles({ file_logo: undefined });
      setFileError("logo", "Only PNG or JPG images are allowed.");
      return;
    }

    setFiles({ file_logo: file });
  };

  const syncFileToNativeInput = (
    ref: React.RefObject<HTMLInputElement | null>,
    file?: File,
  ) => {
    const input = ref.current;
    if (!input) return;

    if (!file) {
      input.value = "";
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }

    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;

    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const methodologyError = resolveFieldError(
    touched.methodology,
    errors.methodology,
    hasMethodology,
    requiredMessages.methodology,
  );

  const datasetError = resolveFieldError(
    touched.dataset,
    errors.dataset,
    hasDatasetFile,
    requiredMessages.dataset,
  );

  const logoError = resolveFieldError(
    touched.logo,
    errors.logo,
    hasLogo,
    requiredMessages.logo,
  );

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Files</h2>
      <div className="w-full max-w-2xl lg:max-w-4xl">
        <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-start gap-3 ecl-u-mb-l">
          <SingleFileDropzone
            className="w-full sm:w-125"
            label="Drag and drop PDF file here, or click to select"
            accept={{ "application/pdf": [".pdf"] }}
            file={data.files.file_methodology}
            error={methodologyError}
            onDropFile={handleDrop("methodology", methodologyRef)(
              onPickMethodology,
              "Only PDF files are allowed.",
            )}
            onClear={() => {
              setTouched((p) => ({ ...p, methodology: true }));
              syncFileToNativeInput(methodologyRef);
              onPickMethodology();
            }}
          />

          <div className="ecl-u-flex-grow-1" style={{ minWidth: 320 }}>
            <div
              key={`methodology-${resetKeys.methodology}`}
              className="ecl-form-group"
              data-ecl-file-upload-group="true"
              data-ecl-auto-init="FileUpload"
            >
              <label
                htmlFor={IDS.methodology.input}
                id={IDS.methodology.label}
                className="ecl-form-label"
              >
                Methodology Report (PDF){" "}
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
          </div>
        </div>

        {hasMethodology && (
          <div className="ecl-form-group ecl-u-mb-l">
            <label
              htmlFor={IDS.methodologyLanguage.input}
              className="ecl-form-label"
            >
              Methodology language{" "}
              <span
                className="ecl-form-label__required"
                role="note"
                aria-label="required"
              >
                *
              </span>
            </label>

            <div className="ecl-select__container ecl-select__container--m ecl-u-width-100 sm:w-125!">
              <select
                id={IDS.methodologyLanguage.input}
                className="ecl-select"
                value={data.metadata.methodology_language_code ?? ""}
                onChange={(e) =>
                  setMetadata({ methodology_language_code: e.target.value })
                }
                required
                data-ecl-auto-init="Select"
              >
                <option value="" disabled>
                  Select a language…
                </option>
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>

              <div className="ecl-select__icon">
                <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs" />
              </div>
            </div>
          </div>
        )}
        <hr className="ecl-separator ecl-u-mb-m" />

        <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-start gap-3 ecl-u-mb-l">
          <SingleFileDropzone
            className="w-full sm:w-125"
            label="Drag and drop CSV/XLS/XLSX file here, or click to select"
            accept={{
              "text/csv": [".csv"],
              "application/vnd.ms-excel": [".xls"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
            }}
            file={data.files.file_dataset}
            error={datasetError}
            onDropFile={handleDrop("dataset", datasetRef)(
              onPickDataset,
              "Only CSV, XLS, and XLSX files are allowed.",
            )}
            onClear={() => {
              setTouched((p) => ({ ...p, dataset: true }));
              syncFileToNativeInput(datasetRef);
              onPickDataset();
            }}
          />

          <div className="ecl-u-flex-grow-1" style={{ minWidth: 320 }}>
            <div
              key={`dataset-${resetKeys.dataset}`}
              className="ecl-form-group"
              data-ecl-file-upload-group="true"
              data-ecl-auto-init="FileUpload"
            >
              <label
                htmlFor={IDS.dataset.input}
                id={IDS.dataset.label}
                className="ecl-form-label"
              >
                Calculator/Dataset (CSV/XLS/XLSX){" "}
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
          </div>
        </div>

        {hasDatasetFile && (
          <div className="ecl-form-group ecl-u-mb-l">
            <label
              htmlFor={IDS.datasetLanguage.input}
              className="ecl-form-label"
            >
              Dataset language{" "}
              <span
                className="ecl-form-label__required"
                role="note"
                aria-label="required"
              >
                *
              </span>
            </label>

            <div className="ecl-select__container ecl-select__container--m ecl-u-width-100 sm:w-125!">
              <select
                id={IDS.datasetLanguage.input}
                className="ecl-select"
                value={data.metadata.dataset_language_code ?? "en"}
                onChange={(e) =>
                  setMetadata({ dataset_language_code: e.target.value })
                }
                required
                data-ecl-auto-init="Select"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>

              <div className="ecl-select__icon">
                <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs" />
              </div>
            </div>
          </div>
        )}
        <hr className="ecl-separator ecl-u-mb-m" />

        <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-start gap-3 ecl-u-mb-l">
          <SingleFileDropzone
            className="w-full sm:w-125"
            label="Drag and drop PNG/JPG file here, or click to select"
            accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }}
            file={data.files.file_logo}
            error={logoError}
            onDropFile={handleDrop("logo", logoRef)(
              onPickLogo,
              "Only PNG/JPG/JPEG files are allowed.",
            )}
            onClear={() => {
              setTouched((p) => ({ ...p, logo: true }));
              syncFileToNativeInput(logoRef);
              onPickLogo();
            }}
          />

          <div className="ecl-u-flex-grow-1" style={{ minWidth: 320 }}>
            <div
              key={`logo-${resetKeys.logo}`}
              className="ecl-form-group"
              data-ecl-file-upload-group="true"
              data-ecl-auto-init="FileUpload"
            >
              <label
                htmlFor={IDS.logo.input}
                id={IDS.logo.label}
                className="ecl-form-label"
              >
                Case Study Logo{" "}
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
                ref={logoRef}
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
          </div>
        </div>
      </div>
    </>
  );
}
