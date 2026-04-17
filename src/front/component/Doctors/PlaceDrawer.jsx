import React, { useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaGlobe,
  FaClock,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";
import { parseOpeningHours } from "./utils";

// ── PlaceDrawer ───────────────────────────────────────────────────────────────
export function PlaceDrawer({ place, isAr, onClose, catLabel, catColor, catBarGrad, catEmoji }) {
  const hours = parseOpeningHours(place?.openingHours);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!place) return null;

  const label   = isAr ? place.name : place.nameEn;
  const hasInfo = place.phone || place.phone2 || place.email || place.website || place.openingHours;

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
          width:        "min(480px, 100vw)",
          height:       "min(90vh, 700px)",
          background:   "var(--card-bg, white)",
          borderRadius: "24px 24px 0 0",
          boxShadow:    "0 -8px 40px rgba(0,0,0,.2)",
          animation:    "slideUpDrawer .3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Color bar */}
        <div className="h-1 w-full shrink-0" style={{ background: catBarGrad(place.category) }} />

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
            <h2 className="font-black text-base leading-tight" style={{ color: "var(--text-main)" }}>
              {label}
            </h2>
            {isAr && place.nameEn && place.nameEn !== place.name && (
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{place.nameEn}</p>
            )}
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg mt-1 inline-block ${catColor(place.category)}`}>
              {catLabel(place.category, isAr)}
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
          <InfoRow icon={<FaMapMarkerAlt className="text-red-500" />} label={isAr ? "العنوان" : "Address"} value={place.address} />

          {place.specialty && (
            <InfoRow icon={<span>🩺</span>} label={isAr ? "التخصص" : "Specialty"} value={place.specialty} />
          )}
          {place.operator && (
            <InfoRow icon={<span>🏛️</span>} label={isAr ? "الجهة المشغّلة" : "Operator"} value={place.operator} />
          )}

          {/* Contact section */}
          {hasInfo && (
            <div className="py-1">
              <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                {isAr ? "بيانات التواصل" : "Contact Info"}
              </p>
              <div className="space-y-3">
                {place.phone && (
                  <ContactRow
                    href={`tel:${place.phone}`}
                    icon={<FaPhone className="text-blue-600 dark:text-blue-400 text-sm" />}
                    iconBg="bg-blue-100 dark:bg-blue-900/40"
                    label={isAr ? "رقم الهاتف" : "Phone"}
                    value={place.phone}
                    callLabel={isAr ? "اتصل" : "Call"}
                  />
                )}
                {place.phone2 && (
                  <ContactRow
                    href={`tel:${place.phone2}`}
                    icon={<FaPhone className="text-emerald-600 dark:text-emerald-400 text-sm" />}
                    iconBg="bg-emerald-100 dark:bg-emerald-900/40"
                    label={isAr ? "الموبايل" : "Mobile"}
                    value={place.phone2}
                  />
                )}
                {place.email && (
                  <ContactRow
                    href={`mailto:${place.email}`}
                    icon={<FaEnvelope className="text-purple-600 dark:text-purple-400 text-sm" />}
                    iconBg="bg-purple-100 dark:bg-purple-900/40"
                    label={isAr ? "البريد الإلكتروني" : "Email"}
                    value={place.email}
                  />
                )}
                {place.website && (
                  <ContactRow
                    href={place.website}
                    target="_blank"
                    icon={<FaGlobe className="text-indigo-600 dark:text-indigo-400 text-sm" />}
                    iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                    label={isAr ? "الموقع الإلكتروني" : "Website"}
                    value={place.website.replace(/^https?:\/\//, "")}
                  />
                )}
              </div>
            </div>
          )}

          {/* Opening hours */}
          {hours.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FaClock className="text-amber-500" />
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  {isAr ? "أوقات العمل" : "Opening Hours"}
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
                {hours.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      background: i % 2 === 0 ? "var(--bg-color)" : "var(--card-bg)",
                      borderTop:  i > 0 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <span className="font-bold text-sm" style={{ color: "var(--text-main)" }}>{row.days}</span>
                    {row.time && (
                      <span className="font-black text-sm px-3 py-1 rounded-lg"
                            style={{ background: "rgba(0,118,247,.1)", color: "#0076f7" }}>
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
            <div className="flex flex-col items-center justify-center py-8 gap-2 rounded-2xl" style={{ background: "var(--bg-color)" }}>
              <span className="text-3xl">📭</span>
              <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>
                {isAr ? "لا تتوفر تفاصيل إضافية حالياً" : "No additional details available"}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {isAr ? "يمكنك إضافة معلومات على OpenStreetMap" : "You can add info on OpenStreetMap"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: "var(--border-color)" }}>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0076f7] text-white font-black no-underline hover:bg-blue-700 transition-all text-sm"
          >
            <FaMapMarkerAlt /> {isAr ? "احصل على الاتجاهات في الخريطة" : "Get Directions on Google Maps"}
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

// ── InfoRow ───────────────────────────────────────────────────────────────────
export function InfoRow({ icon, label, value }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-2xl"
      style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)" }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ background: "var(--card-bg)" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="font-bold text-sm leading-snug" style={{ color: "var(--text-main)" }}>{value}</p>
      </div>
    </div>
  );
}

// ── ContactRow (link variant of InfoRow) ─────────────────────────────────────
function ContactRow({ href, target, icon, iconBg, label, value, callLabel }) {
  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 p-3 rounded-2xl no-underline transition-all hover:scale-[1.01] group"
      style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)" }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="font-black text-sm truncate" style={{ color: "var(--text-main)" }}>{value}</p>
      </div>
      {callLabel && (
        <span className="text-xs text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">{callLabel}</span>
      )}
    </a>
  );
}
