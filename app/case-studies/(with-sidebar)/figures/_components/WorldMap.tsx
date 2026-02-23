import ClientWorldMap from "./ClientWorldMap";

export default function WorldMap({
  stats,
  pending,
}: {
  stats: any;
  pending?: boolean;
}) {
  const byIso3: Record<string, any> = {};

  for (const c of stats.map_data ?? []) {
    const iso3 = String(c.country_code ?? "").toUpperCase();
    const total = (c.cities ?? []).reduce(
      (sum: number, x: any) => sum + (x.count ?? 0),
      0,
    );

    byIso3[iso3] = {
      iso3,
      country_label: c.country_label,
      cities: c.cities ?? [],
      total,
    };
  }

  return <ClientWorldMap byIso3={byIso3} pending={pending} />;
}
