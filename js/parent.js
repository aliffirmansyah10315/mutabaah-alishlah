/**
 * ============================================================================
 * MODUL PORTAL ORANG TUA — MUTABA'AH YAUMIYAH (js/parent.js)
 * ============================================================================
 */

async function renderParentDashboard(container) {
  document.getElementById('topbar-page-title').textContent = 'Portal Orang Tua / Wali';
  document.getElementById('topbar-page-subtitle').textContent = 'Pemantauan Perkembangan Ibadah & Kedisiplinan Putra/Putri';

  const data = await apiCall('getDashboard');
  const profiles = data.personal_profiles || [];

  if (profiles.length === 0) {
    container.innerHTML = `<div class="alert alert-warning">Akun Anda belum terhubung dengan data siswa asrama. Silakan hubungi Admin Sekolah.</div>`;
    return;
  }

  container.innerHTML = profiles.map(p => `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="ri-user-heart-line"></i> ${escapeHtml(p.full_name)} (${escapeHtml(p.class_name)})</div>
        <span class="badge ${p.filled_today ? 'badge-success' : 'badge-warning'}">
          ${p.filled_today ? 'Sudah Isi Mutaba’ah Hari Ini (' + p.today_record.completion_rate + '%)' : 'Belum Mengisi Hari Ini'}
        </span>
      </div>
      <div class="card-body">
        <div class="stats-grid">
          <div class="stat-card">
            <div><div class="stat-label">Poin Tertib</div><div class="stat-value" style="color:var(--success)">+${p.points.total_tertib}</div></div>
            <div class="stat-icon"><i class="ri-thumb-up-line"></i></div>
          </div>
          <div class="stat-card">
            <div><div class="stat-label">Poin Pelanggaran</div><div class="stat-value" style="color:var(--danger)">-${p.points.total_pelanggaran}</div></div>
            <div class="stat-icon danger"><i class="ri-error-warning-line"></i></div>
          </div>
          <div class="stat-card">
            <div><div class="stat-label">Total Poin Akhir</div><div class="stat-value">${p.points.poin_akhir}</div></div>
            <div class="stat-icon gold"><i class="ri-award-line"></i></div>
          </div>
        </div>

        <h4 style="margin-bottom:10px;font-size:14px;">Riwayat Mutaba’ah Harian Putra/Putri</h4>
        <div class="table-responsive">
          <table>
            <thead><tr><th>Tanggal</th><th>Capaian Ibadah</th><th>Status Verifikasi</th><th>Catatan Musyrif</th></tr></thead>
            <tbody>
              ${(p.recent_records || []).length === 0 ? '<tr><td colspan="4" style="text-align:center;">Belum ada catatan mutaba’ah.</td></tr>' : p.recent_records.map(r => `
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
    </div>
  `).join('');
}
