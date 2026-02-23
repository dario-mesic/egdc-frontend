"use client";

import { useState } from "react";
import SectorSelect from "./SectorSelect";
import WorldMap from "./WorldMap";
import KpiCards from "./KpiCards";
import type { StatsResponse } from "../page";

export default function FiguresClientShell({
  stats,
  selected,
}: {
  stats: StatsResponse;
  selected: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <>
      <SectorSelect selected={selected} onPendingChange={setPending} />
      <WorldMap stats={stats} pending={pending} />
      <KpiCards kpis={stats.kpi_data} scoreboard={stats.scoreboard} />
    </>
  );
}
