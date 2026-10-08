import { evCode, esc } from './_lib.js';
import { THREADS, DEFAULT_MAIL } from './_case2.js';
import { dbReady, getPlayer, claimInbound, recentInbound } from './_db.js';

const DAILY_LIMIT = 20;
const resend = (path, init = {}) =>
  fetch('https://api.resend.com' + path, {
    ...init,
    headers: { 
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 
      'Content-Type': 'application/json',
      'User-Agent': 'my-app/1.0' 
    }
  });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const ev = req.body;
  console.log('[inbound] webhook masuk:', ev?.type);
  if (ev?.type !== 'email.received' || !ev.data?.email_id) return res.status(200).json({ ignored: true });
  if (!dbReady()) { console.error('SUPABASE belum diset'); return res.status(500).json({ ok: false }); }

  try {
    const r = await resend(`/emails/receiving/${ev.data.email_id}`);
    const m = await r.json();
    if (!r.ok) throw new Error(`Gagal ambil email: ${r.status} ${m.message || ''}`);

    const from = (String(m.from).match(/<([^>]+)>/)?.[1] || String(m.from)).trim().toLowerCase();
    const skip = (why) => { console.log('[inbound] diabaikan:', why, from); return res.status(200).json({ ignored: why }); };
    if (from.endsWith('@nfnaa.dev')) return skip('pengirim memakai domain sendiri');
    if (!(await getPlayer(from))) return skip('email belum terdaftar di tabel players');
    if ((await recentInbound(from)) >= DAILY_LIMIT) return skip('batas harian');
    if (!(await claimInbound(ev.data.email_id, from))) return skip('webhook ganda');

    const body = String(m.text || '').split(/\n\s*(?:>|On .+wrote:|Pada .+menulis:)/)[0].slice(0, 500);
    const t = THREADS.find((x) => x.re.test(body));
    const code = t ? evCode(from, t.ev) : null;

    const s = await resend('/emails', {
      method: 'POST',
      body: JSON.stringify({
        from: 'Bunda Lila <lila@nfnaa.dev>',
        to: [from],
        reply_to: process.env.INBOUND_ADDRESS,
        subject: 'Re: ' + String(m.subject || 'Surat').replace(/^(re:\s*)+/i, ''),
        html: `<div style="font-family:monospace;background:#f4eee1;color:#2c241d;padding:12px;border:2px solid #990000">
  <p>${esc(t ? t.mail : DEFAULT_MAIL)}</p>
  ${code ? `<p>Kode berkas: <b>${code}</b><br>Arsipkan di tab Berkas pada website.</p>` : ''}
  <p style="font-size:11px;color:#6b5b52">Bunda Lila // Panti Senja Ceria</p></div>`
      })
    });
    if (!s.ok) console.error('Balasan gagal dikirim:', s.status, await s.text());
    else console.log('[inbound] balasan terkirim ke', from, t ? `(berkas ${t.ev})` : '(tanpa berkas)');
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('inbound error:', err);
    return res.status(500).json({ ok: false });
  }
}