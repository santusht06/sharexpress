// urlCache.js
// Persists presigned download URLs in sessionStorage.
// TTL is 9 min — presigned URLs expire at 10min, 1min safety buffer.
// Clears automatically when the tab/browser is closed.

const CACHE_KEY = "sharexpress_download_urls";
const TTL_MS = 9 * 60 * 1000;

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage quota — fail silently
  }
};

export const getCachedUrl = (fileId) => {
  const cache = readCache();
  const entry = cache[fileId];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete cache[fileId];
    writeCache(cache);
    return null;
  }
  return entry.url;
};

export const setCachedUrl = (fileId, url) => {
  const cache = readCache();
  cache[fileId] = { url, expiresAt: Date.now() + TTL_MS };
  writeCache(cache);
};

export const removeCachedUrl = (fileId) => {
  const cache = readCache();
  delete cache[fileId];
  writeCache(cache);
};

export const clearUrlCache = () => {
  sessionStorage.removeItem(CACHE_KEY);
};
