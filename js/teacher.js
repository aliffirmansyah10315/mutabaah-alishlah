/**
 * ============================================================================
 * MODUL HALAMAN MUSYRIF / GURU — MUTABA'AH YAUMIYAH (js/teacher.js)
 * ============================================================================
 */

async function renderTeacherDashboard(container) {
  document.getElementById('topbar-page-title').textContent = 'Dashboard Musyrif / Guru';
  document.getElementById('topbar-page-subtitle').textContent = 'Pemantauan Ibadah & Pembinaan Siswa Asrama Binaan';

  const data = await apiCall('getDashboard');
  const s = data.summary || {};

  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div><div class="stat-label">Siswa Asrama Binaan</div><div class="stat-value">${s.total_students || 0}</div></div>
        <div class="stat-icon"><i class="ri-group-line"></i></div>
      </div>
      <div class="stat-card">
        <div><div class="stat-label">Sudah Isi Hari Ini</div><div class="stat-value">${s.filled_today_count || 0}</div></div>
        <div class="stat-icon info"><i class="ri-checkbox-circle-line"></i></div>
      </div>
      <div class="stat-card">
        <div><div class="stat-label">Poin Menunggu Persetujuan</div><div class="stat-value">${s.pending_points_count || 0}</div></div>
        <div class="stat-icon gold"><i class="ri-award-line"></i></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="ri-line-chart-line"></i> Tren Capaian Mutaba’ah 7 Hari Terakhir (%)</div></div>
      <div class="card-body"><canvas id="teacherTrendChart" height="95"></canvas></div>
    </div>
  `;
  renderTrendChart('teacherTrendChart', data.trend_7_days || []);
}

async function renderMutabaahVerifyPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Data & Verifikasi Mutaba’ah';
  document.getElementById('topbar-page-subtitle').textContent = 'Periksa dan beri catatan pembinaan atas laporan ibadah harian siswa asrama';

  const records = await apiCall('getMutabaahHistory');
  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="ri-checkbox-multiple-line"></i> Laporan Mutaba’ah Siswa Asrama</div></div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Tanggal</th><th>Nama Siswa Asrama</th><th>Kelas</th><th>Capaian</th><th>Catatan Siswa</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${records.length === 0 ? '<tr><td colspan="7" style="text-align:center;">Belum ada laporan mutaba’ah.</td></tr>' : records.map(r => `
              <tr>
                <td>${escapeHtml(r.record_date)}</td>
                <td><strong>${escapeHtml(r.student_name)}</strong></td>
                <td>${escapeHtml(r.class_name)}</td>
                <td><strong>${r.completion_rate}%</strong></td>
                <td>${escapeHtml(r.student_note || '-')}</td>
                <td>
                  <span class="badge ${r.verification_status === 'TERVERIFIKASI' ? 'badge-success' : r.verification_status === 'PERLU_PEMBINAAN' ? 'badge-danger' : 'badge-warning'}">
                    ${escapeHtml(r.verification_status)}
                  </span>
                </td>
                <td>
                  <button class="btn btn-primary btn-sm" onclick="verifyMutabaahAction('${r.record_id}', 'TERVERIFIKASI')">Verifikasi</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function verifyMutabaahAction(recordId, status) {
  showLoader(true);
  try {
    const res = await apiCall('verifyMutabaah', { record_id: recordId, status, teacher_note: 'Diverifikasi melalui dashboard.' });
    showToast('Berhasil', res.message || 'Mutaba’ah diverifikasi.');
    navigateTo('mutabaah-verify');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}

async function renderPointApprovalsPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Persetujuan & Input Poin';
  document.getElementById('topbar-page-subtitle').textContent = 'Kelola pengajuan poin tertib dan pelanggaran siswa asrama';

  const [trxs, students, cats] = await Promise.all([
    apiCall('getPointTransactions'),
    apiCall('getStudents'),
    apiCall('getPointCategories')
  ]);

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-award-line"></i> Riwayat & Antrean Persetujuan Poin</div>
        <button class="btn btn-primary btn-sm" onclick='openTeacherPointModal(${JSON.stringify(students)}, ${JSON.stringify(cats)})'><i class="ri-add-line"></i> Input Poin Siswa Asrama</button>
      </div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Tanggal</th><th>Siswa Asrama</th><th>Jenis</th><th>Kategori</th><th>Poin</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${trxs.length === 0 ? '<tr><td colspan="7" style="text-align:center;">Belum ada transaksi poin.</td></tr>' : trxs.map(t => `
              <tr>
                <td>${escapeHtml(t.transaction_date)}</td>
                <td><strong>${escapeHtml(t.student_name)}</strong></td>
                <td><span class="badge ${t.point_type === 'TERTIB' ? 'badge-success' : 'badge-danger'}">${escapeHtml(t.point_type)}</span></td>
                <td>${escapeHtml(t.category_name)}</td>
                <td><strong>${t.points}</strong></td>
                <td><span class="badge ${t.status === 'DISETUJUI' ? 'badge-success' : t.status === 'DITOLAK' ? 'badge-danger' : 'badge-warning'}">${escapeHtml(t.status)}</span></td>
                <td>
                  ${t.status === 'MENUNGGU' ? `
                    <button class="btn btn-success btn-sm" onclick="reviewPointAction('${t.transaction_id}', 'DISETUJUI')">Setujui</button>
                    <button class="btn btn-danger btn-sm" onclick="reviewPointAction('${t.transaction_id}', 'DITOLAK')">Tolak</button>
                  ` : `<small style="color:var(--text-muted)">Oleh: ${escapeHtml(t.approved_by || '-')}</small>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openTeacherPointModal(students, cats) {
  openModal('Input Poin Tertib / Pelanggaran', `
    <form onsubmit="submitTeacherPointForm(event)">
      <div class="form-group">
        <label>Pilih Siswa Asrama</label>
        <select id="tp-student" required>
          ${students.map(s => `<option value="${s.student_id}">${escapeHtml(s.full_name)} (${escapeHtml(s.class_name)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Pilih Kategori Poin</label>
        <select id="tp-cat" required>
          ${cats.map(c => `<option value="${c.category_id}" data-type="${c.type}" data-pts="${c.default_points}">[${c.type}] ${escapeHtml(c.title)} (${c.default_points} poin)</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Catatan / Keterangan</label><input type="text" id="tp-notes" placeholder="Opsional"></div>
      <button type="submit" class="btn btn-primary btn-block">Kirim Catatan Poin</button>
    </form>
  `);
}

async function submitTeacherPointForm(e) {
  e.preventDefault();
  const sel = document.getElementById('tp-cat');
  const opt = sel.options[sel.selectedIndex];
  showLoader(true);
  try {
    const res = await apiCall('submitPoint', {
      student_id: document.getElementById('tp-student').value,
      category_id: sel.value,
      point_type: opt.getAttribute('data-type'),
      points: opt.getAttribute('data-pts'),
      notes: document.getElementById('tp-notes').value
    });
    showToast('Berhasil', res.message || 'Poin dicatat.');
    closeModal();
    navigateTo('point-approvals');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}

async function reviewPointAction(transactionId, decision) {
  showLoader(true);
  try {
    const res = await apiCall('reviewPoint', { transaction_id: transactionId, decision });
    showToast('Berhasil', res.message || 'Status poin diperbarui.');
    navigateTo('point-approvals');
  } catch (err) { showToast('Gagal', err.message, 'error'); } finally { showLoader(false); }
}

async function renderRecapReportPage(container) {
  document.getElementById('topbar-page-title').textContent = 'Laporan & Rekapitulasi Bulanan';
  document.getElementById('topbar-page-subtitle').textContent = 'Rekap kedisiplinan ibadah dan poin siswa asrama';

  const rows = await apiCall('getRecapReport');
  container.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="ri-file-chart-line"></i> Rekapitulasi Siswa Asrama</div></div>
      <div class="card-body table-responsive">
        <table>
          <thead><tr><th>Nama Siswa Asrama</th><th>Kelas</th><th>Hari Mengisi</th><th>Rata-rata Ibadah</th><th>Poin Tertib</th><th>Pelanggaran</th><th>Poin Akhir</th></tr></thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><strong>${escapeHtml(r.full_name)}</strong></td>
                <td>${escapeHtml(r.class_name)}</td>
                <td>${r.mutabaah_days_count} hari</td>
                <td><strong>${r.avg_completion_rate}%</strong></td>
                <td style="color:var(--success)">+${r.total_tertib}</td>
                <td style="color:var(--danger)">-${r.total_pelanggaran}</td>
                <td><strong>${r.poin_akhir}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
