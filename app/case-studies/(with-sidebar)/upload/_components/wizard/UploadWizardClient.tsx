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
import { useReferenceData } from "../../_context/ReferenceDataContext";
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

import { useRouter } from "next/navigation";
import { CaseStudyDetail } from "@/app/case-studies/_types/caseStudyDetail";

type SubmitState = "idle" | "submitting" | "success" | "error";

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
  const refData = useReferenceData();
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
      setSubmitError(
        e instanceof Error ? e.message : "Network error. Please try again.",
      );
    }
  }

  const logoUrl = useMemo(() => {
    if (!data.files.file_logo) return null;
    return URL.createObjectURL(data.files.file_logo);
  }, [data.files.file_logo]);

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const previewCs = useMemo<CaseStudyDetail>(() => {
    const md: any = data.metadata;

    const tech =
      md.tech ??
      (md.tech_code
        ? refData.technologies.find((t) => t.code === md.tech_code)
        : null) ??
      null;

    const calc_type =
      md.calc_type ??
      (md.calc_type_code
        ? refData.calculation_types.find((c) => c.code === md.calc_type_code)
        : null) ??
      null;

    const funding_type =
      md.funding_type ??
      (md.funding_type_code
        ? refData.funding_types.find((f) => f.code === md.funding_type_code)
        : null) ??
      null;

    const methodLang =
      (md.methodology_language_code &&
        refData.languages.find(
          (l) => l.code === md.methodology_language_code,
        )) ||
      refData.languages.find((l) => l.code === "en")!;

    const datasetLang =
      (md.dataset_language_code &&
        refData.languages.find((l) => l.code === md.dataset_language_code)) ||
      refData.languages.find((l) => l.code === "en")!;

    const addresses = (md.addresses ?? []).map((a: any, i: number) => ({
      id: a.id ?? -(i + 1),
      post_name: a.post_name ?? "",
      admin_unit_l1: a.admin_unit_l1 ?? "",
      case_study_id: -1,
    }));

    return {
      id: -1,
      title: md.title ?? "Untitled case study",
      short_description: md.short_description ?? null,

      tech_code: tech?.code ?? md.tech_code ?? null,
      calc_type_code: calc_type?.code ?? md.calc_type_code ?? null,
      funding_type_code: funding_type?.code ?? md.funding_type_code ?? null,

      logo_id: null,
      methodology_id: null,
      dataset_id: null,

      addresses,
      benefits: (md.benefits ?? []).map((b: any, i: number) => {
        const typeCode =
          b.type?.code ?? b.type_code ?? b.benefit_type_code ?? b.type ?? null;

        const unitCode =
          b.unit?.code ?? b.unit_code ?? b.benefit_unit_code ?? b.unit ?? null;

        const type =
          typeof typeCode === "string"
            ? (refData.benefit_types.find((t) => t.code === typeCode) ?? null)
            : null;

        const unit =
          typeof unitCode === "string"
            ? (refData.benefit_units.find((u) => u.code === unitCode) ?? null)
            : null;

        return {
          id: b.id ?? -(i + 1),
          name: b.name ?? "",
          value: Number(b.value ?? 0),
          type: type
            ? { code: type.code, label: type.label }
            : (b.type ?? null),
          unit: unit
            ? { code: unit.code, label: unit.label }
            : (b.unit ?? null),
        };
      }),

      is_provided_by: md.is_provided_by ?? [],
      is_funded_by: md.is_funded_by ?? [],
      is_used_by: md.is_used_by ?? [],

      long_description: md.long_description ?? null,
      problem_solved: md.problem_solved ?? null,
      created_date: md.created_date ?? null,

      tech,
      calc_type,
      funding_type,

      logo: logoUrl
        ? { id: -1, url: logoUrl, alt_text: md.title ?? null }
        : null,

      methodology: data.files.file_methodology
        ? {
            id: -1,
            name: data.files.file_methodology.name,
            url: "",
            language: methodLang,
          }
        : null,

      dataset: data.files.file_dataset
        ? {
            id: -1,
            name: data.files.file_dataset.name,
            url: "",
            language: datasetLang,
          }
        : null,
    };
  }, [
    data.metadata,
    data.files.file_methodology,
    data.files.file_dataset,
    logoUrl,
    refData.technologies,
    refData.benefit_types,
    refData.benefit_units,
    refData.calculation_types,
    refData.funding_types,
    refData.languages,
  ]);

  const isSubmitting = submitState === "submitting";
  let nextLabel = "Continue";

  if (isLast) nextLabel = "Preview";
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
        <CaseStudyDetails cs={previewCs} preview />
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
                onClick={
                  isLast
                    ? () => {
                        (
                          document.getElementById(
                            `cs-preview-modal-toggle`,
                          ) as HTMLButtonElement | null
                        )?.click();
                      }
                    : handleNext
                }
                disabled={!isCurrentStepValid || isSubmitting}
                aria-disabled={!isCurrentStepValid || isSubmitting}
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
