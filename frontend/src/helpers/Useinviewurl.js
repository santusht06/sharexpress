// useInViewUrl.js
// Custom hook that uses IntersectionObserver to fetch a presigned download URL
// only when the card scrolls into (or near) the viewport.
// Cache is checked first — no network call if URL is already stored.

import { useState, useEffect, useRef } from "react";
import { getCachedUrl, setCachedUrl } from "./urlCache";

const PREVIEWABLE_EXTS = ["png", "jpg", "jpeg", "webp", "pdf", "doc", "docx"];

const isPreviewable = (filename = "") => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return PREVIEWABLE_EXTS.includes(ext);
};

const useInViewUrl = (file) => {
  const ref = useRef(null);
  const [url, setUrl] = useState(() => getCachedUrl(file?.file_id) || null);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false); // prevent double-fetch in StrictMode

  useEffect(() => {
    // If already cached or file not previewable, skip observer entirely
    if (url || !file?.file_id || !isPreviewable(file?.filename)) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry.isIntersecting) return;
        if (fetchedRef.current) return;

        // Stop observing — we only need one trigger
        observer.disconnect();
        fetchedRef.current = true;

        // Check cache one more time (another card may have populated it)
        const cached = getCachedUrl(file.file_id);
        if (cached) {
          setUrl(cached);
          return;
        }

        // Fetch from backend
        setLoading(true);
        fetch(`http://localhost:8000/files/download/${file.file_id}`, {
          credentials: "include",
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .then((data) => {
            const downloadUrl = data?.download_url;
            if (downloadUrl) {
              setCachedUrl(file.file_id, downloadUrl);
              setUrl(downloadUrl);
            }
          })
          .catch((err) => {
            console.error("❌ useInViewUrl fetch failed:", file.file_id, err);
          })
          .finally(() => setLoading(false));
      },
      {
        // rootMargin: start fetching 200px BEFORE card enters viewport
        // so the preview is ready by the time the user sees it
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [file?.file_id, file?.filename]); // re-run if file changes

  return { ref, url, loading };
};

export default useInViewUrl;
