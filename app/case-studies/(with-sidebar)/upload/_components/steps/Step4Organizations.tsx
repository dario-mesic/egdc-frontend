"use client";

import { useEffect, useMemo, useState } from "react";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useReferenceData } from "../../_context/ReferenceDataContext";
import { useWizardData } from "../../_context/WizardDataContext";
import type { Organization } from "../../../../_types/referenceData";
import { createOrganizationSchema } from "../../_lib/schemas/organization";
import Modal from "@/app/case-studies/(with-sidebar)/upload/_components/Modal";

type FormState = {
  providedBy: string;
  fundedBy: string;
  usedBy: string;
};

function toIdOrUndefined(v: string): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const ADD_ORG_MODAL_ID = "add-org-modal";
const EMPTY_FORM = {
  name: "",
  description: "",
  website_url: "",
  sector_code: "",
  org_type_code: "",
};

function AddOrganizationModal({
  onCreated,
}: {
  onCreated: (org: Organization) => void;
}) {
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

    const parsed = createOrganizationSchema.safeParse({
      name: form.name,
      description: form.description || null,
      website_url: form.website_url || null,
      sector_code: form.sector_code,
      org_type_code: form.org_type_code,
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Please check the form fields."
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

      const dialog = document.getElementById(`${ADD_ORG_MODAL_ID}-modal`);
      const closeBtn = dialog?.querySelector(
        "[data-ecl-modal-close]"
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
    setForm({ ...EMPTY_FORM }); // ✅ new object
  };

  return (
    <Modal
      id={ADD_ORG_MODAL_ID}
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
        <label className="ecl-form-label">
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
          className="ecl-text-input ecl-u-width-100"
          value={form.name}
          disabled={saving}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label">Description</label>
        <textarea
          className="ecl-text-area ecl-u-width-100"
          rows={4}
          value={form.description}
          disabled={saving}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label">Website URL</label>
        <input
          type="url"
          className="ecl-text-input ecl-u-width-100"
          value={form.website_url}
          disabled={saving}
          onChange={(e) =>
            setForm((p) => ({ ...p, website_url: e.target.value }))
          }
        />
      </div>

      <div className="ecl-form-group ecl-u-mb-m">
        <label className="ecl-form-label">
          Sector
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
            className="ecl-select"
            value={form.sector_code}
            disabled={saving}
            onChange={(e) =>
              setForm((p) => ({ ...p, sector_code: e.target.value }))
            }
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
      </div>

      {/* Org type (required) */}
      <div className="ecl-form-group">
        <label className="ecl-form-label">
          Organization type
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
            className="ecl-select"
            value={form.org_type_code}
            disabled={saving}
            onChange={(e) =>
              setForm((p) => ({ ...p, org_type_code: e.target.value }))
            }
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
    if (typeof window !== "undefined" && (window as any).ECL?.autoInit) {
      (window as any).ECL.autoInit();
    }
  }, []);

  const orgOptions = useMemo(
    () => [...orgs].sort((a, b) => a.name.localeCompare(b.name)),
    [orgs]
  );

  const providedError =
    touchedProvided && !form.providedBy
      ? "Provided By is required."
      : undefined;

  return (
    <>
      <h2 className="ecl-u-type-heading-3 ecl-u-mb-m">Organizations (Links)</h2>

      <div className="ecl-form-group ecl-u-mb-m">
        <label htmlFor="cs-provided-by" className="ecl-form-label">
          Provided By
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

      <AddOrganizationModal
        onCreated={(org) => {
          setOrgs((prev) =>
            prev.some((p) => p.id === org.id) ? prev : [...prev, org]
          );
          setForm((p) => ({ ...p, providedBy: String(org.id) }));
          setMetadata({ provider_org_id: org.id });
        }}
      />
    </>
  );
}
