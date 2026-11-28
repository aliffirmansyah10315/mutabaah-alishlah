/**
 * ============================================================================
 * NAVIGASI SIDEBAR & ROUTER HALAMAN — MUTABA'AH YAUMIYAH (js/navigation.js)
 * ============================================================================
 */

const ROLE_MENUS = {
  ADMIN: [
    { section: 'Utama', items: [
      { id: 'dashboard', label: 'Dashboard Utama', icon: 'ri-dashboard-3-line' },
      { id: 'recap-report', label: 'Laporan & Rekapitulasi', icon: 'ri-file-chart-line' }
    ]},
    { section: 'Mutaba’ah & Poin', items: [
      { id: 'mutabaah-verify', label: 'Data & Verifikasi Mutaba’ah', icon: 'ri-checkbox-multiple-line' },
      { id: 'mutabaah-indicators', label: 'Indikator Mutaba’ah', icon: 'ri-list-check-2' },
      { id: 'point-approvals', label: 'Persetujuan & Input Poin', icon: 'ri-award-line' },
      { id: 'point-categories', label: 'Kategori Poin', icon: 'ri-price-tag-3-line' }
    ]},
    { section: 'Data Master', items: [
      { id: 'students', label: 'Data Siswa Asrama', icon: 'ri-group-line' },
      { id: 'classes-teachers', label: 'Kelas & Musyrif/Guru', icon: 'ri-building-2-line' },
      { id: 'users', label: 'Manajemen Akun Pengguna', icon: 'ri-shield-user-line' }
    ]}
  ],
  GURU: [
    { section: 'Utama', items: [
      { id: 'dashboard', label: 'Dashboard Musyrif/Guru', icon: 'ri-dashboard-3-line' },
      { id: 'recap-report', label: 'Rekapitulasi Kelas', icon: 'ri-file-chart-line' }
    ]},
    { section: 'Pembinaan Siswa Asrama', items: [
      { id: 'mutabaah-verify', label: 'Verifikasi Mutaba’ah', icon: 'ri-checkbox-multiple-line' },
      { id: 'point-approvals', label: 'Persetujuan & Input Poin', icon: 'ri-award-line' },
      { id: 'students', label: 'Daftar Siswa Asrama Binaan', icon: 'ri-group-line' }
    ]}
  ],
  SISWA: [
    { section: 'Menu Siswa Asrama', items: [
      { id: 'dashboard', label: 'Beranda Saya', icon: 'ri-home-smile-line' },
      { id: 'student-mutabaah', label: 'Isi Mutaba’ah Harian', icon: 'ri-edit-box-line' },
      { id: 'student-points', label: 'Riwayat & Ajukan Poin', icon: 'ri-medal-line' }
    ]}
  ],
  ORANG_TUA: [
    { section: 'Portal Orang Tua', items: [
      { id: 'dashboard', label: 'Pantauan Putra/Putri', icon: 'ri-parent-line' }
    ]}
  ]
};

function enterAppShell() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');

  const u = STATE.user;
  document.getElementById('sidebar-fullname').textContent = u.full_name;
  document.getElementById('sidebar-role-badge').textContent = u.role.replace('_', ' ');
  document.getElementById('sidebar-avatar').textContent = (u.full_name || 'U').charAt(0).toUpperCase();
  document.getElementById('topbar-today-date').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  applyCustomUserTheme(u);
  renderSidebarMenu();
  navigateTo('dashboard');
}

function applyCustomUserTheme(user) {
  const uname = String((user && user.username) || '').trim().toLowerCase();
  const existingDecor = document.getElementById('pink-garden-decor');
  if (existingDecor) existingDecor.remove();

  if (uname === 'shofiyyah037') {
    document.body.classList.add('theme-pink-butterfly');
    const decor = document.createElement('div');
    decor.id = 'pink-garden-decor';
    decor.className = 'pink-garden-decor';
    decor.innerHTML = `
      <svg class="garden-float garden-corner-tl" viewBox="0 0 120 120" fill="none">
        <circle cx="28" cy="28" r="14" fill="#F9A8D4"/>
        <circle cx="52" cy="22" r="12" fill="#F472B6"/>
        <circle cx="22" cy="52" r="12" fill="#F472B6"/>
        <circle cx="36" cy="36" r="7" fill="#FDE047"/>
        <path d="M10 75C30 60 55 35 80 10" stroke="#EC4899" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <svg class="garden-float garden-corner-br" viewBox="0 0 120 120" fill="none">
        <circle cx="28" cy="28" r="14" fill="#F9A8D4"/>
        <circle cx="52" cy="22" r="12" fill="#F472B6"/>
        <circle cx="22" cy="52" r="12" fill="#F472B6"/>
        <circle cx="36" cy="36" r="7" fill="#FDE047"/>
        <path d="M10 75C30 60 55 35 80 10" stroke="#EC4899" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <span class="garden-float butterfly-1">🦋</span>
      <span class="garden-float butterfly-2">🦋</span>
      <span class="garden-float butterfly-3">🦋</span>
      <span class="garden-float flower-1">🌸</span>
      <span class="garden-float flower-2">🌺</span>
      <span class="garden-float flower-3">🌷</span>
    `;
    document.body.appendChild(decor);
  } else {
    document.body.classList.remove('theme-pink-butterfly');
  }
}

function renderSidebarMenu() {
  const nav = document.getElementById('sidebar-nav');
  const groups = ROLE_MENUS[STATE.user.role] || ROLE_MENUS.SISWA;
  nav.innerHTML = groups.map(g => `
    <div class="nav-section-label">${escapeHtml(g.section)}</div>
    ${g.items.map(item => `
      <button type="button" class="nav-item ${STATE.currentPage === item.id ? 'active' : ''}" data-page="${item.id}" onclick="navigateTo('${item.id}')">
        <i class="${item.icon}"></i>
        <span>${escapeHtml(item.label)}</span>
      </button>
    `).join('')}
  `).join('');
}

function toggleMobileSidebar(open) {
  document.getElementById('app-sidebar').classList.toggle('open', open);
  document.getElementById('sidebar-backdrop').classList.toggle('hidden', !open);
}

async function navigateTo(pageId) {
  STATE.currentPage = pageId;
  toggleMobileSidebar(false);
  renderSidebarMenu();

  const container = document.getElementById('main-content');
  container.innerHTML = `<div class="card"><div class="card-body" style="text-align:center;padding:40px;"><div class="spinner"></div><p>Memuat halaman...</p></div></div>`;

  try {
    switch (pageId) {
      case 'dashboard':
        if (STATE.user.role === 'ADMIN') await renderAdminDashboard(container);
        else if (STATE.user.role === 'GURU') await renderTeacherDashboard(container);
        else if (STATE.user.role === 'SISWA') await renderStudentDashboard(container);
        else await renderParentDashboard(container);
        break;
      case 'recap-report': await renderRecapReportPage(container); break;
      case 'mutabaah-verify': await renderMutabaahVerifyPage(container); break;
      case 'mutabaah-indicators': await renderIndicatorsPage(container); break;
      case 'point-approvals': await renderPointApprovalsPage(container); break;
      case 'point-categories': await renderPointCategoriesPage(container); break;
      case 'students': await renderStudentsPage(container); break;
      case 'classes-teachers': await renderClassesTeachersPage(container); break;
      case 'users': await renderUsersPage(container); break;
      case 'student-mutabaah': await renderStudentMutabaahFormPage(container); break;
      case 'student-points': await renderStudentPointsPage(container); break;
      default: container.innerHTML = `<div class="alert alert-warning">Halaman tidak ditemukan.</div>`;
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger"><strong>Gagal memuat data:</strong> ${escapeHtml(err.message)}</div>`;
  }
}

async function openNotificationsModal() {
  showLoader(true, 'Memuat notifikasi...');
  try {
    const list = await apiCall('getNotifications');
    const html = list.length === 0
      ? '<p style="color:var(--text-muted);text-align:center;padding:20px;">Belum ada notifikasi baru.</p>'
      : list.map(n => `
          <div style="padding:12px;border-bottom:1px solid var(--border-color);">
            <div style="font-weight:700;font-size:13.5px;">${escapeHtml(n.title)}</div>
            <div style="font-size:12.5px;color:var(--text-secondary);margin-top:3px;">${escapeHtml(n.message)}</div>
          </div>
        `).join('');
    openModal('Notifikasi Terbaru', html);
  } catch (err) {
    showToast('Gagal', err.message, 'error');
  } finally {
    showLoader(false);
  }
}
