"use client";

import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";

export const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "custodian", label: "Custodian" },
  { value: "data_owner", label: "Data owner" },
];

type RoleSelectProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  "aria-label": string;
  className?: string;
}>;

export default function RoleSelect({
  value,
  onChange,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  className,
}: RoleSelectProps) {
  return (
    <div
      className={`ecl-select__container ecl-select__container--m ecl-u-width-100 ${className ?? ""}`.trim()}
      style={className ? undefined : { minWidth: "8rem" }}
    >
      <select
        id={id}
        className="ecl-select"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        data-ecl-auto-init="Select"
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="ecl-select__icon">
        <ClientIcon className="wt-icon-ecl--corner-arrow-down ecl-icon ecl-icon--xs" />
      </div>
    </div>
  );
}
