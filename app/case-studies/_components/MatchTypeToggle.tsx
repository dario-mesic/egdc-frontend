"use client";

import { useTransition, useOptimistic } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type MatchType = "partial" | "exact";

export default function MatchTypeToggle() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const matchType: MatchType =
    sp.get("match_type") === "partial" ? "partial" : "exact";

  const [optimisticMatchType, setOptimisticMatchType] = useOptimistic<
    MatchType,
    MatchType
  >(matchType, (_current, next) => next);

  const apply = (next: MatchType) => {
    const params = new URLSearchParams(sp.toString());
    params.set("match_type", next);
    params.delete("page");

    startTransition(() => {
      setOptimisticMatchType(next);
      router.replace(`?${params.toString()}`);
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
            checked={optimisticMatchType === "exact"}
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
            checked={optimisticMatchType === "partial"}
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
