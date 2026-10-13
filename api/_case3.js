import { verifyToken, fileNo, evCode, esc } from './_lib.js';
import { C3, EVIDENCE, SOLUTION } from './_case3.js';
import { dbReady, upsertPlayer, getFiled, fileEv, getProgress, recordTry } from './_db.js';

const N = 3, MAX = 3;
const box = 'font-family:monospace;background:#f4eee1;color:#2c241d;padding:12px;border:2px solid #990000';
const view = (ids) => Object.keys(EVIDENCE).filter((i) => ids.includes(i)).map((id) => ({ id, tag: EVIDENCE[id][0], title: EVIDENCE[id][1], body: EVIDENCE[id][2] }));

async function mail(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Ibu Rahma <rahma@nfnaa.dev>', ...payload })
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

async function notifySolved(me) {
  await mail({
    to: [me.e],
    subject: '[CAUTION] Kasus #03 ditutup',
    html: `<div style="${box}"><h2 style="color:#990000">[MASTER MEMORY]</h2>
<p>Selamat, Detektif <b>${esc(me.n)}</b>. Tuan C. terbukti konsisten sampai akhir.</p>
<p>Tapi Alea menghilang bersama buku jadwalnya, dan seseorang masih menggaji semua orang ini.</p>
<p>Kasus berikutnya menunggu. Aku masih sedikit kedinginan.</p><p>Rahma</p></div>`
  });
  if (process.env.OWNER_EMAIL) {
    await mail({ to: [process.env.OWNER_EMAIL], subject: `[KASUS 3 SELESAI] ${me.n}`,
      html: `<div style="${box}"><p>Pemain: <b>${esc(me.n)}</b> &lt;${esc(me.e)}&gt; menyelesaikan Kasus #03.</p></div>` });
  }
}

export default async function handler(req, res) {
  if (!process.env.TOKEN_SECRET || !dbReady()) return res.status(500).json({ ok: false, message: 'Server belum dikonfigurasi (TOKEN_SECRET / SUPABASE).' });
  const src = req.method === 'POST' ? req.body || {} : req.query || {};
  const me = verifyToken(src.token);
  if (!me) return res.status(401).json({ ok: false, message: 'Akses ditolak. Token tidak valid.' });

  try {
    if (req.method === 'GET') {
      const [ids, prog] = await Promise.all([getFiled(me.e, N), getProgress(me.e, N)]);
      const { title, tagline, intro, timeline, suspects, methods, motives } = C3;
      return res.status(200).json({ ok: true, name: me.n, file: fileNo(src.token), total: Object.keys(EVIDENCE).length,
        evidence: view(ids), tries: prog.tries, solved: prog.solved ? SOLUTION.epilog : null,
        case: { title, tagline, intro, timeline, suspects, methods, motives } });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    const { action } = src;
    await upsertPlayer(me.e, me.n);

    if (action === 'start') {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const link = `https://${host}/case3.html?token=${src.token}`;
      try {
        await mail({ to: [me.e], reply_to: process.env.INBOUND_ADDRESS, subject: '[KASUS 3] Undangan terakhir',
          html: `<div style="${box}"><p>Halo <b>${esc(me.n)}</b>,</p><p>Aku Rahma. Tamu mengira aku kedinginan karena gugup. Aku tidak pernah gugup seumur hidupku.</p>
<p><b>Balas surat ini</b> dengan satu pertanyaan spesifik, dan aku memberimu satu berkas. Jangan ubah subjek surat ini.</p>
<p><a href="${link}" style="color:#990000">Buka berkas kasus</a></p></div>` });
        return res.status(200).json({ ok: true, message: 'Surat dikirim ke emailmu.' });
      } catch (err) { console.error(err); return res.status(502).json({ ok: false, message: 'Surat gagal dikirim.' }); }
    }

    if (action === 'file') {
      const id = Object.keys(EVIDENCE).find((i) => evCode(me.e, i) === String(src.code || '').trim().toUpperCase());
      if (!id) return res.status(200).json({ ok: true, message: 'Kode tidak valid.' });
      const have = await getFiled(me.e, N);
      if (id === 'f8' && have.length < 4) return res.status(200).json({ ok: true, message: 'Surat ini masih tersegel. Kumpulkan 4 berkas lain dulu.' });
      await fileEv(me.e, N, id);
      return res.status(200).json({ ok: true, evidence: view([...have, id]) });
    }

    if (action === 'verdict') {
      const S = SOLUTION;
      const [ids, prog] = await Promise.all([getFiled(me.e, N), getProgress(me.e, N)]);
      if (prog.solved) return res.status(200).json({ ok: true, title: 'SUDAH DITUTUP', text: S.epilog });
      if (prog.tries >= MAX) return res.status(200).json({ ok: true, title: 'KESEMPATAN HABIS', text: 'Tiga vonis sudah terpakai.' });
      if (ids.length < S.minFiles) return res.status(200).json({ ok: true, title: 'BERKAS KURANG', text: `Kamu baru punya ${ids.length} berkas. Minimal ${S.minFiles}. Balas surat Ibu Rahma.` });
      const { culprit, method, motive } = src;
      const solved = culprit === S.culprit && method === S.method && motive === S.motive;
      await recordTry(me.e, N, solved);
      const done = (title, text, extra = {}) => res.status(200).json({ ok: true, counted: true, title, text, ...extra });
      if (culprit !== S.culprit) return done('SALAH TANGKAP', S.cleared[culprit] || 'Tersangka tidak dikenal.');
      if (method !== S.method) return done('HAMPIR', 'Pelakunya benar, tapi caranya meleset. Pikirkan siapa yang tidak perlu menyentuh pintu.');
      if (motive !== S.motive) return done('HAMPIR', 'Pelaku dan caranya benar. Motifnya ada di tulisan balik undangan dan jam sembilan.');
      try { await notifySolved(me); } catch (err) { console.error('notifySolved gagal:', err); }
      return done('KASUS DITUTUP', S.epilog, { solved: true });
    }
    return res.status(400).json({ ok: false, message: 'Aksi tidak dikenal.' });
  } catch (err) {
    console.error('case3 error:', err);
    return res.status(500).json({ ok: false, message: 'Database bermasalah. Coba lagi sebentar.' });
  }
}