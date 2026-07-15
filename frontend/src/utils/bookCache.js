// Shared module-level cache for book detail data.
// Persists across navigations; populated by Browse search results
// and consumed by BookDetail for instant page loads.
export const detailCache = new Map();
