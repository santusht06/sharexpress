// urlCache.js
// Persists presigned download URLs in sessionStorage for the browser session.
// Clears automatically when the tab is closed.
// Presigned URLs expire in 600s — we store expiry and skip stale entries.

const CACHE_KEY = "sharexpress_download_urls";
const TTL_MS = 9 * 60 * 1000; // 9 minutes (URLs expire at 10min, give 1min buffer)

// ─── Read the whole cache from sessionStorage ────────────────────────────────
const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// ─── Write the whole cache to sessionStorage ─────────────────────────────────
const writeCache = (cache) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage full or unavailable — fail silently
  }
};

// ─── Get a single URL from cache (returns null if missing or expired) ─────────
export const getCachedUrl = (fileId) => {
  const cache = readCache();
  const entry = cache[fileId];
  if (!entry) return null;

  const isExpired = Date.now() > entry.expiresAt;
  if (isExpired) {
    // Clean up stale entry
    delete cache[fileId];
    writeCache(cache);
    return null;
  }

  return entry.url;
};

// ─── Store a URL in cache with expiry ────────────────────────────────────────
export const setCachedUrl = (fileId, url) => {
  const cache = readCache();
  cache[fileId] = {
    url,
    expiresAt: Date.now() + TTL_MS,
  };
  writeCache(cache);
};

// ─── Check which file IDs are NOT in cache (or expired) ──────────────────────
export const getMissingFileIds = (fileIds) => {
  return fileIds.filter((id) => getCachedUrl(id) === null);
};

// ─── Build a url map for all requested fileIds from cache ────────────────────
export const getUrlMapFromCache = (fileIds) => {
  const map = {};
  fileIds.forEach((id) => {
    const url = getCachedUrl(id);
    if (url) map[id] = url;
  });
  return map;
};

// ─── Remove a single entry (call on file delete) ──────────────────────────────
export const removeCachedUrl = (fileId) => {
  const cache = readCache();
  delete cache[fileId];
  writeCache(cache);
};

// ─── Clear everything (call on delete all) ────────────────────────────────────
export const clearUrlCache = () => {
  sessionStorage.removeItem(CACHE_KEY);
};
