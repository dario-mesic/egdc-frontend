import type { StatsResponse } from "../page";

type KpiCardsProps = Readonly<{
  kpis: StatsResponse["kpi_data"];
  limit?: number;
}>;

function formatValue(value: number, unitCode: string) {
  const formatted = Number(value).toLocaleString(undefined);

  switch (unitCode?.toUpperCase()) {
    case "EUR":
      return `${formatted} €`;
    case "PERCENT":
    case "%":
      return `${formatted} %`;
    default:
      return formatted;
  }
}

function labelFromType(typeCode: string) {
  return typeCode
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function KpiCards({ kpis, limit = 3 }: KpiCardsProps) {
  const top = (kpis ?? [])
    .slice()
    .sort((a, b) => (b.total_value ?? 0) - (a.total_value ?? 0))
    .slice(0, limit);

  if (!top.length) return null;

  return (
    <div className="min-w-0 xl:sticky xl:top-6 self-start">
      <div className="rounded-2xl border border-gray-200 ecl-u-bg-white ecl-u-shadow-1">
        <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900">Key figures</h2>
          <p className="ecl-u-mt-xs text-sm text-gray-500">
            Top indicators across all countries
          </p>
        </div>

        <div className="ecl-u-pa-s sm:p-4! md:p-6!">
          <aside className="ecl-u-d-flex ecl-u-flex-column gap-4">
            {top.map((kpi) => {
              const label = labelFromType(kpi.type_code);
              const value = formatValue(kpi.total_value, kpi.unit_code);

              return (
                <div
                  key={`${kpi.type_code}-${kpi.unit_code}-${kpi.total_value}`}
                  className="ecl-card ecl-u-shadow-1"
                >
                  <div className="ecl-card__body ecl-u-d-flex ecl-u-flex-column ecl-u-align-items-center ecl-u-type-align-center gap-1">
                    <div className="ecl-u-type-heading-2 tabular-nums">
                      {value}
                    </div>
                    <div className="ecl-u-type-m ecl-u-type-color-grey-600">
                      {label} <span>({kpi.unit_code})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </aside>
        </div>
      </div>
    </div>
  );
}
