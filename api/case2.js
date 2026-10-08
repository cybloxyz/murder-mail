import { verifyToken, fileNo, esc } from './_lib.js'; 
import { C2, EVIDENCE, SOLUTION } from './_case2.js';
import { dbReady, upsertPlayer, getFiled, fileEv, getProgress, recordTry } from './_db.js';

const MAX = 3;
const view = (ids) =>
  Object.keys(EVIDENCE).filter((i) => ids.includes(i)).map((id) => ({ id, tag: EVIDENCE[id][0], title: EVIDENCE[id][1], body: EVIDENCE[id][2] }));

export default async function handler(req, res) {
  if (!process.env.TOKEN_SECRET || !dbReady()) return res.status(500).json({ ok: false, message: 'Server belum dikonfigurasi (TOKEN_SECRET / SUPABASE).' });
  const src = req.method === 'POST' ? req.body || {} : req.query || {};
  const me = verifyToken(src.token);
  if (!me) return res.status(401).json({ ok: false, message: 'Akses ditolak. Token tidak valid.' });

  try {
    if (req.method === 'GET') {
      const [ids, prog] = await Promise.all([getFiled(me.e, 2), getProgress(me.e, 2)]);
      const { title, tagline, intro, timeline, suspects, methods, sentences } = C2;
      return res.status(200).json({ ok: true, name: me.n, file: fileNo(src.token), total: Object.keys(EVIDENCE).length,
        evidence: view(ids), tries: prog.tries, solved: prog.solved ? SOLUTION.epilog : null,
        case: { title, tagline, intro, timeline, suspects, methods, sentences } });
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    const { action } = src;
    await upsertPlayer(me.e, me.n); // pemain lama otomatis terdaftar

    if (action === 'start') {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const link = `https://${host}/case2.html?token=${src.token}`;
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Bunda Lila <murdermail@nfnaa.dev>', to: [me.e], reply_to: 'murdermail@nfnaa.dev', subject: 'Aku jatuh, Sayang',
          html: `<div style="font-family:monospace;background:#f4eee1;color:#2c241d;padding:12px;border:2px solid #990000">
<p>Halo <b>${esc(me.n)}</b>,</p><p>Aku Bunda Lila. Kata mereka aku terpeleset. Aku tidak pernah terpeleset seumur hidupku.</p>
<p><b>Balas surat ini</b> dengan satu pertanyaan spesifik, dan aku akan memberimu satu berkas. Bertanyalah dengan hati-hati. Orang mati tidak suka basa-basi.</p>
<p><a href="${link}" style="color:#990000">Buka berkas kasus</a></p></div>`
        })
      });
      return res.status(r.ok ? 200 : 502).json({ ok: r.ok, message: r.ok ? 'Surat dikirim ke emailmu.' : 'Surat gagal dikirim.' });
    }

    if (action === 'file') {
      const id = Object.keys(EVIDENCE).find((i) => i.toUpperCase() === String(src.code || '').trim().toUpperCase());
      if (!id) return res.status(200).json({ ok: true, message: 'Kode tidak valid.' });
      const have = await getFiled(me.e, 2);
      if (id === 'e8' && have.length < 4) return res.status(200).json({ ok: true, message: 'Surat terakhir masih tersegel. Kumpulkan 4 berkas lain dulu.' });
      await fileEv(me.e, 2, id);
      return res.status(200).json({ ok: true, evidence: view([...have, id]) });
    }

    if (action === 'verdict') {
      const S = SOLUTION;
      const [ids, prog] = await Promise.all([getFiled(me.e, 2), getProgress(me.e, 2)]);
      if (prog.solved) return res.status(200).json({ ok: true, title: 'SUDAH DITUTUP', text: S.epilog });
      if (prog.tries >= MAX) return res.status(200).json({ ok: true, title: 'KESEMPATAN HABIS', text: `Tiga vonis sudah terpakai.` });
      if (ids.length < S.minFiles) return res.status(200).json({ ok: true, title: 'BERKAS KURANG', text: `Kamu baru punya ${ids.length} berkas. Minimal ${S.minFiles}. Balas surat Bunda Lila.` });
      const { culprit, method, sentence } = src;
      const solved = culprit === S.culprit && method === S.method && sentence === S.sentence;
      await recordTry(me.e, 2, solved);
      const done = (title, text, extra = {}) => res.status(200).json({ ok: true, counted: true, title, text, ...extra });
      if (culprit !== S.culprit) return done('SALAH TANGKAP', S.cleared[culprit] || 'Tersangka tidak dikenal.');
      if (method !== S.method) return done('HAMPIR', 'Pelakunya benar, tapi caranya meleset. Baca lagi cangkir, tangga, dan jam yang kosong.');
      if (sentence !== S.sentence) return done('VONIS BELUM ADIL', 'Pelaku dan caranya benar. Tapi apakah ia bergerak sendirian? Periksa memo dan buku kas.');
      return done('BERKAS DITUTUP SEBAGIAN', S.epilog, { solved: true });
    }
    return res.status(400).json({ ok: false, message: 'Aksi tidak dikenal.' });
  } catch (err) {
    console.error('case2 error:', err);
    return res.status(500).json({ ok: false, message: 'Database bermasalah. Coba lagi sebentar.' });
  }
}