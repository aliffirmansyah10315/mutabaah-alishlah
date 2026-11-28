/**
 * ============================================================================
 * OTENTIKASI LOGIN, LOGOUT & GANTI PASSWORD (js/auth.js)
 * ============================================================================
 */

const TOKEN_STORAGE_KEY = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_TOKEN_KEY) || 'mutabaah_alishlah_token';
const USER_STORAGE_KEY = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_USER_KEY) || 'mutabaah_alishlah_user';

async function checkServerConnection() {
  const badge = document.getElementById('api-connection-badge');
  const text = document.getElementById('api-connection-text');
  if (!badge || !text) return;

  try {
    const res = await fetch(API_ENDPOINT + '?action=ping');
    const data = await res.json();
    if (data && data.success) {
      badge.className = 'api-status-pill status-online';
      text.textContent = 'Terhubung ke Server API (' + (data.academic_year || '2026/2027') + ')';
    } else {
      throw new Error('Invalid response');
    }
  } catch (err) {
    badge.className = 'api-status-pill status-offline';
    text.textContent = 'Gagal terhubung ke server API';
  }
}

function setupLoginEvents() {
  const form = document.getElementById('login-form');
  const toggleBtn = document.getElementById('toggle-password');
  const pwInput = document.getElementById('login-password');

  if (toggleBtn && pwInput) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = pwInput.type === 'password';
      pwInput.type = isHidden ? 'text' : 'password';
      toggleBtn.innerHTML = isHidden ? '<i class="ri-eye-line"></i>' : '<i class="ri-eye-off-line"></i>';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const errBox = document.getElementById('login-error');
      errBox.classList.add('hidden');

      if (!username || !password) {
        errBox.textContent = 'Username dan kata sandi wajib diisi.';
        errBox.classList.remove('hidden');
        return;
      }

      showLoader(true, 'Memverifikasi akun...');
      try {
        const res = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'login', payload: { username, password } })
        });
        const json = await res.json();
        if (!json.success || !json.data || !json.data.success) {
          throw new Error((json.data && json.data.message) || json.message || 'Username atau kata sandi salah.');
        }

        STATE.token = json.data.token;
        STATE.user = json.data.user;
        localStorage.setItem(TOKEN_STORAGE_KEY, STATE.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(STATE.user));

        showToast('Login Berhasil', 'Selamat datang, ' + STATE.user.full_name);
        enterAppShell();
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
      } finally {
        showLoader(false);
      }
    });
  }
}

function handleLogout(silent = false) {
  if (STATE.token) {
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'logout', token: STATE.token })
    }).catch(() => {});
  }
  STATE.token = '';
  STATE.user = null;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);

  // Bersihkan tema khusus (pink/bunga/kupu-kupu) saat logout agar login screen kembali normal
  document.body.classList.remove('theme-pink-butterfly');
  const decor = document.getElementById('pink-garden-decor');
  if (decor) decor.remove();

  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
  if (!silent) showToast('Keluar Sesi', 'Anda telah keluar dari aplikasi.');
}

function openChangePasswordModal() {
  openModal('Ubah Kata Sandi Akun', `
    <form onsubmit="submitChangePassword(event)">
      <div class="form-group">
        <label>Kata Sandi Lama</label>
        <input type="password" id="cp-old" required>
      </div>
      <div class="form-group">
        <label>Kata Sandi Baru (Minimal 6 karakter)</label>
        <input type="password" id="cp-new" minlength="6" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Simpan Kata Sandi Baru</button>
    </form>
  `);
}

async function submitChangePassword(e) {
  e.preventDefault();
  const oldPassword = document.getElementById('cp-old').value;
  const newPassword = document.getElementById('cp-new').value;
  showLoader(true);
  try {
    const res = await apiCall('changePassword', { oldPassword, newPassword });
    showToast('Berhasil', res.message || 'Kata sandi diperbarui.');
    closeModal();
  } catch (err) {
    showToast('Gagal', err.message, 'error');
  } finally {
    showLoader(false);
  }
}
