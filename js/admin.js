/**
 * ============================================================================
 * MODUL HALAMAN ADMIN — MUTABA'AH YAUMIYAH (js/admin.js)
 * ============================================================================
 */

async function renderAdminDashboard(container) {
  document.getElementById('topbar-page-title').textContent = 'Dashboard Utama Admin';
  document.getElementById('topbar-page-subtitle').textContent = 'Ringkasan Aktivitas Ibadah & Kedisiplinan Siswa Asrama';

  const data = await apiCall('getDashboard');
  const s = data.summary || {};
  const top3 = data.top3_students || [];

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div>
          <div class="stat-label">Total Siswa Asrama</div>
          <div class="stat-value">${s.total_students || 0}</div>
          <div class="stat-sub">Tahun Ajaran 2026/2027</div>
        </div>
        <div class="stat-icon"><i class="ri-group-line"></i></div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Sudah Isi Mutaba’ah Hari Ini</div>
          <div class="stat-value">${s.filled_today_count || 0}</div>
          <div class="stat-sub">Belum mengisi: ${s.unfilled_today_count || 0} siswa</div>
        </div>
        <div class="stat-icon info"><i class="ri-checkbox-circle-line"></i></div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Pengajuan Poin Menunggu</div>
          <div class="stat-value">${s.pending_points_count || 0}</div>
          <div class="stat-sub">Perlu persetujuan Admin/Musyrif</div>
        </div>
        <div class="stat-icon gold"><i class="ri-time-line"></i></div>
      </div>
      <div class="stat-card">
        <div>
          <div class="stat-label">Indikator Mutaba’ah Aktif</div>
          <div class="stat-value">${s.active_indicators_count || 0}</div>
          <div class="stat-sub">Target ibadah harian</div>
        </div>
        <div class="stat-icon"><i class="ri-list-check-2"></i></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-trophy-line"></i> Top 3 Siswa Asrama Teladan (Poin Tertinggi)</div>
      </div>
      <div class="card-body">
        <div class="top3-grid">
          ${top3.length === 0 ? '<p style="color:var(--text-muted);">Belum ada data poin disetujui.</p>' : top3.map((st, idx) => `
            <div class="top3-card">
              <div class="top3-rank"><i class="ri-medal-fill"></i> Peringkat #${idx + 1}</div>
              <div style="font-weight:800;font-size:15px;">${escapeHtml(st.full_name)}</div>
              <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">${escapeHtml(st.class_name)}</div>
              <div style="display:flex;justify-content:space-between;font-size:12.5px;border-top:1px solid var(--gold-border);padding-top:8px;">
                <span>Tertib: <strong style="color:var(--success)">+${st.total_tertib}</strong></span>
                <span>Pelanggaran: <strong style="color:var(--danger)">-${st.total_pelanggaran}</strong></span>
                <span>Akhir: <strong>${st.poin_akhir}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-line-chart-line"></i> Tren Kepatuhan Mutaba’ah 7 Hari Terakhir (%)</div>
      </div>
      <div class="card-body">
        <canvas id="adminTrendChart" height="95"></canvas>
      </div>
    </div>
  `;

  renderTrendChart('adminTrendChart', data.trend_7_days || []);
}

function renderTrendChart(canvasId, trendData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx || typeof Chart === 'undefined') return;
  if (STATE.chartInstance) STATE.chartInstance.destroy();
  STATE.chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.map(d => d.date),
      datasets: [{
        label: 'Rata-rata Capaian Ibadah (%)',
        data: trendData.map(d => d.avg_completion),
        borderColor: '#0f5132',
        backgroundColor: 'rgba(15, 81, 50, 0.12)',
        fill: true,
        tension: 0.35
      }]
    },
    options: { responsive: true, scales: { y: { min: 0, max: 100 } } }
  });
}

async function renderIndicatorsPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Indikator Mutaba’ah Harian';
  document.getElementById('topbar-page-subtitle').textContent = 'Kelola daftar amalan harian siswa asrama';

  const list = await apiCall('getIndicators', { includeInactive: true });
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-list-check-2"></i> Daftar Indikator Mutaba’ah</div>
        <button class="btn btn-primary btn-sm" onclick="openIndicatorFormModal()"><i class="ri-add-line"></i> Tambah Indikator</button>
      </div>
      <div class="card-body table-responsive">
        <table>
          <thead>
            <tr><th>Kode</th><th>Judul Amalan</th><th>Kategori</th><th>Tipe Input</th><th>Bobot</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            ${list.map(ind => `
              <tr>
                <td><strong>${escapeHtml(ind.code)}</strong></td>
                <td>${escapeHtml(ind.title)}<br><small style="color:var(--text-muted)">${escapeHtml(ind.target_info)}</small></td>
                <td>${escapeHtml(ind.category)}</td>
                <td><span class="badge badge-neutral">${escapeHtml(ind.input_type)}</span></td>
                <td>${ind.weight}%</td>
                <td>${ind.is_active ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-danger">Nonaktif</span>'}</td>
                <td><button class="btn btn-outline btn-sm" onclick='openIndicatorFormModal(${JSON.stringify(ind)})'>Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openIndicatorFormModal(ind = null) {
  openModal(ind ? 'Edit Indikator Mutaba’ah' : 'Tambah Indikator Mutaba’ah', `
    <form onsubmit="submitIndicatorForm(event, '${ind ? ind.indicator_id : ''}')">
      <div class="form-row">
        <div class="form-group"><label>Kode</label><input type="text" id="ind-code" value="${escapeHtml(ind ? ind.code : '')}" placeholder="SHL-04" required></div>
        <div class="form-group"><label>Kategori</label><input type="text" id="ind-cat" value="${escapeHtml(ind ? ind.category : 'Shalat Sunnah')}" required></div>
      </div>
      <div class="form-group"><label>Judul Indikator</label><input type="text" id="ind-title" value="${escapeHtml(ind ? ind.title : '')}" required></div>
      <div class="form-row">
        <div class="form-group">
          <label>Tipe Input</label>
          <select id="ind-type">
            <option value="BOOLEAN" ${ind && ind.input_type === 'BOOLEAN' ? 'selected' : ''}>Ya / Tidak (Checklist)</option>
            <option value="NUMBER" ${ind && ind.input_type === 'NUMBER' ? 'selected' : ''}>Angka (Halaman/Rakaat)</option>
          </select>
        </div>
        <div class="form-group"><label>Bobot (%)</label><input type="number" id="ind-weight" value="${ind ? ind.weight : 10}" min="1" max="100" required></div>
      </div>
      <div class="form-group"><label>Keterangan Target</label><input type="text" id="ind-target" value="${escapeHtml(ind ? ind.target_info : '')}"></div>
      <button type="submit" class="btn btn-primary btn-block">Simpan Indikator</button>
    </form>
  `);
}

async function submitIndicatorForm(e, indicatorId) {
  e.preventDefault();
  showLoader(true);
  try {
    const res = await apiCall('saveIndicator', {
      indicator_id: indicatorId || undefined,
      code: document.getElementById('ind-code').value,
      category: document.getElementById('ind-cat').value,
      title: document.getElementById('ind-title').value,
      input_type: document.getElementById('ind-type').value,
      weight: document.getElementById('ind-weight').value,
      target_info: document.getElementById('ind-target').value
    });
    showToast('Berhasil', res.message || 'Indikator tersimpan.');
    closeModal();
    navigateTo('mutabaah-indicators');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}

async function renderPointCategoriesPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Kategori Poin Tertib & Pelanggaran';
  document.getElementById('topbar-page-subtitle').textContent = 'Atur jenis poin pembinaan siswa asrama';

  const list = await apiCall('getPointCategories', { includeInactive: true });
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-price-tag-3-line"></i> Daftar Kategori Poin</div>
        <button class="btn btn-primary btn-sm" onclick="openPointCatModal()"><i class="ri-add-line"></i> Tambah Kategori Poin</button>
      </div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Kode</th><th>Jenis</th><th>Judul Kategori</th><th>Poin Default</th><th>Keterangan</th><th>Aksi</th></tr></thead>
          <tbody>
            ${list.map(c => `
              <tr>
                <td><strong>${escapeHtml(c.code)}</strong></td>
                <td><span class="badge ${c.type === 'TERTIB' ? 'badge-success' : 'badge-danger'}">${escapeHtml(c.type)}</span></td>
                <td>${escapeHtml(c.title)}</td>
                <td><strong>${c.default_points}</strong></td>
                <td>${escapeHtml(c.description)}</td>
                <td><button class="btn btn-outline btn-sm" onclick='openPointCatModal(${JSON.stringify(c)})'>Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openPointCatModal(cat = null) {
  openModal(cat ? 'Edit Kategori Poin' : 'Tambah Kategori Poin', `
    <form onsubmit="submitPointCatForm(event, '${cat ? cat.category_id : ''}')">
      <div class="form-row">
        <div class="form-group">
          <label>Jenis Poin</label>
          <select id="pcat-type">
            <option value="TERTIB" ${cat && cat.type === 'TERTIB' ? 'selected' : ''}>TERTIB (Penambah)</option>
            <option value="PELANGGARAN" ${cat && cat.type === 'PELANGGARAN' ? 'selected' : ''}>PELANGGARAN (Pengurang)</option>
          </select>
        </div>
        <div class="form-group"><label>Kode</label><input type="text" id="pcat-code" value="${escapeHtml(cat ? cat.code : '')}" required></div>
      </div>
      <div class="form-group"><label>Nama Kategori Poin</label><input type="text" id="pcat-title" value="${escapeHtml(cat ? cat.title : '')}" required></div>
      <div class="form-group"><label>Jumlah Poin Default</label><input type="number" id="pcat-pts" value="${cat ? cat.default_points : 10}" min="1" required></div>
      <div class="form-group"><label>Deskripsi</label><input type="text" id="pcat-desc" value="${escapeHtml(cat ? cat.description : '')}"></div>
      <button type="submit" class="btn btn-primary btn-block">Simpan Kategori Poin</button>
    </form>
  `);
}

async function submitPointCatForm(e, categoryId) {
  e.preventDefault();
  showLoader(true);
  try {
    const res = await apiCall('savePointCategory', {
      category_id: categoryId || undefined,
      type: document.getElementById('pcat-type').value,
      code: document.getElementById('pcat-code').value,
      title: document.getElementById('pcat-title').value,
      default_points: document.getElementById('pcat-pts').value,
      description: document.getElementById('pcat-desc').value
    });
    showToast('Berhasil', res.message || 'Kategori poin disimpan.');
    closeModal();
    navigateTo('point-categories');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}

async function renderStudentsPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Data Siswa Asrama';
  document.getElementById('topbar-page-subtitle').textContent = 'Daftar siswa asrama aktif SMAIT Al Ishlah Gorontalo';

  const students = await apiCall('getStudents');
  const isAdmin = STATE.user.role === 'ADMIN';

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-group-line"></i> Daftar Siswa Asrama (${students.length})</div>
        ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="openStudentModal()"><i class="ri-user-add-line"></i> Tambah Siswa Asrama</button>` : ''}
      </div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>ID / NIS</th><th>Nama Lengkap</th><th>L/P</th><th>Kelas</th><th>Kamar</th><th>Poin Akhir</th>${isAdmin ? '<th>Aksi</th>' : ''}</tr></thead>
          <tbody>
            ${students.map(st => `
              <tr>
                <td><strong>${escapeHtml(st.student_id)}</strong><br><small>${escapeHtml(st.nis || '-')}</small></td>
                <td>${escapeHtml(st.full_name)}</td>
                <td>${escapeHtml(st.gender)}</td>
                <td>${escapeHtml(st.class_name)}</td>
                <td>${escapeHtml(st.dorm_room || '-')}</td>
                <td><span class="badge ${st.poin_akhir >= 0 ? 'badge-success' : 'badge-danger'}">${st.poin_akhir} Poin</span></td>
                ${isAdmin ? `<td><button class="btn btn-outline btn-sm" onclick='openStudentModal(${JSON.stringify(st)})'>Edit</button></td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openStudentModal(st = null) {
  openModal(st ? 'Edit Data Siswa Asrama' : 'Tambah Siswa Asrama', `
    <form onsubmit="submitStudentForm(event, '${st ? st.student_id : ''}')">
      <div class="form-group"><label>Nama Lengkap</label><input type="text" id="st-name" value="${escapeHtml(st ? st.full_name : '')}" required></div>
      <div class="form-row">
        <div class="form-group"><label>NIS</label><input type="text" id="st-nis" value="${escapeHtml(st ? st.nis : '')}"></div>
        <div class="form-group">
          <label>Jenis Kelamin</label>
          <select id="st-gender">
            <option value="L" ${st && st.gender === 'L' ? 'selected' : ''}>Laki-laki (Ikhwan)</option>
            <option value="P" ${st && st.gender === 'P' ? 'selected' : ''}>Perempuan (Akhwat)</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Kelas</label>
          <select id="st-class">
            <option value="CLS-X-2026" ${st && st.class_id === 'CLS-X-2026' ? 'selected' : ''}>Kelas X</option>
            <option value="CLS-XI-2026" ${st && st.class_id === 'CLS-XI-2026' ? 'selected' : ''}>Kelas XI</option>
            <option value="CLS-XII-2026" ${st && st.class_id === 'CLS-XII-2026' ? 'selected' : ''}>Kelas XII</option>
          </select>
        </div>
        <div class="form-group"><label>Kamar Asrama</label><input type="text" id="st-room" value="${escapeHtml(st ? st.dorm_room : '')}"></div>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Simpan Data Siswa Asrama</button>
    </form>
  `);
}

async function submitStudentForm(e, studentId) {
  e.preventDefault();
  showLoader(true);
  try {
    const res = await apiCall('saveStudent', {
      student_id: studentId || undefined,
      full_name: document.getElementById('st-name').value,
      nis: document.getElementById('st-nis').value,
      gender: document.getElementById('st-gender').value,
      class_id: document.getElementById('st-class').value,
      dorm_room: document.getElementById('st-room').value
    });
    showToast('Berhasil', res.message || 'Data tersimpan.');
    closeModal();
    navigateTo('students');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}

async function renderClassesTeachersPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Kelas & Musyrif/Guru';
  document.getElementById('topbar-page-subtitle').textContent = 'Pengaturan rombongan belajar dan pembina asrama';

  const data = await apiCall('getClassesAndTeachers');
  container.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="ri-building-2-line"></i> Daftar Kelas</div></div>
        <div class="card-body table-responsive">
          <table>
            <thead><tr><th>Kelas</th><th>Tahun Ajaran</th><th>Musyrif / Wali</th></tr></thead>
            <tbody>
              ${(data.classes || []).map(c => `
                <tr><td><strong>${escapeHtml(c.class_name)}</strong></td><td>${escapeHtml(c.academic_year)}</td><td>${escapeHtml(c.teacher_name)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="ri-user-star-line"></i> Daftar Musyrif / Guru</div></div>
        <div class="card-body table-responsive">
          <table>
            <thead><tr><th>Nama Lengkap</th><th>Jabatan</th><th>No. HP</th></tr></thead>
            <tbody>
              ${(data.teachers || []).map(t => `
                <tr><td><strong>${escapeHtml(t.full_name)}</strong></td><td>${escapeHtml(t.position)}</td><td>${escapeHtml(t.phone || '-')}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function renderUsersPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Manajemen Akun Pengguna';
  document.getElementById('topbar-page-subtitle').textContent = 'Kelola akun login Admin, Musyrif/Guru, Siswa Asrama, dan Orang Tua';

  const users = await apiCall('getUsers');
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-shield-user-line"></i> Daftar Akun Terdaftar (${users.length})</div>
        <button class="btn btn-primary btn-sm" onclick="openUserModal()"><i class="ri-user-add-line"></i> Buat Akun Baru</button>
      </div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Username</th><th>Nama Lengkap</th><th>Peran</th><th>ID Referensi</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${escapeHtml(u.username)}</strong></td>
                <td>${escapeHtml(u.full_name)}</td>
                <td><span class="badge badge-info">${escapeHtml(u.role)}</span></td>
                <td>${escapeHtml(u.ref_id || '-')}</td>
                <td>${u.is_active ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-danger">Nonaktif</span>'}</td>
                <td><button class="btn btn-outline btn-sm" onclick='openUserModal(${JSON.stringify(u)})'>Edit / Reset PW</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openUserModal(u = null) {
  openModal(u ? 'Edit Akun & Reset Password' : 'Buat Akun Pengguna Baru', `
    <form onsubmit="submitUserForm(event, '${u ? u.user_id : ''}')">
      <div class="form-row">
        <div class="form-group"><label>Username</label><input type="text" id="usr-username" value="${escapeHtml(u ? u.username : '')}" required></div>
        <div class="form-group">
          <label>Peran (Role)</label>
          <select id="usr-role">
            <option value="ADMIN" ${u && u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
            <option value="GURU" ${u && u.role === 'GURU' ? 'selected' : ''}>GURU / MUSYRIF</option>
            <option value="SISWA" ${u && u.role === 'SISWA' ? 'selected' : ''}>SISWA ASRAMA</option>
            <option value="ORANG_TUA" ${u && u.role === 'ORANG_TUA' ? 'selected' : ''}>ORANG TUA</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Nama Lengkap</label><input type="text" id="usr-fullname" value="${escapeHtml(u ? u.full_name : '')}" required></div>
      <div class="form-row">
        <div class="form-group"><label>ID Referensi (Misal: STD-2026-001)</label><input type="text" id="usr-ref" value="${escapeHtml(u ? u.ref_id : '')}"></div>
        <div class="form-group"><label>${u ? 'Password Baru (Kosongkan jika tetap)' : 'Password (Min 6 karakter)'}</label><input type="password" id="usr-pw" ${u ? '' : 'required minlength="6"'}></div>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Simpan Akun</button>
    </form>
  `);
}

async function submitUserForm(e, userId) {
  e.preventDefault();
  showLoader(true);
  try {
    const res = await apiCall('saveUser', {
      user_id: userId || undefined,
      username: document.getElementById('usr-username').value,
      role: document.getElementById('usr-role').value,
      full_name: document.getElementById('usr-fullname').value,
      ref_id: document.getElementById('usr-ref').value,
      password: document.getElementById('usr-pw').value
    });
    showToast('Berhasil', res.message || 'Akun berhasil disimpan.');
    closeModal();
    navigateTo('users');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}
