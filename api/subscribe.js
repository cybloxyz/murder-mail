const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "Method tidak diizinkan!" });
  }

  const { name, email } = req.body || {};

  if (!email || !name) {
    return res.status(400).json({ success: false, message: "Nama dan alamat email wajib diisi!" });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY belum diset di Environment Variables");
    return res.status(500).json({ success: false, message: "Server belum dikonfigurasi (API key kosong)." });
  }

  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || '';
  const token = 'CASES-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const loginLink = `${protocol}://${host}/dashboard.html?token=${token}`;

  try {
    const cleanIp = clientIp.includes('::1') ? '' : clientIp;
    let locationInfo = "Lokal / Development";
    if (cleanIp) {
      const geoRes = await fetch(`http://ip-api.com/json/${cleanIp}`);
      const geoData = await geoRes.json();
      if (geoData.status === 'success') {
        locationInfo = `${geoData.city}, ${geoData.country}`;
      }
    }
    console.log(`[PELACAKAN IP] Detektif ${name} mendaftar dari IP: ${clientIp} (${locationInfo})`);
  } catch (geoError) {
    console.log(`[PELACAKAN IP] Gagal melacak lokasi IP: ${clientIp}`);
  }

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'murdermail@nfnaa.dev',
        to: [email],
        subject: '[CAUTION]',
        html: `
          <div style="font-family: monospace; font-size: 1rem; background-color: #f4eee1; color: #2c241d; padding: 12px; border: 2px solid #990000;">
            <h2 style="color: #990000; text-transform: uppercase;">[MASTER MEMORY]</h2>
            <p>Halo <b>${escapeHtml(name)}</b>,</p>
            <p>Aku Tacoz.</p>
            <p>Jangan lupakan namaku.</p>
            <p>Token aksesmu: <b>${token}</b></p>
            <a href="${loginLink}">Buka Dashboard</a>
            <hr style="border: 1px dashed #d0c2b0; margin: 12px 0;">
            <p style="font-size: 11px; color: #6b5b52;">PROJECT: REDACTED // Murder Mailer</p>
          </div>
        `
      })
    });

    const result = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("Resend menolak:", resp.status, result);
      return res.status(502).json({
        success: false,
        message: "Email gagal dikirim: " + (result.message || resp.status)
      });
    }

    console.log(`[BERHASIL] Berkas terkirim ke: ${email} (Nama: ${name})`, result);
    return res.status(200).json({ success: true, message: "Berkas berhasil dikirim!" });
  } catch (err) {
    console.error("Gagal mengirim email:", err);
    return res.status(500).json({ success: false, message: "Gagal terhubung ke server email." });
  }
}