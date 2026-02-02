import fs from "node:fs";
import path from "node:path";
import type { StatsResponse } from "../page";
import { iso3ToIso2 } from "@/app/case-studies/_lib/iso";
import ClientEuropeMap from "./ClientEuropeMap";

type EuropeMapProps = Readonly<{
  stats: StatsResponse;
}>;

function colorForCount(count: number): string {
  if (count <= 0) return "var(--ecl-color-grey-75)";
  if (count <= 2) return "var(--ecl-color-primary-200)";
  if (count <= 5) return "var(--ecl-color-primary-400)";
  if (count <= 10) return "var(--ecl-color-primary-600)";
  return "var(--ecl-color-primary-800)";
}

function injectCountryFills(svg: string, counts: Map<string, number>) {
  // eslint-disable-next-line unicorn/prefer-string-replace-all
  return svg.replace(
    /<path\b([^>]*?)\bid="([a-z]{2})"([^>]*?)>/gi,
    (full, pre, id, post) => {
      const iso2 = id.toLowerCase();
      const count = counts.get(iso2) ?? 0;
      const fill = colorForCount(count);

      const cleanedPre = pre.replaceAll(/\sfill="[^"]*"/g, "");
      const cleanedPost = post.replaceAll(/\sfill="[^"]*"/g, "");

      return `<path${cleanedPre} class="europe-country" id="${iso2}" fill="${fill}"${cleanedPost} role="button" aria-label="${iso2}">`;
    },
  );
}

function normalizeSvg(svg: string) {
  return svg.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 preserveAspectRatio="xMidYMid meet">`,
  );
}

export default function EuropeMap({ stats }: EuropeMapProps) {
  const svg = fs.readFileSync(
    path.join(process.cwd(), "data/europe.svg"),
    "utf8",
  );

  const byIso2 = new Map<
    string,
    {
      iso2: string;
      iso3: string;
      country_label: string;
      cities: { name: string; count: number }[];
      total: number;
    }
  >();

  const counts = new Map<string, number>();

  for (const c of stats.map_data) {
    const iso2 = iso3ToIso2(c.country_code);
    if (!iso2) continue;

    const total =
      (c as any).case_study_count ??
      (c.cities ?? []).reduce((sum, x) => sum + (x.count ?? 0), 0);

    counts.set(iso2, total);

    byIso2.set(iso2, {
      iso2,
      iso3: c.country_code,
      country_label: c.country_label,
      cities: c.cities ?? [],
      total,
    });
  }

  const normalizedSvg = normalizeSvg(svg);
  const coloredSvg = injectCountryFills(normalizedSvg, counts);

  return (
    <ClientEuropeMap svg={coloredSvg} byIso2={Object.fromEntries(byIso2)} />
  );
}
