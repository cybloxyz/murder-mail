import crypto from 'node:crypto';

const mac = (p) => crypto.createHmac('sha256', process.env.TOKEN_SECRET).update(p).digest('base64url');

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Token stateless: nama + email ditandatangani, tidak perlu database.
export function signToken(name, email) {
  const p = Buffer.from(JSON.stringify({ n: name, e: email, t: Date.now() })).toString('base64url');
  return `${p}.${mac(p)}`;
}

export function verifyToken(token) {
  try {
    const [p, s] = String(token).split('.');
    const good = mac(p);
    if (!s || s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return null;
    return JSON.parse(Buffer.from(p, 'base64url').toString());
  } catch {
    return null;
  }
}

export const fileNo = (token) => 'CASES-' + token.split('.')[1].slice(0, 6).toUpperCase();