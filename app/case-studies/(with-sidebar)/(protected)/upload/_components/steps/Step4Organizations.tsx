"use client";

import { useEffect, useMemo, useState } from "react";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useReferenceData } from "../../_context/ReferenceDataContext";
import { useWizardData } from "../../_context/WizardDataContext";
import type { Organization } from "../../../../../_types/referenceData";
import { createOrganizationSchema } from "../../_lib/schemas/organization";
import Modal from "@/app/case-studies/(with-sidebar)/(protected)/upload/_components/Modal";

type FormState = {
  providedBy: string;
  fundedBy: string;
  usedBy: string;
};

function toIdOrUndefined(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const EMPTY_FORM = {
  name: "",
  description: "",
  website_url: "",
  sector_code: "",
  org_type_code: "",
};

type OrgFormState = {
  name: string;
  description: string;
  website_url: string;
  sector_code: string;
  org_type_code: string;
};

type Errors = Partial<Record<keyof OrgFormState, string>>;
type Touched = Partial<Record<keyof OrgFormState, boolean>>;

type AddOrganizationModalProps = Readonly<{
  onCreated: (org: Organization) => void;
}>;

function AddOrganizationModal({ onCreated }: AddOrganizationModalProps) {
  const { sectors, organization_types } = useReferenceData();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    website_url: "",
    sector_code: "",
    org_type_code: "",
  });

  const canSubmit =
    form.name.trim() && form.sector_code.trim() && form.org_type_code.trim();

  async function submit() {
    setError("");

    setTouched({
      name: true,
      description: true,
      website_url: true,
      sector_code: true,
      org_type_code: true,
    });

    if (Object.keys(errors).length > 0) return;

    const parsed = createOrganizationSchema.safeParse({
      name: form.name,
      description: form.description || null,
      website_url: form.website_url || null,
      sector_code: form.sector_code,
      org_type_code: form.org_type_code,
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Please check the form fields.",
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        setError((await res.text()) || "Failed to create organization.");
        return;
      }

      const created: Organization = await res.json();
      onCreated(created);

      const dialog = document.getElementById(`add-org-modal-modal`);
      const closeBtn = dialog?.querySelector(
        "[data-ecl-modal-close]",
      ) as HTMLButtonElement | null;
      closeBtn?.click();
    } catch {
      setError("Network error while creating organization.");
    } finally {
      setSaving(false);
    }
  }

  const reset = () => {
    setError("");
    setSaving(false);
    setForm({ ...EMPTY_FORM });
  };

  const [touched, setTouched] = useState<Touched>({});

  const touch = (k: keyof OrgFormState) =>
    setTouched((p) => ({ ...p, [k]: true }));

  const errors = useMemo<Errors>(() => {
    const e: Errors = {};

    if (!form.name.trim()) e.name = "Name is required.";
    else if (form.name.length > 80) e.name = "Maximum 80 characters.";

    if (form.description.trim() && form.description.length > 160)
      e.description = "Maximum 160 characters.";

    if (form.website_url.trim()) {
      try {
        new URL(form.website_url.trim());
      } catch {
        e.website_url = "Website URL must be a valid URL.";
      }
    }

    if (!form.sector_code.trim()) e.sector_code = "Sector is required.";
    if (!form.org_type_code.trim())
      e.org_type_code = "Organization type is required.";

    return e;
  }, [form]);

  const showError = (k: keyof OrgFormState) =>
    touched[k] ? errors[k] : undefined;

  return (
    <Modal
      id="add-org-modal"
      title="Add organization"
      triggerLabel="+ Add organization"
      footer={
        <>
          <button
            className="ecl-button ecl-button--secondary ecl-modal__button"
            type="button"
            data-ecl-modal-close
            disabled={saving}
          >
            Close
          </button>

          <button
            className="ecl-button ecl-button--primary ecl-modal__button"
            type="button"
            onClick={submit}
            disabled={!canSubmit || saving}
            aria-disabled={!canSubmit || saving}
          >
            {saving ? "Saving…" : "Submit"}
          </button>
        </>
      }
      onOpen={reset}
    >
      {error ? (
        <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mb-m">
          {error}
        </div>
      ) : null}

      <div className="ecl-form-group ecl-u-mb-m">
        <label htmlFor="org-name" className="ecl-form-label">
          Name{" "}
          <span
            className="ecl-form-label__required"
            role="note"
            aria-label="required"
          >
            *
          </span>
        </label>
        <div className="ecl-help-block" id="org-name-helper">
          Max. 80 characters ({form.name.length}/80)
        </div>
        <input
          id="org-name"
          className="ecl-text-input ecl-u-width-100"
          maxLength={80}
          value={form.name}
          required
          disabled={saving}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          onBlur={() => touch("name")}
          aria-describedby="org-name-helper"
        />
        {showError("name") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("name")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label htmlFor="org-description" className="ecl-form-label">
          Description
        </label>
        <div className="ecl-help-block" id="org-description-helper">
          Max. 160 characters ({form.description.length}/160)
        </div>
        <textarea
          id="org-description"
          className="ecl-text-area ecl-u-width-100"
          maxLength={160}
          rows={4}
          value={form.description}
          disabled={saving}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          onBlur={() => touch("description")}
          aria-describedby="org-description-helper"
        />
        {showError("description") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("description")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label htmlFor="org-website-url" className="ecl-form-label">
          Website URL
        </label>
        <input
          id="org-website-url"
          type="url"
          className="ecl-text-input ecl-u-width-100"
          value={form.website_url}
          disabled={saving}
          onChange={(e) =>
            setForm((p) => ({ ...p, website_url: e.target.value }))
          }
          onBlur={() => touch("website_url")}
        />
        {showError("website_url") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("website_url")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label htmlFor="org-sector" className="ecl-form-label">
          Sector{" "}
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
            id="org-sector"
            className="ecl-select"
            value={form.sector_code}
            required
            disabled={saving}
            onChange={(e) =>
              setForm((p) => ({ ...p, sector_code: e.target.value }))
            }
            onBlur={() => touch("sector_code")}
            data-ecl-auto-init="Select"
          >
            <option value="" disabled>
              Select sector…
            </option>
            {sectors.map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="ecl-select__icon">
            <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs" />
          </div>
        </div>
        {showError("sector_code") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("sector_code")}
          </div>
        ) : null}
      </div>

      <div className="ecl-form-group">
        <label htmlFor="org-org-type" className="ecl-form-label">
          Organization type{" "}
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
            id="org-org-type"
            className="ecl-select"
            value={form.org_type_code}
            required
            disabled={saving}
            onChange={(e) =>
              setForm((p) => ({ ...p, org_type_code: e.target.value }))
            }
            onBlur={() => touch("org_type_code")}
            data-ecl-auto-init="Select"
          >
            <option value="" disabled>
              Select type…
            </option>
            {organization_types.map((t) => (
              <option key={t.code} value={t.code}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="ecl-select__icon">
            <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs" />
          </div>
        </div>
        {showError("org_type_code") ? (
          <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
            {showError("org_type_code")}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default function Step4Organizations() {
  const { organizations } = useReferenceData();
  const { data, setMetadata } = useWizardData();

  const [orgs, setOrgs] = useState<Organization[]>(organizations);

  const [form, setForm] = useState<FormState>({
    providedBy: "",
    fundedBy: "",
    usedBy: "",
  });

  const [touchedProvided, setTouchedProvided] = useState(false);

  useEffect(() => {
    setForm({
      providedBy: data.metadata.provider_org_id
        ? String(data.metadata.provider_org_id)
        : "",
      fundedBy: data.metadata.funder_org_id
        ? String(data.metadata.funder_org_id)
        : "",
      usedBy: data.metadata.used_by_org_id
        ? String(data.metadata.used_by_org_id)
        : "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOrgs(organizations);
  }, [organizations]);

  useEffect(() => {
    globalThis.ECL?.autoInit?.();
  }, []);

  const orgOptions = useMemo(
    () => [...orgs].sort((a, b) => a.name.localeCompare(b.name)),
    [orgs],
  );

  const providedError =
    touchedProvided && !form.providedBy
      ? "Provided By is required."
      : undefined;

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Organizations (Links)</h2>
      <p className="ecl-u-type-paragraph ecl-u-mb-l">
        If you do not find the organization you are looking for in the list, you
        can add it using the <strong>“Add organization”</strong> option below.
      </p>
      <div className="w-full max-w-2xl lg:max-w-4xl">
        <div className="ecl-form-group ecl-u-mb-m">
          <label htmlFor="cs-provided-by" className="ecl-form-label">
            Provided By{" "}
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
              id="cs-provided-by"
              className="ecl-select"
              value={form.providedBy}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, providedBy: v }));
                setMetadata({ provider_org_id: toIdOrUndefined(v) });
              }}
              onBlur={() => setTouchedProvided(true)}
              required
              data-ecl-auto-init="Select"
            >
              <option value="" disabled>
                Select provided by...
              </option>
              {orgOptions.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.name}
                </option>
              ))}
            </select>

            <div className="ecl-select__icon">
              <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
            </div>
          </div>

          {providedError ? (
            <div className="ecl-feedback-message ecl-feedback-message--error ecl-u-mt-2xs">
              {providedError}
            </div>
          ) : null}
        </div>

        <div className="ecl-form-group ecl-u-mb-m">
          <label htmlFor="cs-funded-by" className="ecl-form-label">
            Funded By
          </label>

          <div className="ecl-select__container ecl-select__container--m">
            <select
              id="cs-funded-by"
              className="ecl-select"
              value={form.fundedBy}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, fundedBy: v }));
                setMetadata({ funder_org_id: toIdOrUndefined(v) });
              }}
              data-ecl-auto-init="Select"
            >
              <option value="">-</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.name}
                </option>
              ))}
            </select>

            <div className="ecl-select__icon">
              <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
            </div>
          </div>
        </div>

        <div className="ecl-form-group ecl-u-mb-m">
          <label htmlFor="cs-used-by" className="ecl-form-label">
            Used By
          </label>

          <div className="ecl-select__container ecl-select__container--m">
            <select
              id="cs-used-by"
              className="ecl-select"
              value={form.usedBy}
              onChange={(e) => {
                const v = e.target.value;
                setForm((p) => ({ ...p, usedBy: v }));
                setMetadata({ used_by_org_id: toIdOrUndefined(v) });
              }}
              data-ecl-auto-init="Select"
            >
              <option value="">-</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.name}
                </option>
              ))}
            </select>

            <div className="ecl-select__icon">
              <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
            </div>
          </div>
        </div>
      </div>

      <AddOrganizationModal
        onCreated={(org) => {
          setOrgs((prev) =>
            prev.some((p) => p.id === org.id) ? prev : [...prev, org],
          );
          setForm((p) => ({ ...p, providedBy: String(org.id) }));
          setMetadata({ provider_org_id: org.id });
        }}
      />
    </>
  );
}
