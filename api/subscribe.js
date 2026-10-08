import { signToken, fileNo, esc } from './_lib.js';
import { dbReady, upsertPlayer } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method tidak diizinkan!' });
  }

  const name = String(req.body?.name ?? '').trim().slice(0, 40);
  const email = String(req.body?.email ?? '').trim().slice(0, 120);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Nama dan alamat email wajib diisi dengan benar!' });
  }
  if (!process.env.RESEND_API_KEY || !process.env.TOKEN_SECRET || !dbReady()) {
    console.error('RESEND_API_KEY atau TOKEN_SECRET belum diset');
    return res.status(500).json({ success: false, message: 'Server belum dikonfigurasi.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  try {
    if (ip && !ip.includes('::1')) {
      const g = await (await fetch(`http://ip-api.com/json/${ip}`)).json();
      console.log(`[PELACAKAN IP] ${name} dari ${ip} (${g.status === 'success' ? `${g.city}, ${g.country}` : '?'})`);
    }
  } catch {
    console.log(`[PELACAKAN IP] Gagal melacak lokasi IP: ${ip}`);
  }

  try {
    await upsertPlayer(email, name);
  } catch (err) {
    console.error('Supabase error:', err);
    return res.status(500).json({ success: false, message: 'Database bermasalah. Coba lagi sebentar.' });
  }

  const token = signToken(name, email);
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const link = `${proto}://${host}/dashboard.html?token=${token}`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'tacoz@nfnaa.dev',
        to: [email],
        subject: '[CAUTION] Selamat ulang tahun, Tacoz',
        html: `
<div style="font-family:monospace;font-size:1rem;background:#f4eee1;color:#2c241d;padding:12px;border:2px solid #990000">
  <h2 style="color:#990000;text-transform:uppercase">[MASTER MEMORY]</h2>
  <p>Halo <b>${esc(name)}</b>,</p>
  <p>Aku Tacoz. Hari ini ulang tahunku, dan semua orang sangat bahagia. Sebagian terlalu bahagia.</p>
  <p>Kalau kamu membaca ini, pestaku sudah berakhir dan aku tidak ikut pulang. Tolong cari tahu siapa yang menyuguhkan gelas terakhirku.</p>
  <p>Nomor berkasmu: <b>${fileNo(token)}</b></p>
  <p><a href="${link}" style="color:#990000"><b>Buka Arsip Kasus #01</b></a></p>
  <p>Jangan lupakan namaku.</p>
  <hr style="border:1px dashed #d0c2b0;margin:12px 0">
  <p style="font-size:11px;color:#6b5b52">PROJECT: REDACTED // Murder Mailer</p>
</div>`
      })
    });
    const result = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('Resend menolak:', resp.status, result);
      return res.status(502).json({ success: false, message: 'Email gagal dikirim: ' + (result.message || resp.status) });
    }
    return res.status(200).json({ success: true, message: 'Berkas berhasil dikirim!' });
  } catch (err) {
    console.error('Gagal mengirim email:', err);
    return res.status(500).json({ success: false, message: 'Gagal terhubung ke server email.' });
  }
}