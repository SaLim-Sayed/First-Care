import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { Input } from "@heroui/react";

import {
  FILTERS,
  MINIA_CENTER,
  PIN,
  catLabel,
  catColor,
  catBarGrad,
  catEmoji,
} from "./constants";
import { useDoctors } from "./useDoctors";
import { PlaceDrawer } from "./PlaceDrawer";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DoctorsNearby() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // ── Data ───────────────────────────────────────────────────────────────────
  const { places, loading, error } = useDoctors(isAr);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [drawer, setDrawer] = useState(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const mapRef = useRef(null); // Leaflet map instance
  const mapDivRef = useRef(null); // DOM node
  const markersRef = useRef({}); // id → Leaflet marker
  const cardRefs = useRef({});

  // ── Init Leaflet (after loading finishes so div is mounted) ────────────────
  useEffect(() => {
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
  }, [loading, error]);

  // ── Invalidate map size on show/hide toggle ────────────────────────────────
  useEffect(() => {
    if (showMap && mapRef.current)
      setTimeout(() => mapRef.current?.invalidateSize(), 150);
  }, [showMap]);

  // ── Sync markers to filtered list ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const ids = new Set(filtered.map((p) => p.id));
    Object.entries(markersRef.current).forEach(([id, m]) => {
      if (!ids.has(Number(id))) {
        m.remove();
        delete markersRef.current[id];
      }
    });

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
      markersRef.current[place.id] = L.marker([place.lat, place.lon], { icon })
        .bindPopup(popup)
        .addTo(map);
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

  // ── Select place: fly map + scroll card ───────────────────────────────────
  const selectPlace = useCallback((place) => {
    setSelected(place);
    setDrawer(place);
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen pt-20"
      style={{ background: "var(--bg-color)", color: "var(--text-main)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
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

      {/* ── Controls ──────────────────────────────────────────────────────── */}
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
            const Icon = {
              all: MdMedicalServices,
              hospital: FaHospital,
              clinic: FaClinicMedical,
              doctors: FaUserMd,
              pharmacy: FaPills,
            }[f.key];
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
                {Icon ? (
                  <Icon style={{ color: active ? "white" : f.color }} />
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

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pb-12">
        {/* Map div — always rendered so mapDivRef stays stable */}
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

            {/* Cards grid */}
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
                  <PlaceCard
                    key={place.id}
                    place={place}
                    isAr={isAr}
                    isSelected={selected?.id === place.id}
                    onSelect={selectPlace}
                    cardRef={(el) => {
                      cardRefs.current[place.id] = el;
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Details Drawer ────────────────────────────────────────────────── */}
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

// ── PlaceCard ─────────────────────────────────────────────────────────────────
function PlaceCard({ place, isAr, isSelected, onSelect, cardRef }) {
  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(place)}
      className="rounded-3xl border cursor-pointer transition-all duration-300 overflow-hidden group"
      style={{
        background: "var(--card-bg,white)",
        borderColor: isSelected ? "#0076f7" : "var(--border-color)",
        boxShadow: isSelected
          ? "0 0 0 3px rgba(0,118,247,.2),0 8px 30px rgba(0,118,247,.15)"
          : "0 2px 8px rgba(0,0,0,.06)",
        transform: isSelected ? "translateY(-3px)" : "none",
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
            {catLabel(place.category, isAr)}
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
              <FaGlobe className="text-xs" /> {isAr ? "الموقع" : "Website"}
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
              onSelect(place);
            }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all"
            style={{
              borderColor: isSelected ? "#0076f7" : "var(--border-color)",
              color: isSelected ? "#0076f7" : "var(--text-muted)",
              background: "transparent",
            }}
          >
            <FaMapMarkerAlt /> {isAr ? "على الخريطة" : "On Map"}
          </button>
        </div>
      </div>
    </div>
  );
}
