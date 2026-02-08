"use client";

import { useEffect, useMemo, useState } from "react";
import WizardShell from "../wizard/WizardShell";
import {
  uploadStepCount,
  uploadStepDefs,
  uploadStepComponents,
} from "../steps/index";
import type { ReferenceData } from "../../../../../_types/referenceData";
import { ReferenceDataProvider } from "../../_context/ReferenceDataContext";
import {
  WizardDataProvider,
  useWizardData,
} from "../../_context/WizardDataContext";
import { wizardPayloadSchema } from "../../_lib/schemas/caseStudy";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from "../../_lib/schemas/steps";
import Notification from "@/app/case-studies/_components/Notification";
import Modal from "../Modal";
import CaseStudyDetails from "@/app/case-studies/_components/CaseStudyDetails";
import { API_BASE } from "@/app/case-studies/_lib/api";
import { useRouter } from "next/navigation";
import { CaseStudyDetail } from "@/app/case-studies/_types/caseStudyDetail";

type AsyncState<T extends string> =
  | "idle"
  | T
  | "success"
  | "error"
  | "loading";

type SubmitState = AsyncState<"submitting">;
type PreviewState = AsyncState<"previewing">;

type WizardInnerProps = Readonly<{
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  maxUnlockedStep: number;
  setMaxUnlockedStep: React.Dispatch<React.SetStateAction<number>>;
}>;

function WizardInner({
  activeStep,
  setActiveStep,
  maxUnlockedStep,
  setMaxUnlockedStep,
}: WizardInnerProps) {
  const router = useRouter();
  const { data } = useWizardData();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>("idle");
  const [previewError, setPreviewError] = useState("");
  const [previewCs, setPreviewCs] = useState<CaseStudyDetail | null>(null);
  const isLast = activeStep === uploadStepCount;

  const stepSchemaMap = useMemo(() => {
    return {
      1: step1Schema,
      2: step2Schema,
      3: step3Schema,
      4: step4Schema,
      5: step5Schema,
      6: null,
    } as const;
  }, []);

  const isCurrentStepValid = useMemo(() => {
    if (activeStep === 6) {
      const hasLogo = !!data.files.file_logo;
      const hasMethod = !!data.files.file_methodology;
      const hasDataset = !!data.files.file_dataset;
      return hasLogo && hasMethod && hasDataset;
    }

    const schema = stepSchemaMap[activeStep as 1 | 2 | 3 | 4 | 5];
    if (!schema) return true;

    return schema.safeParse(data.metadata).success;
  }, [activeStep, data.metadata, data.files, stepSchemaMap]);

  const previewLogoUrl = useMemo(() => {
    if (!data.files.file_logo) return null;
    return URL.createObjectURL(data.files.file_logo);
  }, [data.files.file_logo]);

  useEffect(() => {
    return () => {
      if (previewLogoUrl) URL.revokeObjectURL(previewLogoUrl);
    };
  }, [previewLogoUrl]);

  function buildFormData(parsed: {
    metadata: any;
    files: {
      file_logo: File;
      file_methodology?: File | null;
      file_dataset?: File | null;
    };
  }) {
    const fd = new FormData();
    fd.append("metadata", JSON.stringify(parsed.metadata));
    fd.append("file_logo", parsed.files.file_logo);

    if (parsed.files.file_methodology) {
      fd.append("file_methodology", parsed.files.file_methodology);
    }
    if (parsed.files.file_dataset) {
      fd.append("file_dataset", parsed.files.file_dataset);
    }
    return fd;
  }

  async function handleNext() {
    if (!isCurrentStepValid) return;

    if (!isLast) {
      const next = Math.min(uploadStepCount, activeStep + 1);
      setMaxUnlockedStep((m) => Math.max(m, next));
      setActiveStep(next);
      return;
    }

    const parsed = wizardPayloadSchema.safeParse({
      metadata: data.metadata,
      files: data.files,
    });

    if (!parsed.success) {
      return;
    }

    const fd = buildFormData(parsed.data);

    setSubmitState("submitting");
    setSubmitError("");

    try {
      const res = await fetch("/api/case-studies", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        setSubmitState("error");
        setSubmitError(txt || "Failed to create case study. Please try again.");
        return;
      }
      sessionStorage.setItem("case-study-created", "1");

      globalThis.location.replace("/case-studies");
    } catch (e) {
      setSubmitState("error");
      setSubmitError(
        e instanceof Error ? e.message : "Network error. Please try again.",
      );
    }
  }

  async function handlePreview() {
    if (!isCurrentStepValid) return;

    const parsed = wizardPayloadSchema.safeParse({
      metadata: data.metadata,
      files: data.files,
    });

    if (!parsed.success) return;

    setPreviewState("loading");
    setPreviewError("");
    setPreviewCs(null);

    try {
      const fd = buildFormData(parsed.data);

      const res = await fetch(`${API_BASE}/api/v1/case-studies/preview`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        setPreviewState("error");
        setPreviewError(txt || "Failed to generate preview.");
        return;
      }

      const json = (await res.json()) as CaseStudyDetail;
      const fixed: CaseStudyDetail = {
        ...json,

        logo: previewLogoUrl
          ? {
              id: json.logo?.id ?? -1,
              alt_text: json.logo?.alt_text ?? json.title ?? null,
              url: previewLogoUrl,
            }
          : (json.logo ?? null),
      };
      setPreviewCs(fixed);
      setPreviewState("success");

      (
        document.getElementById(
          "cs-preview-modal-toggle",
        ) as HTMLButtonElement | null
      )?.click();
    } catch (e) {
      setPreviewState("error");
      setPreviewError(e instanceof Error ? e.message : "Preview failed.");
    }
  }

  const isSubmitting = submitState === "submitting";
  let nextLabel = "Continue";

  if (isLast) nextLabel = previewState === "loading" ? "Preparing…" : "Preview";
  return (
    <>
      {submitState === "error" && (
        <Notification
          variant="error"
          title="Submission failed"
          description={submitError || "Something went wrong."}
          onClose={() => {
            setSubmitState("idle");
            setSubmitError("");
          }}
        />
      )}
      <Modal
        id="cs-preview-modal"
        title="Preview case study"
        triggerLabel="Preview"
        triggerClassName="hidden"
        modalClassName="w-[95vw]! min-w-0! max-w-none!"
        footer={
          <>
            <button
              className="ecl-button ecl-button--secondary ecl-modal__button"
              type="button"
              data-ecl-modal-close
              disabled={isSubmitting}
            >
              Back to edit
            </button>

            <button
              className="ecl-button ecl-button--primary ecl-modal__button"
              type="button"
              onClick={handleNext}
              disabled={!isCurrentStepValid || isSubmitting}
            >
              {isSubmitting ? "Submitting…" : "Confirm & submit"}
            </button>
          </>
        }
        isBlocking={isSubmitting}
      >
        {previewState === "loading" ? (
          <div className="ecl-u-pa-l">Generating preview…</div>
        ) : previewState === "error" ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-pa-l">
            {previewError || "Failed to generate preview."}
          </div>
        ) : previewCs ? (
          <CaseStudyDetails cs={previewCs} preview />
        ) : (
          <div className="ecl-u-pa-l">No preview available.</div>
        )}
      </Modal>
      <WizardShell
        steps={uploadStepDefs as any}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        maxUnlockedStep={maxUnlockedStep}
        footer={
          <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between">
            <button
              type="button"
              className="ecl-button ecl-button--secondary"
              onClick={() => setActiveStep((s) => Math.max(1, s - 1))}
              disabled={activeStep === 1 || isSubmitting}
            >
              Back
            </button>

            <div className="ecl-u-d-flex ecl-u-align-items-center gap-3">
              <button
                type="button"
                className="ecl-button ecl-button--primary"
                onClick={isLast ? handlePreview : handleNext}
                disabled={
                  !isCurrentStepValid ||
                  isSubmitting ||
                  previewState === "loading"
                }
                aria-disabled={
                  !isCurrentStepValid ||
                  isSubmitting ||
                  previewState === "loading"
                }
              >
                {nextLabel}
              </button>
            </div>
          </div>
        }
      >
        {uploadStepDefs.map((s) => {
          const Step = (uploadStepComponents as any)[s.id];
          const isActive = s.id === activeStep;

          return (
            <section
              key={s.id}
              hidden={!isActive}
              aria-hidden={!isActive}
              className={isActive ? "ecl-u-d-block" : "ecl-u-d-none"}
            >
              <Step />
            </section>
          );
        })}
      </WizardShell>
    </>
  );
}

type UploadWizardClientProps = Readonly<{
  referenceData: ReferenceData;
}>;

export default function UploadWizardClient({
  referenceData,
}: UploadWizardClientProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  return (
    <ReferenceDataProvider value={referenceData}>
      <WizardDataProvider>
        <WizardInner
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          maxUnlockedStep={maxUnlockedStep}
          setMaxUnlockedStep={setMaxUnlockedStep}
        />
      </WizardDataProvider>
    </ReferenceDataProvider>
  );
}
