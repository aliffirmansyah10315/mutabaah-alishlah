/**
 * ============================================================================
 * MODUL HALAMAN SISWA ASRAMA — MUTABA'AH YAUMIYAH (js/student.js)
 * ============================================================================
 */

async function renderStudentDashboard(container) {
  document.getElementById('topbar-page-title').textContent = 'Beranda Siswa Asrama';
  document.getElementById('topbar-page-subtitle').textContent = 'Pantau capaian ibadah harian dan poin ketertiban Anda';

  const data = await apiCall('getDashboard');
  const p = (data.personal_profiles && data.personal_profiles[0]) || {
    full_name: STATE.user.full_name, class_name: '-', dorm_room: '-',
    filled_today: false, points: { total_tertib: 0, total_pelanggaran: 0, poin_akhir: 0 }, recent_records: []
  };

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div>
          <div class="stat-label">Status Mutaba’ah Hari Ini</div>
          <div class="stat-value" style="font-size:20px;">${p.filled_today ? 'Sudah Mengisi' : 'Belum Mengisi'}</div>
          <div class="stat-sub">${p.filled_today ? 'Capaian: ' + p.today_record.completion_rate + '%' : 'Segera isi amalan hari ini'}</div>
        </div>
        <div class="stat-icon ${p.filled_today ? '' : 'gold'}"><i class="ri-calendar-check-line"></i></div>
      </div>
      <div class="stat-card">
        <div><div class="stat-label">Total Poin Tertib</div><div class="stat-value" style="color:var(--success)">+${p.points.total_tertib}</div></div>
        <div class="stat-icon"><i class="ri-medal-line"></i></div>
      </div>
      <div class="stat-card">
        <div><div class="stat-label">Poin Akhir Anda</div><div class="stat-value">${p.points.poin_akhir}</div><div class="stat-sub">Pelanggaran: -${p.points.total_pelanggaran}</div></div>
        <div class="stat-icon info"><i class="ri-award-line"></i></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-history-line"></i> Riwayat Mutaba’ah Terakhir</div>
        <button class="btn btn-primary btn-sm" onclick="navigateTo('student-mutabaah')"><i class="ri-edit-box-line"></i> Isi Mutaba’ah Hari Ini</button>
      </div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Tanggal</th><th>Capaian</th><th>Status Verifikasi</th><th>Catatan Musyrif</th></tr></thead>
          <tbody>
            ${(p.recent_records || []).length === 0 ? '<tr><td colspan="4" style="text-align:center;">Belum ada riwayat mutaba’ah.</td></tr>' : p.recent_records.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.record_date)}</strong></td>
                <td>${r.completion_rate}%</td>
                <td><span class="badge ${r.verification_status === 'TERVERIFIKASI' ? 'badge-success' : 'badge-warning'}">${escapeHtml(r.verification_status)}</span></td>
                <td>${escapeHtml(r.teacher_note || '-')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function renderStudentMutabaahFormPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Isi Mutaba’ah Harian';
  document.getElementById('topbar-page-subtitle').textContent = 'Centang atau isi amalan yang telah Anda laksanakan';

  const indicators = await apiCall('getIndicators');
  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="ri-edit-box-line"></i> Lembar Mutaba’ah Yaumiyah</div></div>
      <div class="card-body">
        <form id="student-mtb-form">
          <div class="form-group" style="max-width:260px;">
            <label>Tanggal Mutaba’ah</label>
            <input type="date" id="mtb-date" value="${getTodayStr()}" max="${getTodayStr()}" required>
          </div>

          ${indicators.map(ind => `
            <div class="indicator-item">
              <div>
                <div style="font-weight:700;">${escapeHtml(ind.title)}</div>
                <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(ind.category)} • Target: ${escapeHtml(ind.target_info)}</div>
              </div>
              ${ind.input_type === 'NUMBER'
                ? `<input type="number" class="mtb-ind-input" data-id="${ind.indicator_id}" data-type="NUMBER" min="0" value="0" style="width:90px;">`
                : `<input type="checkbox" class="indicator-check mtb-ind-input" data-id="${ind.indicator_id}" data-type="BOOLEAN">`
              }
            </div>
          `).join('')}

          <div class="form-group" style="margin-top:16px;">
            <label>Catatan / Muhasabah Harian (Opsional)</label>
            <textarea id="mtb-note" rows="2" placeholder="Tuliskan catatan ibadah atau kendala hari ini..."></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg"><i class="ri-save-line"></i> Simpan Laporan Mutaba’ah</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('student-mtb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const entries = {};
    document.querySelectorAll('.mtb-ind-input').forEach(el => {
      const id = el.getAttribute('data-id');
      const type = el.getAttribute('data-type');
      entries[id] = type === 'NUMBER' ? Number(el.value || 0) : el.checked;
    });

    showLoader(true, 'Menyimpan mutaba’ah...');
    try {
      const res = await apiCall('submitMutabaah', {
        record_date: document.getElementById('mtb-date').value,
        entries,
        student_note: document.getElementById('mtb-note').value
      });
      showToast('Alhamdulillah', res.message || 'Mutaba’ah tersimpan.');
      navigateTo('dashboard');
    } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
  });
}

async function renderStudentPointsPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Riwayat & Pengajuan Poin';
  document.getElementById('topbar-page-subtitle').textContent = 'Ajukan klaim poin ketertiban/prestasi untuk diverifikasi Musyrif';

  const [trxs, cats] = await Promise.all([apiCall('getPointTransactions'), apiCall('getPointCategories')]);
  const tertibCats = cats.filter(c => c.type === 'TERTIB');

  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="ri-add-circle-line"></i> Ajukan Poin Ketertiban / Prestasi</div></div>
      <div class="card-body">
        <form id="student-point-form" class="form-row" style="align-items:end;">
          <div class="form-group" style="margin-bottom:0;">
            <label>Kategori Poin Tertib</label>
            <select id="sp-cat" required>
              ${tertibCats.map(c => `<option value="${c.category_id}" data-pts="${c.default_points}">${escapeHtml(c.title)} (+${c.default_points} poin)</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label>Keterangan Bukti / Saksi</label>
            <input type="text" id="sp-notes" placeholder="Contoh: Disaksikan Ustadz Fauzan" required>
          </div>
          <button type="submit" class="btn btn-primary">Kirim Pengajuan</button>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><i class="ri-history-line"></i> Riwayat Poin Saya</div></div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Tanggal</th><th>Jenis</th><th>Kategori</th><th>Poin</th><th>Status</th></tr></thead>
          <tbody>
            ${trxs.length === 0 ? '<tr><td colspan="5" style="text-align:center;">Belum ada riwayat poin.</td></tr>' : trxs.map(t => `
              <tr>
                <td>${escapeHtml(t.transaction_date)}</td>
                <td><span class="badge ${t.point_type === 'TERTIB' ? 'badge-success' : 'badge-danger'}">${escapeHtml(t.point_type)}</span></td>
                <td>${escapeHtml(t.category_name)}</td>
                <td><strong>${t.points}</strong></td>
                <td><span class="badge ${t.status === 'DISETUJUI' ? 'badge-success' : t.status === 'DITOLAK' ? 'badge-danger' : 'badge-warning'}">${escapeHtml(t.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('student-point-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sel = document.getElementById('sp-cat');
    const opt = sel.options[sel.selectedIndex];
    showLoader(true);
    try {
      const res = await apiCall('submitPoint', {
        point_type: 'TERTIB',
        category_id: sel.value,
        points: opt.getAttribute('data-pts'),
        notes: document.getElementById('sp-notes').value
      });
      showToast('Terkirim', res.message || 'Pengajuan poin menunggu persetujuan Musyrif.');
      navigateTo('student-points');
    } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
  });
}
