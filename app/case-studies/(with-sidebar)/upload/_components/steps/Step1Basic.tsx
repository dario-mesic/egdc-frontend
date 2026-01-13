"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWizardData } from "../../_context/WizardDataContext";

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Errors = Partial<Record<keyof FormState, string>>;

type FormState = {
  title: string;
  shortDescription: string;
  longDescription: string;
  problemSolved: string;
  creationDate: string;
};

export default function Step1Basic() {
  const { data, setMetadata } = useWizardData();

  const [form, setForm] = useState<FormState>({
    title: "",
    shortDescription: "",
    longDescription: "",
    problemSolved: "",
    creationDate: todayISODate(),
  });

  const [touched, setTouched] = useState<
    Partial<Record<keyof FormState, boolean>>
  >({});

  const duetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMetadata({
      title: data.metadata.title ?? "",
      short_description: data.metadata.short_description ?? "",
      long_description: data.metadata.long_description ?? "",
      problem_solved: data.metadata.problem_solved ?? "",
      created_date: (data.metadata.created_date as string) ?? form.creationDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = duetRef.current as any;
    if (!el) return;

    try {
      el.value = form.creationDate;
    } catch {
      // ignore
    }

    const onDuetChange = (e: any) => {
      const value = e?.detail?.value;
      if (typeof value === "string") {
        setForm((p) => ({ ...p, creationDate: value }));
        setMetadata({ created_date: value });
      }
    };

    el.addEventListener("duetChange", onDuetChange);
    return () => el.removeEventListener("duetChange", onDuetChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};

    if (!form.title.trim()) e.title = "Title is required.";
    else if (form.title.length > 255) e.title = "Maximum 255 characters.";

    if (!form.shortDescription.trim())
      e.shortDescription = "Short description is required.";
    if (!form.longDescription.trim())
      e.longDescription = "Long description is required.";
    if (!form.problemSolved.trim())
      e.problemSolved = "Problem solved is required.";
    if (!form.creationDate) e.creationDate = "Creation date is required.";

    return e;
  }, [form]);

  const showError = (k: keyof FormState) =>
    touched[k] ? errors[k] : undefined;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const touch = (k: keyof FormState) =>
    setTouched((p) => ({ ...p, [k]: true }));

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Basic information</h2>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-title">
          Title <span className="ecl-u-type-color-error">*</span>
        </label>
        <input
          id="cs-title"
          className="ecl-text-input ecl-u-width-100"
          value={form.title}
          maxLength={255}
          onChange={(e) => {
            const v = e.target.value;
            set("title", v);
            setMetadata({ title: v });
          }}
          onBlur={() => touch("title")}
        />
        {showError("title") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("title")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-short">
          Short description <span className="ecl-u-type-color-error">*</span>
        </label>
        <textarea
          id="cs-short"
          className="ecl-text-area ecl-u-width-100"
          rows={3}
          value={form.shortDescription}
          onChange={(e) => {
            const v = e.target.value;
            set("shortDescription", v);
            setMetadata({ short_description: v });
          }}
          onBlur={() => touch("shortDescription")}
        />
        {showError("shortDescription") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("shortDescription")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-long">
          Long description <span className="ecl-u-type-color-error">*</span>
        </label>
        <textarea
          id="cs-long"
          className="ecl-text-area ecl-u-width-100"
          rows={6}
          value={form.longDescription}
          onChange={(e) => {
            const v = e.target.value;
            set("longDescription", v);
            setMetadata({ long_description: v });
          }}
          onBlur={() => touch("longDescription")}
        />
        {showError("longDescription") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("longDescription")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-problem">
          Problem solved <span className="ecl-u-type-color-error">*</span>
        </label>
        <textarea
          id="cs-problem"
          className="ecl-text-area ecl-u-width-100"
          rows={4}
          value={form.problemSolved}
          onChange={(e) => {
            const v = e.target.value;
            set("problemSolved", v);
            setMetadata({ problem_solved: v });
          }}
          onBlur={() => touch("problemSolved")}
        />
        {showError("problemSolved") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("problemSolved")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label" htmlFor="cs-creation-date">
          Creation date <span className="ecl-u-type-color-error">*</span>
        </label>

        <div
          className="ecl-datepicker ecl-u-width-100"
          data-ecl-auto-init="Datepicker"
          data-ecl-datepicker-toggle=""
        >
          <duet-date-picker
            ref={duetRef}
            identifier="cs-creation-date"
            value={form.creationDate}
          />
        </div>

        {showError("creationDate") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("creationDate")}
          </div>
        ) : null}
      </div>
    </>
  );
}
