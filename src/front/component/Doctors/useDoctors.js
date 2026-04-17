import { useState, useEffect } from "react";
import axios from "axios";
import { buildQuery, parseEl } from "./utils";
import { MINIA_BBOX } from "./constants";

/**
 * Fetches healthcare facilities in Minia from the Overpass API.
 * Returns { places, loading, error }.
 */
export function useDoctors(isAr) {
  const [places,  setPlaces]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.post(
          "https://overpass-api.de/api/interpreter",
          buildQuery(MINIA_BBOX),
          { headers: { "Content-Type": "text/plain" } },
        );
        if (!cancelled) {
          const parsed = (res.data.elements || []).map(parseEl).filter(Boolean);
          setPlaces(parsed);
        }
      } catch {
        if (!cancelled)
          setError(
            isAr
              ? "تعذر تحميل البيانات. يرجى المحاولة لاحقاً."
              : "Failed to load data. Please try again later.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);               // fetch once on mount

  return { places, loading, error };
}
