"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MatchType = "partial" | "exact";
const KEY = "caseStudies.match_type";

export default function MatchTypeToggle() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const matchType: MatchType =
    sp.get("match_type") === "partial" ? "partial" : "exact";

  const apply = (next: MatchType) => {
    const params = new URLSearchParams(sp.toString());
    params.set("match_type", next);
    params.delete("page");

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <fieldset className="ecl-form-group ecl-u-mb-none" aria-busy={isPending}>
      <legend className="ecl-u-sr-only">Search match type</legend>
      <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center gap-4">
        <div className="ecl-radio">
          <input
            id="match-type-exact"
            name="match_type"
            className="ecl-radio__input"
            type="radio"
            value="exact"
            checked={matchType === "exact"}
            disabled={isPending}
            onChange={() => apply("exact")}
          />
          <label className="ecl-radio__label" htmlFor="match-type-exact">
            <span className="ecl-radio__box">
              <span className="ecl-radio__box-inner" />
            </span>
            <span className="ecl-radio__text">Exact match</span>
          </label>
        </div>
        <div className="ecl-radio">
          <input
            id="match-type-partial"
            name="match_type"
            className="ecl-radio__input"
            type="radio"
            value="partial"
            checked={matchType === "partial"}
            disabled={isPending}
            onChange={() => apply("partial")}
          />
          <label className="ecl-radio__label" htmlFor="match-type-partial">
            <span className="ecl-radio__box">
              <span className="ecl-radio__box-inner" />
            </span>
            <span className="ecl-radio__text">Partial match</span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}
