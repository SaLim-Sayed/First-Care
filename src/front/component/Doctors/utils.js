import { MINIA_BBOX } from "./constants";

// ── Overpass query ────────────────────────────────────────────────────────────
export function buildQuery(bbox = MINIA_BBOX) {
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

// ── Parse OSM element into a clean place object ───────────────────────────────
export function parseEl(el) {
  const t   = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;
  return {
    id:           el.id,
    name:         t["name:ar"] || t.name || t["name:en"] || "مرفق صحي",
    nameEn:       t["name:en"] || t.name || "Healthcare Facility",
    category:     t.amenity || "default",
    address:
      [t["addr:street"], t["addr:housenumber"], t["addr:city"]]
        .filter(Boolean)
        .join(", ") || "المنيا، مصر",
    phone:        t.phone || t["contact:phone"] || null,
    phone2:       t["contact:mobile"] || t["mobile"] || null,
    email:        t.email || t["contact:email"] || null,
    website:      t.website || t["contact:website"] || null,
    facebook:     t["contact:facebook"] || null,
    openingHours: t.opening_hours || null,
    specialty:
      t.healthcare_speciality || t["healthcare:speciality"] || t.description || null,
    operator:     t.operator || null,
    beds:         t.beds || null,
    emergency:    t.emergency || null,
    wheelchair:   t.wheelchair || null,
    lat,
    lon,
  };
}

// ── Parse OSM opening_hours string into { days, time } rows ──────────────────
export function parseOpeningHours(raw) {
  if (!raw) return [];
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
