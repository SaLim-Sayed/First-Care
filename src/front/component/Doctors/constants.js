import L from "leaflet";

// ── Leaflet default icon fix (Vite/webpack) ──────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ── Custom SVG pin icon ───────────────────────────────────────────────────────
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
    iconSize:   [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -44],
  });
}

export const PIN = {
  hospital: makePinIcon("#ef4444", "🏥"),
  clinic:   makePinIcon("#3b82f6", "🏨"),
  doctors:  makePinIcon("#10b981", "👨‍⚕️"),
  dentist:  makePinIcon("#8b5cf6", "🦷"),
  pharmacy: makePinIcon("#f59e0b", "💊"),
  default:  makePinIcon("#6366f1", "⚕️"),
};

// ── Map defaults ──────────────────────────────────────────────────────────────
export const MINIA_CENTER = [28.0871, 30.7618];
export const MINIA_BBOX   = "27.85,30.55,28.35,31.05";

// ── Category filters ──────────────────────────────────────────────────────────
export const FILTERS = [
  { key: "all",      labelEn: "All",        labelAr: "الكل",      color: "#6366f1" },
  { key: "hospital", labelEn: "Hospitals",  labelAr: "مستشفيات",  color: "#ef4444" },
  { key: "clinic",   labelEn: "Clinics",    labelAr: "عيادات",    color: "#3b82f6" },
  { key: "doctors",  labelEn: "Doctors",    labelAr: "أطباء",     color: "#10b981" },
  { key: "dentist",  labelEn: "Dentists",   labelAr: "أسنان",     color: "#8b5cf6" },
  { key: "pharmacy", labelEn: "Pharmacies", labelAr: "صيدليات",   color: "#f59e0b" },
];

// ── Category helpers (pure, no hooks) ────────────────────────────────────────
export const catLabel = (cat, isAr) =>
  ({
    hospital: isAr ? "مستشفى" : "Hospital",
    clinic:   isAr ? "عيادة"  : "Clinic",
    doctors:  isAr ? "طبيب"   : "Doctor",
    dentist:  isAr ? "أسنان"  : "Dentist",
    pharmacy: isAr ? "صيدلية" : "Pharmacy",
  })[cat] || (isAr ? "مرفق صحي" : "Healthcare");

export const catColor = (cat) =>
  ({
    hospital: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    clinic:   "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    doctors:  "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    dentist:  "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    pharmacy: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  })[cat] || "bg-indigo-100 text-indigo-600";

export const catBarGrad = (cat) =>
  ({
    hospital: "linear-gradient(90deg,#ef4444,#f97316)",
    clinic:   "linear-gradient(90deg,#3b82f6,#06b6d4)",
    doctors:  "linear-gradient(90deg,#10b981,#14b8a6)",
    dentist:  "linear-gradient(90deg,#8b5cf6,#a855f7)",
    pharmacy: "linear-gradient(90deg,#f59e0b,#eab308)",
  })[cat] || "linear-gradient(90deg,#6366f1,#8b5cf6)";

export const catEmoji = (cat) =>
  ({ hospital: "🏥", clinic: "🏨", doctors: "👨‍⚕️", dentist: "🦷", pharmacy: "💊" })[cat] || "⚕️";
