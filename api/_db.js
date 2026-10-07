const KEY = () => process.env.SUPABASE_SERVICE_KEY;
const e = encodeURIComponent;
const mail = (s) => String(s).toLowerCase();

async function q(path, { method = 'GET', body, prefer } = {}) {
  const k = KEY();
  if (!k) throw new Error("Supabase API Key tidak ditemukan di environment variable.");

  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': k,
      'Authorization': `Bearer ${k}`, 
      'Content-Type': 'application/json',
      ...(prefer && { 'Prefer': prefer })
    },
    body: body && JSON.stringify(body)
  });

  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  
  const t = await r.text();
  return t ? JSON.parse(t) : []; 
}

export const dbReady = () => !!(process.env.SUPABASE_URL && KEY());

export const upsertPlayer = (email, name) =>
  q('players?on_conflict=email', { method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: { email: mail(email), name } });

export const getPlayer = async (email) => (await q(`players?email=eq.${e(mail(email))}&select=email,name`))[0] || null;

export const getFiled = async (email, c) =>
  (await q(`filings?email=eq.${e(mail(email))}&case_no=eq.${c}&select=ev_id`)).map((r) => r.ev_id);

export const fileEv = (email, c, ev) =>
  q('filings?on_conflict=email,case_no,ev_id', { method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal', body: { email: mail(email), case_no: c, ev_id: ev } });

export const getProgress = async (email, c) =>
  (await q(`progress?email=eq.${e(mail(email))}&case_no=eq.${c}&select=tries,solved`))[0] || { tries: 0, solved: false };

export const recordTry = (email, c, solved) =>
  q('rpc/record_try', { method: 'POST', body: { p_email: mail(email), p_case: c, p_solved: solved } });

// true = email baru diproses; false = webhook ganda.
export const claimInbound = async (id, email) =>
  (await q('inbound_log?on_conflict=email_id', { method: 'POST', prefer: 'resolution=ignore-duplicates,return=representation', body: { email_id: id, email: mail(email) } })).length > 0;

export const recentInbound = async (email, hours = 24) =>
  (await q(`inbound_log?email=eq.${e(mail(email))}&created_at=gte.${e(new Date(Date.now() - hours * 3600e3).toISOString())}&select=email_id`)).length;

export const listSolved = async (c) =>
  (await q(`progress?case_no=eq.${c}&solved=eq.true&select=email,players(name)`)).map((r) => ({ email: r.email, name: r.players?.name || r.email }));