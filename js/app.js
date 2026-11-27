/**
 * ============================================================================
 * ENTRY POINT UTAMA APLIKASI — MUTABA'AH YAUMIYAH (js/app.js)
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  checkServerConnection();
  setupLoginEvents();

  if (STATE.token && STATE.user) {
    enterAppShell();
  }
});
