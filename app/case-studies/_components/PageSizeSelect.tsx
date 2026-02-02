"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import ClientIcon from "./icons/ClientIcon";

const OPTIONS = [5, 10, 15, 25];

export default function PageSizeSelect() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = Number(sp.get("limit") ?? "10");
  const value = Number.isFinite(current) && current > 0 ? current : 5;

  return (
    <div className="ecl-form-group ecl-u-mb-none">
      <div className="ecl-select__container ecl-select__container--m">
        <select
          id="page-size"
          className="ecl-select"
          name="limit"
          data-ecl-auto-init="Select"
          value={String(value)}
          disabled={isPending}
          aria-label="Items per page"
          onChange={(e) => {
            const next = e.target.value;
            const params = new URLSearchParams(sp.toString());

            params.set("limit", next);
            params.delete("page");

            startTransition(() => {
              router.push(`?${params.toString()}`);
            });
          }}
        >
          {OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <div className="ecl-select__icon">
          <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs " />
        </div>
      </div>
    </div>
  );
}
