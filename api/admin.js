import crypto from 'node:crypto';
import { signToken } from './_lib.js';
import { dbReady, getPlayer, listSolved } from './_db.js';

const same = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// /api/admin?key=ADMIN_KEY                 -> daftar pemain yang menyelesaikan Kasus #01 + tautan Kasus #02
// /api/admin?key=ADMIN_KEY&email=a@b.com   -> tautan Kasus #02 untuk satu pemain terdaftar
export default async function handler(req, res) {
  const { key, email } = req.query || {};
  if (!process.env.ADMIN_KEY || !same(key || '', process.env.ADMIN_KEY)) return res.status(401).send('Akses ditolak.');
  if (!process.env.TOKEN_SECRET || !dbReady()) return res.status(500).send('Server belum dikonfigurasi.');

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const link = (p) => `https://${host}/case2.html?token=${signToken(p.name, p.email)}`;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  try {
    if (email) {
      const p = await getPlayer(email);
      return p ? res.status(200).send(link(p)) : res.status(404).send('Email belum terdaftar.');
    }
    const rows = await listSolved(1);
    return res.status(200).send(rows.length ? rows.map((p) => `${p.name} <${p.email}>\n${link(p)}\n`).join('\n') : 'Belum ada yang menyelesaikan Kasus #01.');
  } catch (err) {
    console.error('admin error:', err);
    return res.status(500).send('Database bermasalah.');
  }
}