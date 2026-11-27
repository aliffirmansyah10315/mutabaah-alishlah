/**
 * ============================================================================
 * API CLIENT — MUTABA'AH YAUMIYAH (js/api.js)
 * ============================================================================
 */

const API_ENDPOINT = (typeof CONFIG !== 'undefined' && CONFIG.API_URL)
  ? CONFIG.API_URL
  : 'https://script.google.com/macros/s/AKfycbza6ZK1R1vwYWccsKnIo79KSKH7zjehdmSRJJWCaxrN4N61sKmJBR9ea1qavdh2o6HCug/exec';

async function apiCall(action, payload = {}) {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token: STATE.token, payload })
  });
  const json = await res.json();
  if (!json.success) {
    if (json.code === 401 && typeof handleLogout === 'function') handleLogout(true);
    throw new Error(json.message || 'Terjadi kesalahan pada server.');
  }
  return json.data;
}
