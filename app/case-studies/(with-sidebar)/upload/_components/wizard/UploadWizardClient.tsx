"use client";

import { useEffect, useMemo, useState } from "react";
import WizardShell from "../wizard/WizardShell";
import {
  uploadStepCount,
  uploadStepDefs,
  uploadStepComponents,
} from "../steps/index";
import type { ReferenceData } from "../../../../_types/referenceData";
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
import { useRouter } from "next/navigation";

type SubmitState = "idle" | "submitting" | "success" | "error";

function WizardInner({
  activeStep,
  setActiveStep,
  maxUnlockedStep,
  setMaxUnlockedStep,
}: {
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  maxUnlockedStep: number;
  setMaxUnlockedStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const router = useRouter();
  const { data } = useWizardData();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
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

  const maxReachableStep = useMemo(() => {
    return isCurrentStepValid
      ? Math.min(uploadStepCount, activeStep + 1)
      : activeStep;
  }, [activeStep, isCurrentStepValid]);

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
      console.log(parsed.error.format());
      return;
    }

    const fd = new FormData();
    fd.append("metadata", JSON.stringify(parsed.data.metadata));

    fd.append("file_logo", parsed.data.files.file_logo);

    if (parsed.data.files.file_methodology) {
      fd.append("file_methodology", parsed.data.files.file_methodology);
    }
    if (parsed.data.files.file_dataset) {
      fd.append("file_dataset", parsed.data.files.file_dataset);
    }

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
      router.replace("/case-studies");
    } catch (e) {
      setSubmitState("error");
      setSubmitError("Network error. Please try again.");
    }
  }

  const isSubmitting = submitState === "submitting";
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
      <WizardShell
        steps={uploadStepDefs as any}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        maxReachableStep={maxReachableStep}
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
                onClick={handleNext}
                disabled={!isCurrentStepValid || isSubmitting}
                aria-disabled={!isCurrentStepValid || isSubmitting}
              >
                {isLast
                  ? isSubmitting
                    ? "Submitting…"
                    : "Submit"
                  : "Continue"}
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

export default function UploadWizardClient({
  referenceData,
}: {
  referenceData: ReferenceData;
}) {
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
