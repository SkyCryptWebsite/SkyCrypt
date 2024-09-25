import credentials from "./credentials.js";

/**
 * Check if a resource is expired based on the cache time
 * @param {number} unixMs Unix timestamp in milliseconds
 * @param {number} cacheTime The cache time in seconds
 * @returns {boolean} Whether the cache is expired
 */
export function isCacheExpired(unixMs, cacheTime) {
  return Date.now() - unixMs > cacheTime * 1000;
}

/**
 * Check if a profile cache is expired based on the configured cache time
 * @param {number} unixMs Unix timestamp in milliseconds
 * @returns {boolean} Whether the cache is expired
 */
export function isProfileCacheExpired(unixMs) {
  return isCacheExpired(unixMs, credentials.cache.profiles);
}

/**
 * Check if a museum cache is expired based on the configured cache time
 * @param {number} unixMs Unix timestamp in milliseconds
 * @returns {boolean} Whether the cache is expired
 */
export function isMuseumCacheExpired(unixMs) {
  return isCacheExpired(unixMs, credentials.cache.museum);
}

/**
 * Check if a guild cache is expired based on the configured cache time
 * @param {number} unixMs Unix timestamp in milliseconds
 * @returns {boolean} Whether the cache is expired
 */
export function isGuildCacheExpired(unixMs) {
  return isCacheExpired(unixMs, credentials.cache.guild);
}

/**
 * Check if a bingo profile cache is expired based on the configured cache time
 * @param {number} unixMs Unix timestamp in milliseconds
 * @returns {boolean} Whether the cache is expired
 */
export function isBingoProfileCacheExpired(unixMs) {
  return isCacheExpired(unixMs, credentials.cache.bingoProfiles);
}
