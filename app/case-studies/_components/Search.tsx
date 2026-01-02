"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import ClientIcon from "../_components/icons/ClientIcon";

export default function Search() {
  const router = useRouter();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  const apply = () => {
    const params = new URLSearchParams(sp.toString());

    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");

    params.delete("page");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <form
      className="ecl-search-form ecl-u-mt-m ecl-u-mt-xl-none"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <div className="ecl-form-group">
        <label
          htmlFor="search-input-id"
          id="search-input-id-label"
          className="ecl-form-label ecl-search-form__label"
        >
          Search
        </label>
        <input
          id="search-input-id"
          className="ecl-text-input ecl-text-input--m ecl-search-form__text-input"
          type="search"
          placeholder="Find a case study..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <button
        className="ecl-button ecl-button--tertiary ecl-search-form__button ecl-u-width-auto"
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
      >
        <span className="ecl-button__container">
          <ClientIcon className="wt-icon-ecl--search ecl-icon ecl-icon--xs ecl-button__icon" />
          <span className="ecl-button__label" data-ecl-label="true">
            {isPending ? "Searching…" : "Search"}
          </span>
        </span>
      </button>
    </form>
  );
}
