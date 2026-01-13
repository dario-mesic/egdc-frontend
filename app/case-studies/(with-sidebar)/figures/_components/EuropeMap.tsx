import fs from "fs";
import path from "path";
import type { StatsResponse } from "../page";
import { iso3ToIso2 } from "@/app/case-studies/_lib/iso";

function colorForCount(count: number): string {
  if (count <= 0) return "var(--ecl-color-grey-200)";
  if (count <= 2) return "var(--ecl-color-primary-200)";
  if (count <= 5) return "var(--ecl-color-primary-400)";
  if (count <= 10) return "var(--ecl-color-primary-600)";
  return "var(--ecl-color-primary-800)";
}

function injectCountryFills(svg: string, counts: Map<string, number>) {
  return svg.replace(
    /<path\b([^>]*?)\bid="([a-z]{2})"([^>]*?)>/gi,
    (full, pre, id, post) => {
      const iso2 = id.toLowerCase();
      const count = counts.get(iso2) ?? 0;
      const fill = colorForCount(count);

      const cleanedPre = pre.replace(/\sfill="[^"]*"/g, "");
      const cleanedPost = post.replace(/\sfill="[^"]*"/g, "");

      return `<path${cleanedPre} id="${iso2}" fill="${fill}"${cleanedPost}>`;
    }
  );
}

function normalizeSvg(svg: string) {
  return svg.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 preserveAspectRatio="xMidYMid meet">`
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
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

export default function EuropeMap({ stats }: { stats: StatsResponse }) {
  const svg = fs.readFileSync(
    path.join(process.cwd(), "data/europe.svg"),
    "utf8"
  );

  const counts = new Map<string, number>();

  for (const c of stats.map_data) {
    const iso2 = iso3ToIso2(c.country_code);
    if (!iso2) continue;
    counts.set(iso2, c.case_study_count);
  }
  const normalizedSvg = normalizeSvg(svg);
  const coloredSvg = injectCountryFills(normalizedSvg, counts);

  return (
    <div className="min-w-0">
      <div className="rounded-2xl border border-gray-200 ecl-u-bg-white ecl-u-shadow-1">
        <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-justify-content-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900">
            Aggregated KPIs of EGDC
          </h2>
        </div>

        <div className="ecl-u-pa-s sm:p-4! md:p-6!">
          <div
            className="ecl-u-width-100
            min-w-0
            ecl-u-d-flex
            ecl-u-justify-content-center 
            max-h-[70vh]
            [&_svg]:ecl-u-width-100
            [&_svg]:max-w-4xl
            [&_svg]:h-auto
            [&_svg_path]:stroke-(--ecl-color-grey-600)
            [&_svg_path]:stroke-[0.8]
            [&_svg_path]:stroke-linejoin:round
            [&_svg_path]:transition-colors
            [&_svg_path:hover]:brightness-95"
            dangerouslySetInnerHTML={{ __html: coloredSvg }}
          />

          <div className="ecl-u-mt-m ecl-u-d-flex ecl-u-flex-column gap-2 sm:flex-row! sm:items-center sm:justify-end">
            <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center gap-x-4 gap-y-2 text-xs text-gray-700">
              <LegendItem color="var(--ecl-color-grey-200)" label="0" />
              <LegendItem color="var(--ecl-color-primary-200)" label="1–2" />
              <LegendItem color="var(--ecl-color-primary-400)" label="3–5" />
              <LegendItem color="var(--ecl-color-primary-600)" label="6–10" />
              <LegendItem color="var(--ecl-color-primary-800)" label="11+" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
