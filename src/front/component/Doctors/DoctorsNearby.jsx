import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {
  FaHospital,
  FaUserMd,
  FaClinicMedical,
  FaPills,
  FaSearch,
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaClock,
  FaTimes,
  FaHeartbeat,
  FaSpinner,
  FaExclamationTriangle,
  FaEnvelope,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { Input } from "@heroui/react";

// ── Leaflet default icon fix (Vite/webpack) ─────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom SVG pin icon ──────────────────────────────────────────────────────
function makePinIcon(color, emoji) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
      <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,.3)"/></filter>
      <path d="M17 0C7.6 0 0 7.6 0 17c0 13 17 27 17 27S34 30 34 17C34 7.6 26.4 0 17 0z"
            fill="${color}" filter="url(#s)"/>
      <circle cx="17" cy="17" r="10" fill="white" opacity=".9"/>
      <text x="17" y="22" text-anchor="middle" font-size="13">${emoji}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44],
  });
}

const PIN = {
  hospital: makePinIcon("#ef4444", "🏥"),
  clinic: makePinIcon("#3b82f6", "🏨"),
  doctors: makePinIcon("#10b981", "👨‍⚕️"),
  dentist: makePinIcon("#8b5cf6", "🦷"),
  pharmacy: makePinIcon("#f59e0b", "💊"),
  default: makePinIcon("#6366f1", "⚕️"),
};

// ── Constants ────────────────────────────────────────────────────────────────
const MINIA_CENTER = [28.0871, 30.7618];
const MINIA_BBOX = "27.85,30.55,28.35,31.05";

const FILTERS = [
  { key: "all", labelEn: "All", labelAr: "الكل", color: "#6366f1" },
  {
    key: "hospital",
    labelEn: "Hospitals",
    labelAr: "مستشفيات",
    color: "#ef4444",
  },
  { key: "clinic", labelEn: "Clinics", labelAr: "عيادات", color: "#3b82f6" },
  { key: "doctors", labelEn: "Doctors", labelAr: "أطباء", color: "#10b981" },
  { key: "dentist", labelEn: "Dentists", labelAr: "أسنان", color: "#8b5cf6" },
  {
    key: "pharmacy",
    labelEn: "Pharmacies",
    labelAr: "صيدليات",
    color: "#f59e0b",
  },
];

function buildQuery(bbox) {
  return `[out:json][timeout:30];(
    node["amenity"="hospital"](${bbox});
    node["amenity"="clinic"](${bbox});
    node["amenity"="doctors"](${bbox});
    node["amenity"="dentist"](${bbox});
    node["amenity"="pharmacy"](${bbox});
    way["amenity"="hospital"](${bbox});
    way["amenity"="clinic"](${bbox});
  );out center tags;`;
}

// Parse opening_hours string (OSM format) into day → time rows
function parseOpeningHours(raw) {
  if (!raw) return [];
  // Handle "24/7"
  if (raw.trim() === "24/7") return [{ days: "24/7", time: "00:00 – 24:00" }];
  try {
    return raw.split(";").map((part) => {
      const [days, ...timeParts] = part.trim().split(" ");
      return { days: days || part.trim(), time: timeParts.join(" ") || "" };
    });
  } catch {
    return [{ days: raw, time: "" }];
  }
}

function parseEl(el) {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;
  return {
    id: el.id,
    name: t["name:ar"] || t.name || t["name:en"] || "مرفق صحي",
    nameEn: t["name:en"] || t.name || "Healthcare Facility",
    category: t.amenity || "default",
    address:
      [t["addr:street"], t["addr:housenumber"], t["addr:city"]]
        .filter(Boolean)
        .join(", ") || "المنيا، مصر",
    phone: t.phone || t["contact:phone"] || t["phone"] || null,
    phone2: t["contact:mobile"] || t["mobile"] || null,
    email: t.email || t["contact:email"] || null,
    website: t.website || t["contact:website"] || null,
    facebook: t["contact:facebook"] || null,
    openingHours: t.opening_hours || null,
    specialty:
      t.healthcare_speciality ||
      t["healthcare:speciality"] ||
      t.description ||
      null,
    operator: t.operator || null,
    beds: t.beds || null,
    emergency: t.emergency || null,
    wheelchair: t.wheelchair || null,
    lat,
    lon,
  };
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function DoctorsNearby() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [drawer, setDrawer] = useState(null); // place shown in details drawer

  const mapRef = useRef(null); // Leaflet map instance
  const mapDivRef = useRef(null); // DOM node
  const markersRef = useRef({}); // id → Leaflet marker
  const cardRefs = useRef({});

  // ── Fetch from Overpass ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.post(
          "https://overpass-api.de/api/interpreter",
          buildQuery(MINIA_BBOX),
          { headers: { "Content-Type": "text/plain" } },
        );
        const parsed = (res.data.elements || []).map(parseEl).filter(Boolean);
        setPlaces(parsed);
        setFiltered(parsed);
      } catch {
        setError(
          isAr
            ? "تعذر تحميل البيانات. يرجى المحاولة لاحقاً."
            : "Failed to load data. Please try again later.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Initialise Leaflet map — runs after loading finishes (div is in DOM) ───
  useEffect(() => {
    // Wait until loading is done and the map div is actually mounted
    if (loading || error || !mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, { center: MINIA_CENTER, zoom: 12 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Re-run when loading/error state changes so the map mounts after the div appears
  }, [loading, error]);

  // ── Invalidate map size when toggling visibility ───────────────────────────
  useEffect(() => {
    if (showMap && mapRef.current) {
      // Small delay lets the CSS transition finish before recalculating
      setTimeout(() => mapRef.current?.invalidateSize(), 150);
    }
  }, [showMap]);

  // ── Sync markers whenever filtered list changes ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers not in current filtered list
    const filteredIds = new Set(filtered.map((p) => p.id));
    Object.entries(markersRef.current).forEach(([id, m]) => {
      if (!filteredIds.has(Number(id))) {
        m.remove();
        delete markersRef.current[id];
      }
    });

    // Add new markers
    filtered.forEach((place) => {
      if (markersRef.current[place.id]) return;
      const icon = PIN[place.category] || PIN.default;
      const label = isAr ? place.name : place.nameEn;
      const popup = `
        <div style="min-width:170px;font-family:sans-serif;direction:${isAr ? "rtl" : "ltr"}">
          <strong style="font-size:13px">${label}</strong><br/>
          <span style="font-size:11px;color:#555">${place.address}</span>
          ${place.phone ? `<br/><a href="tel:${place.phone}" style="font-size:11px">📞 ${place.phone}</a>` : ""}
          <br/>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}"
             target="_blank"
             style="display:inline-block;margin-top:6px;padding:4px 10px;background:#2563eb;color:#fff;border-radius:8px;font-size:11px;font-weight:700;text-decoration:none">
            ${isAr ? "الاتجاهات" : "Directions"}
          </a>
        </div>`;
      const marker = L.marker([place.lat, place.lon], { icon })
        .bindPopup(popup)
        .addTo(map);
      markersRef.current[place.id] = marker;
    });
  }, [filtered, isAr]);

  // ── Filter + search ────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...places];
    if (filter !== "all") result = result.filter((p) => p.category === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [places, filter, query]);

  // ── Select a place: fly map + open popup ──────────────────────────────────
  const selectPlace = useCallback((place) => {
    setSelected(place);
    const map = mapRef.current;
    const marker = markersRef.current[place.id];
    if (map && marker) {
      map.flyTo([place.lat, place.lon], 17, { duration: 1.1 });
      setTimeout(() => marker.openPopup(), 1200);
    }
    setTimeout(
      () =>
        cardRefs.current[place.id]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        }),
      100,
    );
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const catLabel = (cat) =>
    ({
      hospital: isAr ? "مستشفى" : "Hospital",
      clinic: isAr ? "عيادة" : "Clinic",
      doctors: isAr ? "طبيب" : "Doctor",
      dentist: isAr ? "أسنان" : "Dentist",
      pharmacy: isAr ? "صيدلية" : "Pharmacy",
    })[cat] || (isAr ? "مرفق صحي" : "Healthcare");

  const catColor = (cat) =>
    ({
      hospital: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      clinic:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      doctors:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      dentist:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      pharmacy:
        "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    })[cat] || "bg-indigo-100 text-indigo-600";

  const catBarGrad = (cat) =>
    ({
      hospital: "linear-gradient(90deg,#ef4444,#f97316)",
      clinic: "linear-gradient(90deg,#3b82f6,#06b6d4)",
      doctors: "linear-gradient(90deg,#10b981,#14b8a6)",
      dentist: "linear-gradient(90deg,#8b5cf6,#a855f7)",
      pharmacy: "linear-gradient(90deg,#f59e0b,#eab308)",
    })[cat] || "linear-gradient(90deg,#6366f1,#8b5cf6)";

  const catEmoji = (cat) =>
    ({
      hospital: "🏥",
      clinic: "🏨",
      doctors: "👨‍⚕️",
      dentist: "🦷",
      pharmacy: "💊",
    })[cat] || "⚕️";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: "var(--bg-color)", color: "var(--text-main)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#0076f7 0%,#00b4d8 50%,#10b981 100%)",
        }}
        className="relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative container mx-auto px-4 py-12 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FaHeartbeat className="text-2xl" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-semibold uppercase tracking-wider">
                {isAr ? "المنيا، مصر" : "Minia, Egypt"}
              </p>
              <h1 className="text-3xl md:text-4xl font-black">
                {isAr ? "أطباء وعيادات قريبة" : "Nearby Doctors & Clinics"}
              </h1>
            </div>
          </div>
          <p className="text-white/80 max-w-xl">
            {isAr
              ? "اعثر على أقرب المستشفيات والعيادات في محافظة المنيا"
              : "Find the nearest hospitals, clinics & doctors in Minia Governorate"}
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              {
                label: isAr ? "مرفق صحي" : "Facilities",
                val: places.length,
                icon: "🏥",
              },
              {
                label: isAr ? "مستشفيات" : "Hospitals",
                val: places.filter((p) => p.category === "hospital").length,
                icon: "🏨",
              },
              {
                label: isAr ? "عيادات" : "Clinics",
                val: places.filter((p) => p.category === "clinic").length,
                icon: "🏩",
              },
              {
                label: isAr ? "أطباء" : "Doctors",
                val: places.filter((p) => p.category === "doctors").length,
                icon: "👨‍⚕️",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20"
              >
                <span className="text-xl mr-2">{s.icon}</span>
                <span className="text-2xl font-black">{s.val}</span>
                <span className="text-white/70 text-sm ml-2">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Controls ──────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-5">
        <div className="flex flex-row gap-4">
          {/* Search */}
          <div className="relative flex items-center flex-1">
            <Input
              endContent={
                <FaSearch
                  className={`text-gray-900 ${isAr ? "right-4" : "left-4"}`}
                />
              }
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isAr
                  ? "ابحث عن طبيب أو عيادة..."
                  : "Search for a doctor or clinic..."
              }
              className={`w-full p-3 h-12 rounded-2xl border text-sm font-semibold outline-none transition-all focus:border-[#0076f7] focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 ${isAr ? "pr-12 pl-4" : "pl-12 pr-4"}`}
              style={{
                background: "var(--card-bg,white)",
                borderColor: "var(--border-color)",
                color: "var(--text-main)",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isAr ? "left-4" : "right-4"}`}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Toggle map */}
          <button
            onClick={() => setShowMap((v) => !v)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border transition-all"
            style={{
              background: showMap ? "#0076f7" : "var(--card-bg)",
              color: showMap ? "white" : "var(--text-main)",
              borderColor: showMap ? "#0076f7" : "var(--border-color)",
            }}
          >
            <FaMapMarkerAlt />
            {isAr
              ? showMap
                ? "إخفاء الخريطة"
                : "عرض الخريطة"
              : showMap
                ? "Hide Map"
                : "Show Map"}
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border"
                style={{
                  background: active ? f.color : "var(--card-bg)",
                  color: active ? "white" : f.color,
                  borderColor: active ? f.color : "var(--border-color)",
                  boxShadow: active ? `0 4px 15px ${f.color}40` : "none",
                  transform: active ? "translateY(-1px)" : "none",
                }}
              >
                {f.key === "all" ? (
                  <MdMedicalServices
                    style={{ color: active ? "white" : f.color }}
                  />
                ) : f.key === "hospital" ? (
                  <FaHospital style={{ color: active ? "white" : f.color }} />
                ) : f.key === "clinic" ? (
                  <FaClinicMedical
                    style={{ color: active ? "white" : f.color }}
                  />
                ) : f.key === "doctors" ? (
                  <FaUserMd style={{ color: active ? "white" : f.color }} />
                ) : f.key === "pharmacy" ? (
                  <FaPills style={{ color: active ? "white" : f.color }} />
                ) : (
                  <span style={{ fontSize: 14 }}>🦷</span>
                )}
                {isAr ? f.labelAr : f.labelEn}
                {f.key !== "all" && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-black"
                    style={{
                      background: active
                        ? "rgba(255,255,255,.25)"
                        : `${f.color}20`,
                      color: active ? "white" : f.color,
                    }}
                  >
                    {places.filter((p) => p.category === f.key).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pb-12">
        {/* ── Map div: ALWAYS in the DOM so mapDivRef is always valid ─────────
             We show/hide it via visibility+height instead of conditional render.
             This is critical — Leaflet needs a stable DOM node to attach to. ── */}
        <div
          style={{
            display: !loading && !error && showMap ? "block" : "none",
            marginBottom: 8,
          }}
        >
          <div
            ref={mapDivRef}
            className="rounded-3xl overflow-hidden border shadow-xl"
            style={{ height: 420, borderColor: "var(--border-color)" }}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <FaSpinner className="text-3xl text-[#0076f7] animate-spin" />
            </div>
            <p
              className="font-bold text-lg"
              style={{ color: "var(--text-muted)" }}
            >
              {isAr
                ? "جارٍ تحميل المرافق الصحية..."
                : "Loading healthcare facilities..."}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {isAr
                ? "نحضر بيانات المنيا من OpenStreetMap"
                : "Fetching Minia data from OpenStreetMap"}
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center">
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
            <p className="font-bold text-lg text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-2xl bg-[#0076f7] text-white font-bold"
            >
              {isAr ? "إعادة المحاولة" : "Try Again"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p
                className="font-bold text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {isAr
                  ? `عُثر على ${filtered.length} مرفق صحي`
                  : `Found ${filtered.length} healthcare facilities`}
              </p>
              {filtered.length === 0 && places.length > 0 && (
                <button
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                  className="text-xs text-[#0076f7] font-bold hover:underline"
                >
                  {isAr ? "مسح الفلاتر" : "Clear filters"}
                </button>
              )}
            </div>

            {/* Cards */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="text-5xl">🔍</div>
                <p
                  className="font-bold text-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  {isAr ? "لا توجد نتائج" : "No results found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((place) => (
                  <div
                    key={place.id}
                    ref={(el) => {
                      cardRefs.current[place.id] = el;
                    }}
                    onClick={() => selectPlace(place)}
                    className="rounded-3xl border cursor-pointer transition-all duration-300 overflow-hidden group"
                    style={{
                      background: "var(--card-bg,white)",
                      borderColor:
                        selected?.id === place.id
                          ? "#0076f7"
                          : "var(--border-color)",
                      boxShadow:
                        selected?.id === place.id
                          ? "0 0 0 3px rgba(0,118,247,.2),0 8px 30px rgba(0,118,247,.15)"
                          : "0 2px 8px rgba(0,0,0,.06)",
                      transform:
                        selected?.id === place.id ? "translateY(-3px)" : "none",
                    }}
                  >
                    {/* Color bar */}
                    <div
                      className="h-1.5 w-full"
                      style={{ background: catBarGrad(place.category) }}
                    />

                    <div className="p-5">
                      {/* Name + badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                            style={{ background: "var(--bg-color)" }}
                          >
                            {catEmoji(place.category)}
                          </div>
                          <div className="min-w-0">
                            <h3
                              className="font-black text-sm leading-tight"
                              style={{ color: "var(--text-main)" }}
                            >
                              {isAr ? place.name : place.nameEn}
                            </h3>
                            {!isAr && place.name !== place.nameEn && (
                              <p
                                className="text-xs mt-0.5 truncate"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {place.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl shrink-0 ${catColor(place.category)}`}
                        >
                          {catLabel(place.category)}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 mb-3">
                        <FaMapMarkerAlt className="text-red-400 text-xs mt-1 shrink-0" />
                        <p
                          className="text-xs font-semibold leading-relaxed"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {place.address}
                        </p>
                      </div>

                      {/* Chips */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {place.phone && (
                          <a
                            href={`tel:${place.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold no-underline hover:bg-blue-100 transition-colors"
                          >
                            <FaPhone className="text-xs" /> {place.phone}
                          </a>
                        )}
                        {place.openingHours && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <FaClock className="text-xs" />
                            {place.openingHours.length > 20
                              ? place.openingHours.slice(0, 20) + "…"
                              : place.openingHours}
                          </span>
                        )}
                        {place.website && (
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold no-underline"
                          >
                            <FaGlobe className="text-xs" />{" "}
                            {isAr ? "الموقع" : "Website"}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#0076f7] text-white text-xs font-black no-underline hover:bg-blue-700 transition-all"
                        >
                          <FaMapMarkerAlt /> {isAr ? "الاتجاهات" : "Directions"}
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectPlace(place);
                          }}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all"
                          style={{
                            borderColor:
                              selected?.id === place.id
                                ? "#0076f7"
                                : "var(--border-color)",
                            color:
                              selected?.id === place.id
                                ? "#0076f7"
                                : "var(--text-muted)",
                            background: "transparent",
                          }}
                        >
                          <FaMapMarkerAlt /> {isAr ? "على الخريطة" : "On Map"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* ─── Details Drawer ──────────────────────────────────────────────── */}
      {drawer && (
        <PlaceDrawer
          place={drawer}
          isAr={isAr}
          onClose={() => setDrawer(null)}
          catLabel={catLabel}
          catColor={catColor}
          catBarGrad={catBarGrad}
          catEmoji={catEmoji}
        />
      )}
    </div>
  );
}

// ── Details Drawer ────────────────────────────────────────────────────────────
function PlaceDrawer({
  place,
  isAr,
  onClose,
  catLabel,
  catColor,
  catBarGrad,
  catEmoji,
}) {
  const hours = parseOpeningHours(place?.openingHours);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!place) return null;

  const label = isAr ? place.name : place.nameEn;
  const hasInfo =
    place.phone ||
    place.phone2 ||
    place.email ||
    place.website ||
    place.openingHours;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed bottom-0 right-0 z-50 flex flex-col"
        dir={isAr ? "rtl" : "ltr"}
        style={{
          width: "min(480px, 100vw)",
          height: "min(90vh, 700px)",
          background: "var(--card-bg, white)",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,.2)",
          animation: "slideUpDrawer .3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Color bar */}
        <div
          className="h-1 w-full shrink-0"
          style={{ background: catBarGrad(place.category) }}
        />

        {/* Header */}
        <div
          className="flex items-start gap-3 px-5 pt-4 pb-3 shrink-0 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: "var(--bg-color)" }}
          >
            {catEmoji(place.category)}
          </div>
          <div className="flex-1 min-w-0">
            <h2
              className="font-black text-base leading-tight"
              style={{ color: "var(--text-main)" }}
            >
              {label}
            </h2>
            {isAr && place.nameEn && place.nameEn !== place.name && (
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {place.nameEn}
              </p>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg mt-1 inline-block ${catColor(place.category)}`}
            >
              {catLabel(place.category)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Address */}
          <InfoRow
            icon={<FaMapMarkerAlt className="text-red-500" />}
            label={isAr ? "العنوان" : "Address"}
            value={place.address}
            isAr={isAr}
          />

          {/* Specialty / description */}
          {place.specialty && (
            <InfoRow
              icon={<span>🩺</span>}
              label={isAr ? "التخصص" : "Specialty"}
              value={place.specialty}
              isAr={isAr}
            />
          )}

          {/* Operator */}
          {place.operator && (
            <InfoRow
              icon={<span>🏛️</span>}
              label={isAr ? "الجهة المشغّلة" : "Operator"}
              value={place.operator}
              isAr={isAr}
            />
          )}

          {/* Divider */}
          {hasInfo && (
            <div className="py-1">
              <p
                className="text-xs font-black uppercase tracking-wider mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {isAr ? "بيانات التواصل" : "Contact Info"}
              </p>

              <div className="space-y-3">
                {/* Phone 1 */}
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-3 p-3 rounded-2xl no-underline transition-all hover:scale-[1.01] group"
                    style={{
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                      <FaPhone className="text-blue-600 dark:text-blue-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {isAr ? "رقم الهاتف" : "Phone"}
                      </p>
                      <p
                        className="font-black text-sm"
                        style={{ color: "var(--text-main)" }}
                      >
                        {place.phone}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAr ? "اتصل" : "Call"}
                    </span>
                  </a>
                )}

                {/* Phone 2 / Mobile */}
                {place.phone2 && (
                  <a
                    href={`tel:${place.phone2}`}
                    className="flex items-center gap-3 p-3 rounded-2xl no-underline transition-all hover:scale-[1.01] group"
                    style={{
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                      <FaPhone className="text-emerald-600 dark:text-emerald-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {isAr ? "الموبايل" : "Mobile"}
                      </p>
                      <p
                        className="font-black text-sm"
                        style={{ color: "var(--text-main)" }}
                      >
                        {place.phone2}
                      </p>
                    </div>
                  </a>
                )}

                {/* Email */}
                {place.email && (
                  <a
                    href={`mailto:${place.email}`}
                    className="flex items-center gap-3 p-3 rounded-2xl no-underline transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                      <FaEnvelope className="text-purple-600 dark:text-purple-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {isAr ? "البريد الإلكتروني" : "Email"}
                      </p>
                      <p
                        className="font-black text-sm truncate"
                        style={{ color: "var(--text-main)" }}
                      >
                        {place.email}
                      </p>
                    </div>
                  </a>
                )}

                {/* Website */}
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-2xl no-underline transition-all hover:scale-[1.01]"
                    style={{
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                      <FaGlobe className="text-indigo-600 dark:text-indigo-400 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {isAr ? "الموقع الإلكتروني" : "Website"}
                      </p>
                      <p
                        className="font-black text-sm truncate"
                        style={{ color: "var(--text-main)" }}
                      >
                        {place.website.replace(/^https?:\/\//, "")}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Opening hours */}
          {hours.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaClock className="text-amber-500" />
                <p
                  className="text-xs font-black uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {isAr ? "أوقات العمل" : "Opening Hours"}
                </p>
              </div>
              <div
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--border-color)" }}
              >
                {hours.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      background:
                        i % 2 === 0 ? "var(--bg-color)" : "var(--card-bg)",
                      borderTop:
                        i > 0 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <span
                      className="font-bold text-sm"
                      style={{ color: "var(--text-main)" }}
                    >
                      {row.days}
                    </span>
                    {row.time && (
                      <span
                        className="font-black text-sm px-3 py-1 rounded-lg"
                        style={{
                          background: "rgba(0,118,247,.1)",
                          color: "#0076f7",
                        }}
                      >
                        {row.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extra badges */}
          <div className="flex flex-wrap gap-2">
            {place.emergency === "yes" && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                🚨 {isAr ? "طوارئ" : "Emergency"}
              </span>
            )}
            {place.wheelchair === "yes" && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                ♿ {isAr ? "متاح لذوي الاحتياجات" : "Wheelchair Accessible"}
              </span>
            )}
            {place.beds && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                🛏 {place.beds} {isAr ? "سرير" : "beds"}
              </span>
            )}
          </div>

          {/* No info fallback */}
          {!hasInfo && hours.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-8 gap-2 rounded-2xl"
              style={{ background: "var(--bg-color)" }}
            >
              <span className="text-3xl">📭</span>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                {isAr
                  ? "لا تتوفر تفاصيل إضافية حالياً"
                  : "No additional details available"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {isAr
                  ? "يمكنك إضافة معلومات على OpenStreetMap"
                  : "You can add info on OpenStreetMap"}
              </p>
            </div>
          )}
        </div>

        {/* Footer — Directions button */}
        <div
          className="px-5 py-4 border-t shrink-0"
          style={{ borderColor: "var(--border-color)" }}
        >
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0076f7] text-white font-black no-underline hover:bg-blue-700 transition-all text-sm"
          >
            <FaMapMarkerAlt />{" "}
            {isAr
              ? "احصل على الاتجاهات في الخريطة"
              : "Get Directions on Google Maps"}
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slideUpDrawer {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Reusable info row ─────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, isAr }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-2xl"
      style={{
        background: "var(--bg-color)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
        style={{ background: "var(--card-bg)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold mb-0.5"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        <p
          className="font-bold text-sm leading-snug"
          style={{ color: "var(--text-main)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
