"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ClientIcon from "../../../_components/icons/ClientIcon";

type City = { name: string; count: number };

type CountryInfo = {
  iso2: string;
  iso3: string;
  country_label: string;
  cities: City[];
  total: number;
};

type PinnedState = { iso2: string; x: number; y: number };

function formatValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

type LegendItemProps = Readonly<{
  color: string;
  label: string;
}>;

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="ecl-u-d-flex ecl-u-align-items-center gap-2">
      <span
        className="h-4 w-4 rounded-sm ring-1 ring-black/10"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="tabular-nums">{label}</span>
    </div>
  );
}

type TooltipCardProps = Readonly<{
  country: CountryInfo;
  pinned: boolean;
  onClose?: () => void;
}>;

function TooltipCard({ country, pinned, onClose }: TooltipCardProps) {
  return (
    <div
      className="relative w-65 rounded-xl border border-gray-200 bg-white shadow-lg after:content-['']
      after:absolute
      after:top-full
      after:left-1/2
      after:-translate-x-1/2
      after:border-[6px]
      after:border-solid
      after:border-white
      after:border-x-transparent
      after:border-b-transparent"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <ClientIcon
          className={`wt-icon-flags--${country.iso2} wt-icon--s`}
          title={country.country_label}
        />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 truncate">
            {country.country_label}
          </div>
          <div className="text-xs text-gray-600">
            {formatValue(country.total)} case studies
          </div>
        </div>

        {pinned && onClose ? (
          <button
            type="button"
            aria-label={`Close ${country.country_label} tooltip`}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="
              absolute top-2 right-2
              cursor-pointer
              focus:outline-none
              focus-visible:ring-2 focus-visible:ring-gray-400
              ecl-u-border-radius-2
             "
          >
            <ClientIcon className="wt-icon-ecl--close ecl-icon ecl-icon--xs" />
          </button>
        ) : null}
      </div>

      <div className="px-3 py-2">
        {country.cities.length > 0 ? (
          <ul className="m-0 list-none p-0 space-y-1">
            {country.cities.map((c) => (
              <li
                key={c.name}
                className="flex items-start justify-between gap-3 text-sm text-gray-800"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <ClientIcon className="wt-icon-location wt-icon--s shrink-0" />
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="tabular-nums">{formatValue(c.count)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-700">No city data available.</div>
        )}
      </div>
    </div>
  );
}

type ClientEuropeMapProps = Readonly<{
  svg: string;
  byIso2: Record<string, CountryInfo>;
}>;

export default function ClientEuropeMap({ svg, byIso2 }: ClientEuropeMapProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [hoverIso2, setHoverIso2] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const [pinned, setPinned] = useState<PinnedState | null>(null);

  const hoverCountry = useMemo(
    () => (hoverIso2 ? byIso2[hoverIso2] : null),
    [hoverIso2, byIso2],
  );

  const pinnedCountry = useMemo(
    () => (pinned ? byIso2[pinned.iso2] : null),
    [pinned, byIso2],
  );

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const interactivePaths = el.querySelectorAll<SVGPathElement>(
      "path.europe-country, path[id]",
    );

    interactivePaths.forEach((p) => {
      const id = p.getAttribute("id")?.toLowerCase();
      if (!id || !byIso2[id]) return;

      p.setAttribute("tabindex", "0");
      p.setAttribute("role", "button");
      p.setAttribute(
        "aria-label",
        `Show details for ${byIso2[id].country_label}`,
      );
    });

    const getIso2FromTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const pathEl =
        target.closest("path.europe-country") ?? target.closest("path[id]");
      if (!pathEl) return null;

      const id = pathEl.getAttribute("id")?.toLowerCase();
      return id && byIso2[id] ? id : null;
    };

    const toLocalPos = (e: PointerEvent | MouseEvent) => {
      const rect = el.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerMove = (e: PointerEvent) => {
      const iso2 = getIso2FromTarget(e.target);
      if (!iso2) {
        setHoverIso2(null);
        setHoverPos(null);
        return;
      }

      if (pinned?.iso2 === iso2) {
        setHoverIso2(null);
        setHoverPos(null);
        return;
      }

      setHoverIso2(iso2);
      setHoverPos(toLocalPos(e));
    };

    const onPointerLeave = () => {
      setHoverIso2(null);
      setHoverPos(null);
    };

    const onClick = (e: MouseEvent) => {
      const iso2 = getIso2FromTarget(e.target);
      if (!iso2) return;

      const pos = toLocalPos(e);

      setPinned((prev) => {
        if (prev?.iso2 === iso2) return null;
        return { iso2, x: pos.x, y: pos.y };
      });

      setHoverIso2(null);
      setHoverPos(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;

      const iso2 = getIso2FromTarget(e.target);
      if (!iso2) return;

      e.preventDefault();

      const target = e.target as Element;
      const rect = target.getBoundingClientRect();
      const wrapperRect = el.getBoundingClientRect();
      const pos = {
        x: rect.left - wrapperRect.left + rect.width / 2,
        y: rect.top - wrapperRect.top + rect.height / 2,
      };

      setPinned((prev) => {
        if (prev?.iso2 === iso2) return null;
        return { iso2, x: pos.x, y: pos.y };
      });

      setHoverIso2(null);
      setHoverPos(null);
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [byIso2, pinned?.iso2]);

  return (
    <div className="min-w-0 relative">
      <div
        ref={wrapperRef}
        className="relative ecl-u-width-100 ecl-u-d-flex ecl-u-justify-content-center
          max-h-[70vh]
          [&_svg]:ecl-u-width-100
          [&_svg]:h-auto
          [&_svg_path]:stroke-(--ecl-color-grey-600)
          [&_svg_path]:stroke-[0.8]
          [&_svg_path]:stroke-linejoin:round
          [&_svg_path]:cursor-pointer
          [&_svg_path]:transition-colors
          [&_svg_path:hover]:brightness-95"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {pinnedCountry && pinned ? (
        <div
          key={`pinned-${pinned.iso2}`}
          role="tooltip"
          className="absolute z-30"
          style={{
            left: pinned.x,
            top: pinned.y,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
        >
          <TooltipCard
            country={pinnedCountry}
            pinned
            onClose={() => setPinned(null)}
          />
        </div>
      ) : null}

      {hoverCountry && hoverPos ? (
        <div
          role="tooltip"
          className="absolute z-20 pointer-events-none"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            transform: "translate(-50%, calc(-100% - 12px))",
          }}
          key={`hover-${hoverCountry.iso2}`}
        >
          <TooltipCard country={hoverCountry} pinned={false} />
        </div>
      ) : null}

      <div className="ecl-u-mt-m ecl-u-d-flex ecl-u-flex-column gap-2 sm:flex-row! sm:items-center sm:justify-end">
        <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center gap-x-4 gap-y-2 text-xs text-gray-700">
          <LegendItem color="var(--ecl-color-grey-75)" label="0" />
          <LegendItem color="var(--ecl-color-primary-200)" label="1–2" />
          <LegendItem color="var(--ecl-color-primary-400)" label="3–5" />
          <LegendItem color="var(--ecl-color-primary-600)" label="6–10" />
          <LegendItem color="var(--ecl-color-primary-800)" label="11+" />
        </div>
      </div>
    </div>
  );
}
