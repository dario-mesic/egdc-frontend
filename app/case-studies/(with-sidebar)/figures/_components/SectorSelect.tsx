"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import { useReferenceData } from "@/app/case-studies/_context/ReferenceDataContext";

type Props = {
  selected: string;
  onPendingChange?: (p: boolean) => void;
};

export default function SectorSelect({ selected, onPendingChange }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sectors } = useReferenceData();

  const [isPending, startTransition] = useTransition();

  const [localValue, setLocalValue] = useState(selected);

  useEffect(() => {
    setLocalValue(selected);
  }, [selected]);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  const options = useMemo(
    () => [{ code: "all", label: "All" }, ...(sectors ?? [])],
    [sectors],
  );

  const handleChange = (value: string) => {
    setLocalValue(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("sector");
    else params.set("sector", value);

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  return (
    <div className="ecl-form-group ecl-u-mb-m">
      <label htmlFor="sector-select" className="ecl-form-label">
        Sector
      </label>

      <div className="ecl-select__container ecl-select__container--m">
        <select
          id="sector-select"
          className="ecl-select"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          data-ecl-auto-init="Select"
          aria-busy={isPending}
        >
          {options.map((s) => (
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
  );
}
