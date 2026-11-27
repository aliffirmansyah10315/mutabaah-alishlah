/**
 * ============================================================================
 * UTILITAS FRONTEND — MUTABA'AH YAUMIYAH SMAIT AL ISHLAH GORONTALO (js/utils.js)
 * ============================================================================
 */

const STATE = {
  token: localStorage.getItem((typeof CONFIG !== 'undefined' && CONFIG.STORAGE_TOKEN_KEY) || 'mutabaah_alishlah_token') || '',
  user: JSON.parse(localStorage.getItem((typeof CONFIG !== 'undefined' && CONFIG.STORAGE_USER_KEY) || 'mutabaah_alishlah_user') || 'null'),
  currentPage: 'dashboard',
  chartInstance: null
};

function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showLoader(show, text = 'Memproses data...') {
  const el = document.getElementById('global-loader');
  const txt = document.getElementById('loader-text');
  if (txt) txt.textContent = text;
  if (el) el.classList.toggle('hidden', !show);
}

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  const iconClass = type === 'error' ? 'ri-error-warning-fill' : type === 'warning' ? 'ri-alert-fill' : 'ri-checkbox-circle-fill';
  const colorVar = type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--success)';
  toast.innerHTML = `
    <i class="${iconClass}" style="font-size:18px;color:${colorVar}"></i>
    <div>
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

function openModal(title, bodyHtml) {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = `
    <div class="modal-backdrop" onclick="if(event.target===this) closeModal()">
      <div class="modal-card">
        <div class="modal-header">
          <h3>${escapeHtml(title)}</h3>
          <button type="button" class="btn-icon" onclick="closeModal()"><i class="ri-close-line"></i></button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
      </div>
    </div>
  `;
}

function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
}
