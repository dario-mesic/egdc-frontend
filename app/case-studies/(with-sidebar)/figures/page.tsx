import EuropeMap from "./_components/EuropeMap";
import KpiCards from "./_components/KpiCards";
import { API_BASE, fetchJson } from "../../_lib/api";

export type StatsResponse = {
  map_data: {
    country_code: string;
    country_label: string;
    cities: {
      name: string;
      count: number;
    }[];
  }[];
  kpi_data: {
    type_code: string;
    unit_code: string;
    total_value: number;
  }[];
};

async function getStats(): Promise<StatsResponse> {
  return fetchJson(`${API_BASE}/api/v1/stats/`);
}

export default async function Figures() {
  const stats = await getStats();

  return (
    <div
      className="
        grid gap-6 lg:gap-8
        xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]
        items-start
      "
    >
      <EuropeMap stats={stats} />
      <KpiCards kpis={stats.kpi_data} />
    </div>
  );
}
