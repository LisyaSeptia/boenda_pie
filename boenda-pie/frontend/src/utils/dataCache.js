// In-memory data cache to enable instant tab/page switching without loading spinners
const cache = new Map();

export const getCachedData = (key) => cache.get(key) || null;

export const setCachedData = (key, data) => {
  cache.set(key, data);
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
