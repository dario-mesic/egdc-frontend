import type { StatsResponse } from "../page";

type KpiCardsProps = Readonly<{
  kpis: StatsResponse["kpi_data"];
  scoreboard?: StatsResponse["scoreboard"];
  limit?: number;
}>;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatValue(value: number, unitCode: string) {
  const u = (unitCode ?? "").toUpperCase();

  if (u === "EUR") {
    const compact = new Intl.NumberFormat("en-GB", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
    return `${compact} €`;
  }

  if (u === "PERCENT" || u === "%") {
    return `${formatNumber(value)} %`;
  }

  if (u === "TCO2" || u === "TCO2E") {
    return `${formatNumber(value)} tCO₂`;
  }

  return `${formatNumber(value)} ${unitCode ?? ""}`.trim();
}

function labelFromType(typeCode: string) {
  return (typeCode ?? "")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function labelFromSector(sectorCode: string) {
  return (sectorCode ?? "")
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function KpiCards({
  kpis,
  scoreboard,
  limit = 3,
}: KpiCardsProps) {
  const top = (kpis ?? [])
    .slice()
    .sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0))
    .slice(0, limit);

  const totalNet = scoreboard?.total_net_carbon_impact ?? null;

  const breakdown = (scoreboard?.breakdown_by_sector ?? [])
    .slice()
    .sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0));

  const totalForPct =
    typeof totalNet === "number" && totalNet !== 0
      ? totalNet
      : breakdown.reduce((s, x) => s + (x.total_value ?? 0), 0);

  if (!top.length && !totalNet) return null;

  return (
    <div className="ecl-u-mt-l">
      <div className="grid grid-cols-1 xl:grid-cols-12 xl:gap-x-6 ecl-u-align-items-start">
        <div className="xl:col-span-8 ecl-u-mb-l xl:ecl-u-mb-none">
          {typeof totalNet === "number" && (
            <div className="ecl-card ecl-u-shadow-1">
              <div className="ecl-card__body">
                <div className="ecl-u-type-heading-3">Net carbon impact</div>

                <div className="ecl-u-mt-m ecl-u-type-heading-1 tabular-nums">
                  {formatNumber(totalNet)}
                  <span className="ecl-u-type-m ecl-u-type-color-grey-600 ecl-u-ml-xs">
                    tCO₂
                  </span>
                </div>

                {breakdown.length > 0 && (
                  <div className="ecl-u-mt-l">
                    <div className="ecl-u-type-m ecl-u-type-bold ecl-u-mb-s">
                      Breakdown by sector
                    </div>

                    {breakdown.map((s, index) => {
                      const value = s.total_value ?? 0;
                      const pct =
                        totalForPct > 0
                          ? Math.round((value / totalForPct) * 100)
                          : 0;

                      const colorScale = [
                        "var(--ecl-color-primary-800)",
                        "var(--ecl-color-primary-700)",
                        "var(--ecl-color-primary-600)",
                        "var(--ecl-color-primary-500)",
                        "var(--ecl-color-primary-400)",
                        "var(--ecl-color-primary-300)",
                      ];

                      const barColor =
                        colorScale[Math.min(index, colorScale.length - 1)];

                      return (
                        <div key={s.sector_code} className="ecl-u-mb-m">
                          <div className="ecl-u-d-flex ecl-u-justify-content-between ecl-u-type-s">
                            <span>{labelFromSector(s.sector_code)}</span>
                            <span className="tabular-nums">
                              {formatNumber(value)} tCO₂
                              {totalForPct > 0 && (
                                <span className="ecl-u-ml-xs ecl-u-type-color-grey-600">
                                  ({pct}%)
                                </span>
                              )}
                            </span>
                          </div>

                          <div
                            className="ecl-u-mt-2xs"
                            style={{
                              height: "6px",
                              backgroundColor: "var(--ecl-color-grey-100)",
                              borderRadius: "999px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                backgroundColor: barColor,
                                height: "100%",
                                borderRadius: "999px",
                                transition: "width 0.6s ease",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="xl:col-span-4">
          {top.map((kpi, i) => {
            const label = labelFromType(kpi.type_code);
            const value = formatValue(kpi.total_value, kpi.unit_code);

            return (
              <div
                key={`${kpi.type_code}-${kpi.unit_code}-${kpi.total_value}`}
                className={`ecl-card ecl-u-shadow-1 ${
                  i !== top.length - 1 ? "ecl-u-mb-m" : ""
                }`}
              >
                <div className="ecl-card__body ecl-u-type-align-center">
                  <div className="ecl-u-type-heading-2 tabular-nums">
                    {value}
                  </div>
                  <div className="ecl-u-type-m ecl-u-type-color-grey-600">
                    {label} <span>({kpi.unit_code?.toUpperCase()})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
