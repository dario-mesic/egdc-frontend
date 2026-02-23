import { API_BASE, fetchJson } from "../../_lib/api";
import FiguresClientShell from "./_components/FiguresClientShell";

export type StatsResponse = {
  map_data: {
    country_code: string;
    country_label: string;
    cities: { name: string; count: number }[];
  }[];
  kpi_data: { type_code: string; unit_code: string; total_value: number }[];
  scoreboard: {
    total_net_carbon_impact: number;
    breakdown_by_sector: { sector_code: string; total_value: number }[];
  };
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ sector?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const sector = sp.sector ?? "all";

  const params = new URLSearchParams();
  if (sector !== "all") {
    params.set("sector_code", sector);
  }

  const stats = await fetchJson<StatsResponse>(
    `${API_BASE}/api/v1/stats?${params.toString()}`,
  );

  return <FiguresClientShell stats={stats} selected={sector} />;
}
