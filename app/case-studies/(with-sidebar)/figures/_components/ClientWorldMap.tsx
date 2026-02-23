"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Map, {
  Layer,
  Source,
  MapRef,
  NavigationControl,
  Marker,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ClientIcon from "@/app/case-studies/_components/icons/ClientIcon";
import Flag from "react-world-flags";
import bbox from "@turf/bbox";

type City = { name: string; count: number };

type CountryInfo = {
  iso2: string;
  iso3: string;
  country_label: string;
  cities: City[];
  total: number;
};

type HoverState = { iso3: string; lng: number; lat: number };
type PinnedState = { iso3: string; lng: number; lat: number };

const SOURCE_ID = "countries";
const FILL_LAYER_ID = "country-fills";

const SIMPLE_STYLE: any = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#cfe8ff" },
    },
    { id: "osm", type: "raster", source: "osm" },
  ],
};

function formatValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

type LegendItemProps = Readonly<{ color: string; label: string }>;

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
      after:absolute after:top-full after:left-1/2 after:-translate-x-1/2
      after:border-[6px] after:border-solid after:border-white
      after:border-x-transparent after:border-b-transparent"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <Flag
          height={14}
          width={20}
          code={country.iso3.toLowerCase()}
          fallback={<span />}
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
            className="absolute top-2 right-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ecl-u-border-radius-2"
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

export default function ClientWorldMap({
  byIso3,
  pending,
}: {
  byIso3: Record<string, CountryInfo>;
  pending?: Boolean;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const [mapUpdating, setMapUpdating] = useState(false);
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(
    null,
  );
  const [hover, setHover] = useState<HoverState | null>(null);
  const [pinned, setPinned] = useState<PinnedState | null>(null);

  const [eclColors, setEclColors] = useState({
    grey75: "#f3f4f6",
    p200: "#bfdbfe",
    p400: "#60a5fa",
    p600: "#2563eb",
    p800: "#1e40af",
    border: "rgba(0,0,0,0.35)",
  });

  useEffect(() => {
    const read = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const grey75 = read("--ecl-color-grey-75");
    const p200 = read("--ecl-color-primary-200");
    const p400 = read("--ecl-color-primary-400");
    const p600 = read("--ecl-color-primary-600");
    const p800 = read("--ecl-color-primary-800");
    const border = read("--ecl-color-grey-600");

    setEclColors((prev) => ({
      grey75: grey75 || prev.grey75,
      p200: p200 || prev.p200,
      p400: p400 || prev.p400,
      p600: p600 || prev.p600,
      p800: p800 || prev.p800,
      border: border || prev.border,
    }));
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/maps/world_by_iso_geo.json")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setGeojson(data);
      })
      .catch(() => {
        if (!alive) return;
        setGeojson(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const fillLayer: any = useMemo(
    () => ({
      id: FILL_LAYER_ID,
      type: "fill",
      source: SOURCE_ID,
      paint: {
        "fill-color": [
          "case",
          ["<=", ["coalesce", ["feature-state", "count"], 0], 0],
          eclColors.grey75,
          ["<=", ["feature-state", "count"], 2],
          eclColors.p200,
          ["<=", ["feature-state", "count"], 5],
          eclColors.p400,
          ["<=", ["feature-state", "count"], 10],
          eclColors.p600,
          eclColors.p800,
        ],
        "fill-opacity": 0.9,
        "fill-outline-color": eclColors.border,
      },
    }),
    [eclColors],
  );

  const borderLayer: any = useMemo(
    () => ({
      id: "country-borders",
      type: "line",
      source: SOURCE_ID,
      paint: { "line-color": eclColors.border, "line-width": 0.6 },
    }),
    [eclColors.border],
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !geojson) return;

    setMapUpdating(true);

    const applyStates = () => {
      const source = map.getSource(SOURCE_ID);
      if (!source) return;

      if (!map.isSourceLoaded(SOURCE_ID)) return;
      if (!map.getLayer(FILL_LAYER_ID)) return;

      map.removeFeatureState({ source: SOURCE_ID });

      for (const [iso3, info] of Object.entries(byIso3 ?? {})) {
        try {
          map.setFeatureState(
            { source: SOURCE_ID, id: iso3 },
            { count: info.total },
          );
        } catch {}
      }

      requestAnimationFrame(() => {
        setMapUpdating(false);
      });
    };

    map.once("idle", applyStates);
  }, [byIso3, geojson]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !geojson) return;

    const activeIso3 = Object.keys(byIso3 ?? {});
    if (activeIso3.length === 0) return;

    const features = geojson.features.filter((f: any) => {
      const iso = String(f.properties?.iso ?? "").toUpperCase();
      return activeIso3.includes(iso);
    });

    if (features.length === 0) return;

    if (features.length > 10) {
      map.easeTo({
        center: [10, 52],
        zoom: 2.6,
        duration: 800,
      });
      return;
    }

    try {
      const featureCollection = {
        type: "FeatureCollection",
        features,
      } as GeoJSON.FeatureCollection;

      const [minX, minY, maxX, maxY] = bbox(featureCollection);

      map.fitBounds(
        [
          [minX, minY],
          [maxX, maxY],
        ],
        {
          padding: 60,
          duration: 900,
        },
      );
    } catch {
      // safe fallback
    }
  }, [byIso3, geojson]);

  const onMove = useCallback(
    (e: any) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (!geojson || !map.getLayer(FILL_LAYER_ID)) {
        setHover(null);
        return;
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: [FILL_LAYER_ID],
      });
      const f = features?.[0];

      const iso3 = f?.properties?.iso
        ? String(f.properties.iso).toUpperCase()
        : null;

      if (!iso3 || !byIso3[iso3] || pinned?.iso3 === iso3) {
        setHover(null);
        return;
      }

      setHover({ iso3, lng: e.lngLat.lng, lat: e.lngLat.lat });
    },
    [byIso3, geojson, pinned?.iso3],
  );

  const onClick = useCallback(
    (e: any) => {
      const map = mapRef.current?.getMap();
      if (!map || !geojson || !map.getLayer(FILL_LAYER_ID)) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: [FILL_LAYER_ID],
      });
      const f = features?.[0];

      const iso3 = f?.properties?.iso
        ? String(f.properties.iso).toUpperCase()
        : null;

      if (!iso3 || !byIso3[iso3]) return;

      setPinned((prev) =>
        prev?.iso3 === iso3
          ? null
          : { iso3, lng: e.lngLat.lng, lat: e.lngLat.lat },
      );
      setHover(null);
    },
    [byIso3, geojson],
  );

  const hoverCountry = hover ? byIso3[hover.iso3] : null;
  const pinnedCountry = pinned ? byIso3[pinned.iso3] : null;

  return (
    <div className="min-w-0 relative">
      <div className="relative h-[70vh]">
        {pending || mapUpdating ? (
          <div className="absolute inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm">
            <div className="ecl-u-d-flex ecl-u-align-items-center ecl-u-pa-m ecl-u-bg-white ecl-u-border-radius-2 ecl-u-shadow-2">
              <div
                className="ecl-spinner ecl-u-mr-s"
                role="status"
                aria-label="Loading"
              >
                <span className="ecl-u-sr-only">Loading…</span>
              </div>
              <span className="ecl-u-color-grey-80">Updating map…</span>
            </div>
          </div>
        ) : null}
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          renderWorldCopies={false}
          initialViewState={{
            longitude: 10,
            latitude: 52,
            zoom: 2.6,
            bearing: 0,
            pitch: 0,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={SIMPLE_STYLE}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={onClick}
        >
          <NavigationControl position="top-left" showCompass={false} />

          {geojson ? (
            <Source
              id={SOURCE_ID}
              type="geojson"
              data={geojson as any}
              promoteId="iso"
            >
              <Layer {...fillLayer} />
              <Layer {...borderLayer} />
            </Source>
          ) : null}

          {pinnedCountry && pinned ? (
            <Marker
              longitude={pinned.lng}
              latitude={pinned.lat}
              anchor="bottom"
              offset={[0, -10]}
            >
              <TooltipCard
                country={pinnedCountry}
                pinned
                onClose={() => setPinned(null)}
              />
            </Marker>
          ) : null}

          {hoverCountry && hover ? (
            <Marker
              longitude={hover.lng}
              latitude={hover.lat}
              anchor="bottom"
              offset={[0, -10]}
            >
              <div className="pointer-events-none">
                <TooltipCard country={hoverCountry} pinned={false} />
              </div>
            </Marker>
          ) : null}
        </Map>
        {!geojson ? (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="bg-white/90 border rounded-lg px-4 py-2 shadow">
              Loading map…
            </div>
          </div>
        ) : null}
      </div>

      <div className="ecl-u-mt-m ecl-u-d-flex ecl-u-flex-column gap-2 sm:flex-row! sm:items-center sm:justify-end">
        <div className="ecl-u-d-flex ecl-u-flex-wrap ecl-u-align-items-center gap-x-3 gap-y-4 text-xs text-gray-700">
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
