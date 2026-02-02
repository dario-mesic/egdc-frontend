"use client";

import { useEffect, useId, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";

const OPTIONS = [
  {
    id: "date-desc",
    label: "Creation date (newest first)",
    sort_by: "created_date",
    sort_order: "desc",
  },
  {
    id: "date-asc",
    label: "Creation date (oldest first)",
    sort_by: "created_date",
    sort_order: "asc",
  },
  {
    id: "title-asc",
    label: "Title (A–Z)",
    sort_by: "title",
    sort_order: "asc",
  },
  {
    id: "title-desc",
    label: "Title (Z–A)",
    sort_by: "title",
    sort_order: "desc",
  },
] as const;

export default function SortPopover() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const popoverId = useId();
  const groupName = useId();

  const sortBy = (sp.get("sort_by") ?? "created_date") as
    | "created_date"
    | "title";
  const sortOrder = (sp.get("sort_order") ?? "desc") as "asc" | "desc";

  const selectedKey = `${sortBy}-${sortOrder}`;

  useEffect(() => {
    globalThis.ECL?.autoInit?.();
  }, []);

  const apply = (next: { sort_by: string; sort_order: string }) => {
    const params = new URLSearchParams(sp.toString());
    params.set("sort_by", next.sort_by);
    params.set("sort_order", next.sort_order);
    params.delete("page");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="ecl-popover" data-ecl-auto-init="Popover">
      <button
        className="ecl-button ecl-button--tertiary ecl-popover__toggle"
        type="button"
        aria-controls={popoverId}
        data-ecl-popover-toggle
        aria-expanded="false"
        disabled={isPending}
        aria-busy={isPending}
        aria-label="Sort"
      >
        <span className="ecl-button__container">
          <ClientIcon className="wt-icon--arrow-downup ecl-icon wt-icon--m ecl-button__icon ecl-u-mr-s" />
          Sort by
        </span>
      </button>

      <div id={popoverId} className="ecl-popover__container" hidden>
        <div className="ecl-popover__scrollable">
          <button
            className="ecl-button ecl-button--tertiary ecl-popover__close ecl-button--icon-only"
            type="button"
            data-ecl-popover-close
          >
            <span className="ecl-button__container">
              <span className="ecl-button__label" data-ecl-label="true">
                Close
              </span>
              <ClientIcon className="wt-icon--close ecl-icon ecl-icon--m ecl-button__icon" />
            </span>
          </button>

          <div className="ecl-popover__content">
            <fieldset className="ecl-form-group" aria-busy={isPending}>
              <legend className="ecl-u-sr-only">Sort options</legend>

              {OPTIONS.map((o) => {
                const value = `${o.sort_by}-${o.sort_order}`;
                const inputId = `${popoverId}-${o.id}`;

                return (
                  <div key={o.id} className="ecl-radio ecl-u-mb-xs">
                    <input
                      id={inputId}
                      name={groupName}
                      className="ecl-radio__input"
                      type="radio"
                      value={value}
                      checked={selectedKey === value}
                      disabled={isPending}
                      onChange={() =>
                        apply({ sort_by: o.sort_by, sort_order: o.sort_order })
                      }
                    />
                    <label className="ecl-radio__label" htmlFor={inputId}>
                      <span className="ecl-radio__box">
                        <span className="ecl-radio__box-inner" />
                      </span>
                      <span className="ecl-radio__text">{o.label}</span>
                    </label>
                  </div>
                );
              })}
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
