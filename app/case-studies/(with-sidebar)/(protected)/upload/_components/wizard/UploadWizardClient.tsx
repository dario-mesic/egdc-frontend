"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import WizardShell from "../wizard/WizardShell";
import {
  uploadStepCount,
  uploadStepDefs,
  uploadStepComponents,
} from "../steps/index";
import type { Organization } from "../../../../../_types/referenceData";
import {
  ReferenceDataProvider,
  useReferenceData,
} from "../../../../../_context/ReferenceDataContext";
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
import { caseStudyDetailToMetadata } from "../../_lib/caseStudyToMetadata";
import Notification from "@/app/case-studies/_components/Notification";
import Modal from "../Modal";
import CaseStudyDetails from "@/app/case-studies/_components/CaseStudyDetails";
import { CaseStudyDetail } from "@/app/case-studies/_types/caseStudyDetail";
import {
  getStoredAccessToken,
  getStoredRole,
  clearAuthAndRedirect,
  isCredentialsError,
} from "@/app/case-studies/_lib/auth";
import ConfirmDialog from "@/app/case-studies/_components/ConfirmDialog";

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
  editId: number | null;
}>;

function buildFormData(parsed: {
  metadata: Record<string, unknown> & { status?: string };
  files: {
    file_logo: File;
    file_methodology: File;
    file_dataset: File;
    file_additional_document?: File;
  };
}) {
  const fd = new FormData();
  fd.append("metadata", JSON.stringify(parsed.metadata));
  fd.append("file_logo", parsed.files.file_logo);

  fd.append("file_methodology", parsed.files.file_methodology);
  fd.append(
    "methodology_language",
    String(parsed.metadata.methodology_language_code ?? ""),
  );

  fd.append("file_dataset", parsed.files.file_dataset);
  fd.append(
    "dataset_language",
    String(parsed.metadata.dataset_language_code ?? ""),
  );

  if (parsed.files.file_additional_document) {
    fd.append(
      "file_additional_document",
      parsed.files.file_additional_document,
    );
    fd.append(
      "additional_document_language",
      String(parsed.metadata.additional_language_code ?? ""),
    );
  }

  return fd;
}

type PartialWizardFiles = {
  file_logo?: File;
  file_methodology?: File;
  file_dataset?: File;
  file_additional_document?: File;
};

function sanitizeDraftMetadata(
  metadata: Record<string, unknown>,
  _editId: number | null,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...metadata, status: "draft" };
  if (Array.isArray(out.benefits)) {
    out.benefits = (out.benefits as Record<string, unknown>[]).map((b) => {
      const raw = b.value;
      const value =
        typeof raw === "number" && Number.isInteger(raw)
          ? raw
          : typeof raw === "string"
            ? parseInt(raw, 10) || 0
            : 0;
      return {
        ...b,
        value,
        type_code: b.type_code ?? "",
        name: b.name ?? "",
        unit_code: b.unit_code ?? "",
        functional_unit: b.functional_unit ?? "",
      };
    });
  }
  if (Array.isArray(out.addresses)) {
    out.addresses = (out.addresses as Record<string, unknown>[]).map((a) => ({
      admin_unit_l1: a.admin_unit_l1 ?? "",
      post_name: a.post_name ?? "",
    }));
  }
  return out;
}

function buildDraftFormData(
  metadata: Record<string, unknown>,
  files: PartialWizardFiles,
  editId: number | null,
) {
  const fd = new FormData();
  const metaWithDraft = sanitizeDraftMetadata(metadata, editId);
  fd.append("metadata", JSON.stringify(metaWithDraft));

  if (files.file_logo) fd.append("file_logo", files.file_logo);
  if (files.file_methodology) {
    fd.append("file_methodology", files.file_methodology);
    const lang = (metadata.methodology_language_code as string) ?? "";
    if (lang) fd.append("methodology_language", lang);
  }
  if (files.file_dataset) {
    fd.append("file_dataset", files.file_dataset);
    const lang = (metadata.dataset_language_code as string) ?? "";
    if (lang) fd.append("dataset_language", lang);
  }
  if (files.file_additional_document) {
    fd.append("file_additional_document", files.file_additional_document);
    const lang = (metadata.additional_language_code as string) ?? "";
    if (lang) fd.append("additional_document_language", lang);
  }

  return fd;
}

type WizardData = {
  metadata: Record<string, unknown>;
  files: Record<string, File | undefined>;
};

function serializeForDirtyCheck(d: WizardData) {
  const fileInfo: Record<string, string> = {};
  for (const [k, v] of Object.entries(d.files)) {
    if (v) fileInfo[k] = v.name + ":" + v.size;
  }
  return JSON.stringify({ m: d.metadata, f: fileInfo });
}

function WizardInner({
  activeStep,
  setActiveStep,
  maxUnlockedStep,
  setMaxUnlockedStep,
  editId,
}: WizardInnerProps) {
  const {
    data,
    setMetadata,
    setEditDataLoadedAt,
    editDataLoadedAt,
    rejectionComment,
    setRejectionComment,
  } = useWizardData();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [previewState, setPreviewState] = useState<PreviewState>("idle");
  const [previewError, setPreviewError] = useState("");
  const [previewCs, setPreviewCs] = useState<CaseStudyDetail | null>(null);
  const [editLoadError, setEditLoadError] = useState("");
  const editPrefilledRef = useRef(false);
  const isLast = activeStep === uploadStepCount;

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [pendingLeaveUrl, setPendingLeaveUrl] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const initialSnapshotRef = useRef("");
  const dataRef = useRef(data);
  dataRef.current = data;
  const intentionalNavRef = useRef(false);

  useEffect(() => {
    if (!editId || editPrefilledRef.current) return;
    const token = getStoredAccessToken();
    if (!token) return;
    editPrefilledRef.current = true;
    setEditLoadError("");
    fetch(`/api/case-studies/${editId}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (
          res.status === 401 ||
          res.status === 403 ||
          isCredentialsError((data as { error?: string })?.error)
        ) {
          clearAuthAndRedirect();
          return;
        }
        if (!res.ok) throw new Error("Failed to load case study");
        return data as CaseStudyDetail;
      })
      .then((json) => {
        if (json == null) return;
        setMetadata(caseStudyDetailToMetadata(json));
        const comment = (json as { rejection_comment?: string | null })
          .rejection_comment;
        setRejectionComment(
          typeof comment === "string" && comment.trim()
            ? comment.trim()
            : null,
        );
        setEditDataLoadedAt(Date.now());
      })
      .catch(() => setEditLoadError("Failed to load case study for editing."));
  }, [editId, setMetadata, setEditDataLoadedAt, setRejectionComment]);

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

  // --- Unsaved-changes navigation guard ---

  const checkDirty = () => {
    if (!initialSnapshotRef.current) return false;
    return (
      serializeForDirtyCheck(dataRef.current) !== initialSnapshotRef.current
    );
  };

  useEffect(() => {
    if (editId && editDataLoadedAt === 0) return;
    initialSnapshotRef.current = serializeForDirtyCheck(dataRef.current);
  }, [editId, editDataLoadedAt]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (intentionalNavRef.current) return;
      if (checkDirty()) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    history.pushState(null, "", location.href);

    const handler = () => {
      if (intentionalNavRef.current) return;
      if (checkDirty()) {
        history.pushState(null, "", location.href);
        setPendingLeaveUrl(null);
        setLeaveDialogOpen(true);
      } else {
        intentionalNavRef.current = true;
        history.back();
      }
    };

    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (intentionalNavRef.current) return;
      const anchor = (e.target as HTMLElement).closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        href.startsWith("/case-studies/upload")
      )
        return;
      if (checkDirty()) {
        e.preventDefault();
        e.stopPropagation();
        setPendingLeaveUrl(href);
        setLeaveDialogOpen(true);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  function handleLeave() {
    intentionalNavRef.current = true;
    setLeaveDialogOpen(false);
    globalThis.location.replace(pendingLeaveUrl || "/case-studies/my");
  }

  async function handleSaveDraftAndLeave() {
    setIsSavingDraft(true);
    try {
      const token = getStoredAccessToken();
      if (!token) {
        setIsSavingDraft(false);
        setLeaveDialogOpen(false);
        setSubmitState("error");
        setSubmitError("You are not logged in.");
        return;
      }
      const fd = buildDraftFormData(
        dataRef.current.metadata,
        dataRef.current.files,
        editId,
      );
      const url = editId
        ? `/api/case-studies/${editId}`
        : "/api/case-studies";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const txt = await res.text();
      const errData = (() => {
        try {
          return JSON.parse(txt) as { error?: string };
        } catch {
          return {};
        }
      })();
      if (
        res.status === 401 ||
        res.status === 403 ||
        isCredentialsError(errData?.error ?? txt)
      ) {
        clearAuthAndRedirect();
        return;
      }
      if (!res.ok) {
        setIsSavingDraft(false);
        setLeaveDialogOpen(false);
        setSubmitState("error");
        setSubmitError(
          errData?.error ?? (txt || "Failed to save draft."),
        );
        return;
      }
      sessionStorage.setItem("case-study-draft-saved", "1");
      intentionalNavRef.current = true;
      setLeaveDialogOpen(false);
      globalThis.location.replace(pendingLeaveUrl || "/case-studies/my");
    } catch (e) {
      setIsSavingDraft(false);
      setLeaveDialogOpen(false);
      setSubmitState("error");
      setSubmitError(
        e instanceof Error ? e.message : "Network error. Please try again.",
      );
    }
  }

  async function handleSaveDraft() {
    const fd = buildDraftFormData(data.metadata, data.files, editId);
    setSubmitState("submitting");
    setSubmitError("");

    try {
      const token = getStoredAccessToken();
      if (!token) {
        setSubmitState("error");
        setSubmitError("You are not logged in.");
        return;
      }
      const url = editId ? `/api/case-studies/${editId}` : "/api/case-studies";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const txt = await res.text();
      const errData = (() => {
        try {
          return JSON.parse(txt) as { error?: string };
        } catch {
          return {};
        }
      })();
      if (
        res.status === 401 ||
        res.status === 403 ||
        isCredentialsError(errData?.error ?? txt)
      ) {
        clearAuthAndRedirect();
        return;
      }
      if (!res.ok) {
        setSubmitState("error");
        setSubmitError(errData?.error ?? (txt || "Failed to save draft."));
        return;
      }
      sessionStorage.setItem("case-study-draft-saved", "1");
      intentionalNavRef.current = true;
      globalThis.location.replace("/case-studies/my");
    } catch (e) {
      setSubmitState("error");
      setSubmitError(
        e instanceof Error ? e.message : "Network error. Please try again.",
      );
    }
  }

  async function handleNext() {
    if (!isCurrentStepValid) return;

    if (!isLast) {
      const next = Math.min(uploadStepCount, activeStep + 1);
      setMaxUnlockedStep((m) => Math.max(m, next));
      setActiveStep(next);
      return;
    }

    const submitStatus =
      getStoredRole() === "data_owner" ? "pending_approval" : "published";
    const parsed = wizardPayloadSchema.safeParse({
      metadata: { ...data.metadata, status: submitStatus },
      files: data.files,
    });

    if (!parsed.success) {
      return;
    }

    const fd = buildFormData(parsed.data);

    setSubmitState("submitting");
    setSubmitError("");

    try {
      const token = getStoredAccessToken();
      if (!token) {
        setSubmitState("error");
        setSubmitError("You are not logged in.");
        return;
      }
      const url = editId ? `/api/case-studies/${editId}` : "/api/case-studies";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const txt = await res.text();
      const errData = (() => {
        try {
          return JSON.parse(txt) as { error?: string };
        } catch {
          return {};
        }
      })();
      if (
        res.status === 401 ||
        res.status === 403 ||
        isCredentialsError(errData?.error ?? txt)
      ) {
        clearAuthAndRedirect();
        return;
      }
      if (!res.ok) {
        setSubmitState("error");
        setSubmitError(
          errData?.error ??
            (txt ||
              (editId
                ? "Failed to update case study. Please try again."
                : "Failed to create case study. Please try again.")),
        );
        return;
      }
      sessionStorage.setItem("case-study-created", "1");
      intentionalNavRef.current = true;
      globalThis.location.replace("/case-studies/my");
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

      const res = await fetch("/api/case-studies/preview", {
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

  let previewBody: React.ReactNode = (
    <div className="ecl-u-pa-l">No preview available.</div>
  );

  if (previewState === "loading") {
    previewBody = <div className="ecl-u-pa-l">Generating preview…</div>;
  } else if (previewState === "error") {
    previewBody = (
      <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-pa-l">
        {previewError || "Failed to generate preview."}
      </div>
    );
  } else if (previewCs) {
    previewBody = <CaseStudyDetails cs={previewCs} preview />;
  }
  return (
    <>
      {editLoadError && (
        <Notification
          variant="error"
          title="Cannot load for editing"
          description={editLoadError}
          onClose={() => setEditLoadError("")}
        />
      )}
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
        {previewBody}
      </Modal>
      <WizardShell
        steps={uploadStepDefs as any}
        activeStep={activeStep}
        onStepChange={setActiveStep}
        maxUnlockedStep={maxUnlockedStep}
        rejectionComment={rejectionComment}
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
                className="ecl-button ecl-button--secondary"
                onClick={handleSaveDraft}
                disabled={isSubmitting || previewState === "loading"}
                aria-disabled={isSubmitting || previewState === "loading"}
              >
                Save as draft
              </button>
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

      <ConfirmDialog
        open={leaveDialogOpen}
        title="Unsaved changes"
        cancelLabel="Leave"
        confirmLabel={isSavingDraft ? "Saving…" : "Save as Draft & Leave"}
        onClose={() => setLeaveDialogOpen(false)}
        onCancel={handleLeave}
        onConfirm={handleSaveDraftAndLeave}
        isBlocking={isSavingDraft}
      >
        <p>
          You have unsaved changes. Are you sure you want to leave this page?
        </p>
      </ConfirmDialog>
    </>
  );
}

type UploadWizardClientProps = Readonly<{
  organizations: Organization[];
}>;

function UploadWizardWithRefData({ organizations }: UploadWizardClientProps) {
  const searchParams = useSearchParams();
  const editParam = searchParams.get("edit");
  const editId =
    editParam != null && /^\d+$/.test(editParam)
      ? parseInt(editParam, 10)
      : null;
  const baseRefData = useReferenceData();
  const [activeStep, setActiveStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const referenceData = useMemo(
    () => ({ ...baseRefData, organizations }),
    [baseRefData, organizations],
  );
  return (
    <ReferenceDataProvider value={referenceData}>
      <WizardDataProvider>
        <WizardInner
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          maxUnlockedStep={maxUnlockedStep}
          setMaxUnlockedStep={setMaxUnlockedStep}
          editId={editId}
        />
      </WizardDataProvider>
    </ReferenceDataProvider>
  );
}

export default function UploadWizardClient(props: UploadWizardClientProps) {
  return <UploadWizardWithRefData {...props} />;
}
