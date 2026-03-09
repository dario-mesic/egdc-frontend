"use client";

import { useState } from "react";
import ClientIcon from "./icons/ClientIcon";

type PasswordInputProps = Readonly<
  Omit<React.ComponentProps<"input">, "type"> & {
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
>;

export default function PasswordInput({
  id,
  value,
  onChange,
  className = "",
  disabled,
  autoComplete,
  required,
  ...rest
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        id={id}
        type={showPassword ? "text" : "password"}
        className={`ecl-text-input ecl-u-width-100 pr-22! ${className}`.trim()}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        aria-describedby={rest["aria-describedby"]}
      />
      <button
        type="button"
        onClick={() => setShowPassword((p) => !p)}
        disabled={disabled}
        className="absolute right-0 top-1/2 -translate-y-1/2 ecl-u-pa-s ecl-u-d-flex ecl-u-align-items-center ecl-u-bg-transparent border-0 cursor-pointer text-inherit min-h-10 min-w-10 ecl-u-justify-content-center"
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
      >
        <ClientIcon
          className="wt-icon-ecl--eye ecl-icon wt-icon--s"
          aria-hidden
        />
        <span className="ecl-u-type-s ecl-u-ml-xs">
          {showPassword ? "Hide" : "Show"}
        </span>
      </button>
    </div>
  );
}
