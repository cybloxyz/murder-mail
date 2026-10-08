import { verifyToken, fileNo, esc } from './_lib.js';
import { dbReady, upsertPlayer, getProgress, recordTry } from './_db.js';

// Kunci jawaban hanya ada di server (culprit, motive, cleared, epilog); tidak pernah dikirim saat GET.
const CASE = {
  title: 'Pesta Ulang Tahun Terakhir Tacoz',
  tagline: 'Semoga panjang umur. (Ternyata tidak.)',
  intro: [
    'Tacoz, wanita pemilik Jewerly Co., merayakan ulang tahun ke-30 di Rumah Pelangi. Balon di mana-mana, musik riang, kue tiga tingkat. Semuanya sempurna, kecuali tuan rumahnya.',
    'Pukul 21:00 lampu dipadamkan untuk kejutan kue. Saat menyala lagi, Tacoz sudah tergeletak di Ruang Balon dengan topi pesta miring dan gelas emas kesayangannya kosong di tangan. Ia tidak sempat meniup lilin. Hemat korek.',
    'Polisi bilang ini keracunan. Kamu dipanggil karena polisi sedang makan kue. Kuenya enak, katanya.'
  ],
  timeline: [
    ['19:00', 'Pesta dimulai. Semua tersenyum.'],
    ['20:02', 'Dimas pergi setelah bertengkar dengan Tacoz.'],
    ['20:30', 'Rini menaruh gelas emas bersih di pantry dan mengunci pintunya.'],
    ['20:55', 'Tacoz bersulang memakai gelas emas, gelas yang hanya ia pakai.'],
    ['21:00', 'Lampu padam untuk kejutan kue.'],
    ['21:07', 'Tacoz ditemukan meninggal di Ruang Balon.']
  ],
  suspects: [
    { id: 'pogo', name: 'Pogo', role: 'Badut bayaran',
      statement: '"Aku cuma mengambil balon di Ruang Balon, lalu kembali menghibur tamu. Pantry? Aku bahkan tidak tahu di mana dapurnya. Aku badut, bukan pencuri."',
      asks: [['Kapan terakhir kamu digaji Tacoz?', '"Enam bulan lalu. Katanya penghasilan badut itu tawa. Aku tidak tertawa."'],
             ['Kenapa tanganmu berbedak?', '"Bedak talk, supaya balon latex tidak lengket. Profesionalisme."']] },
    { id: 'rini', name: 'Rini', role: 'Sang Sekretaris',
      statement: '"Aku di aula sepanjang malam mengatur acara. Setelah mengunci pantry jam 20:30, aku baru kembali jam 20:50 untuk mengambil gelas."',
      asks: [['Benarkah kamu di aula terus?', '"Ehm... aku ke lorong belakang untuk menelepon rekruter perusahaan saingan. Jangan bilang Tacoz. Oh, benar juga."'],
             ['Siapa yang punya kunci pantry?', '"Hanya aku. Pintu satunya ke Ruang Balon tidak bisa dikunci. Kata Tacoz biar suasananya terbuka."']],
      cleared: 'Rini berbohong soal lorong, tapi CCTV menunjukkan ia kembali dengan tangan kosong dan pintu utama pantry tidak pernah dibuka. Ia hanya sedang cari kerja baru.' },
    { id: 'dimas', name: 'Dimas', role: 'Sang Mantan',
      statement: '"Aku pergi jam delapan setelah bertengkar. Ya, aku kirim kartu ucapan: Semoga umurmu panjang. Sarkasme itu bahasa cintaku."',
      asks: [['Soal kartu itu?', '"Di baliknya kutulis: Tidak. Itu lelucon. Sepertinya aku harus berhenti melucu."']],
      cleared: 'CCTV gerbang merekam Dimas keluar jam 20:02 dan tak pernah kembali. Kartunya cuma sarkasme.' },
    { id: 'gun', name: 'Pak Gun', role: 'Mitra Bisnis',
      statement: '"Aku di balkon menelepon mitra luar negeri. Ya, Tacoz berutang miliaran padaku, tapi orang mati tidak bisa membayar utang. Aku rugi!"',
      asks: [['Kamu senang dia meninggal?', '"Senang? Aku sudah pesan karangan bunga dan menagihnya ke ahli waris."']],
      cleared: 'Log telepon 20:35 sampai 21:05 dan dua foto balkon membuktikan ia tak ke mana-mana. Justru dialah yang paling rugi.' },
    { id: 'sekar', name: 'Bu Sekar', role: 'Payung Hitam',
      statement: '"Aku duduk di sofa menikmati pesta. Payung ini? Aku datang melayat lebih awal... maksudku, melayat tadi sore."',
      asks: [['Kenapa selalu bawa payung hitam?', '"Kebiasaan. Aku sering diundang ke acara yang berakhir menyedihkan. Kebetulan saja."']],
      cleared: 'Tiga foto pesta (20:33, 20:41, 20:48) memperlihatkan ia di sofa. Payungnya basah karena pemakaman sore tadi.' }
  ],
  evidence: [
    ['FOTO 20:30', 'Gelas Emas', 'Gelas emas bersih di rak pantry, pintu utama dikunci Rini. Tapi pantry punya pintu kedua ke Ruang Balon: tanpa kunci, tanpa kamera.'],
    ['CCTV LORONG', 'Pintu Utama Pantry', 'Dari 20:30 sampai 20:55 tak ada yang membuka pintu utama pantry. Rini lewat jam 20:42 dan kembali jam 20:49 dengan tangan kosong.'],
    ['LAB', 'Isi Gelas', 'Ada racun (jenisnya tidak disebut polisi karena "kurang sopan di pesta") dan serpihan bedak talk.'],
    ['INVENTARIS', 'Bedak Talk', 'Balon pesta dipompa mesin. Satu-satunya yang memakai bedak talk adalah balon hewan latex mentah milik Pogo.'],
    ['FOTO PESTA', 'Album 20:33 sampai 20:52', 'Bu Sekar terlihat di sofa pada tiga foto. Pogo hanya muncul di foto 20:33, lalu baru terlihat lagi jam 20:52.'],
    ['LOG TELEPON', 'Pak Gun', 'Panggilan internasional 20:35 sampai 21:05, ada dua foto dirinya di balkon.'],
    ['CCTV GERBANG', 'Dimas', 'Dimas keluar gerbang 20:02 dan tidak kembali.']
  ],
  motives: [
    ['upah', 'Upahnya ditahan enam bulan dan ia dibilang tidak lucu'],
    ['warisan', 'Mengincar warisan Tacoz'],
    ['cinta', 'Cemburu pada cinta lama'],
    ['bisnis', 'Menyelamatkan bisnis dari kebangkrutan']
  ]
};

const SOLUTION = {
  culprit: 'pogo',
  motive: 'upah',
  epilog: 'Pogo ditangkap masih memakai sepatu raksasanya. "Aku cuma ingin dia berhenti tertawa," katanya. Di meja Tacoz ada email terjadwal: "Aku Tacoz. Jangan lupakan namaku. P.S. Pogo, leluconku memang tidak lucu. Tapi racunmu juga tidak kreatif."'
};

async function mail(payload) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'murdermail@nfnaa.dev', ...payload })
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

// Dipanggil sekali saat Kasus #01 pertama kali dijawab benar.
async function notifySolved(req, me, token) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const box = 'font-family:monospace;background:#f4eee1;color:#2c241d;padding:12px;border:2px solid #990000';
  await mail({
    to: [me.e],
    subject: '[CAUTION] Kasus #01 ditutup',
    html: `<div style="${box}"><h2 style="color:#990000">[MASTER MEMORY]</h2>
<p>Selamat, Detektif <b>${esc(me.n)}</b>. Pogo sudah dibawa pergi, masih memakai sepatu raksasanya.</p>
<p>Tapi seseorang membaca arsipmu sampai habis. Aku tidak akan bilang siapa.</p>
<p>Kasus berikutnya akan datang lewat surat. Jangan lupakan namaku.</p><p>Tacoz</p></div>`
  });
}

export default async function handler(req, res) {
  if (!process.env.TOKEN_SECRET) return res.status(500).json({ ok: false, message: 'TOKEN_SECRET belum diset.' });

  const src = req.method === 'POST' ? req.body || {} : req.query || {};
  const me = verifyToken(src.token);
  if (!me) return res.status(401).json({ ok: false, message: 'Akses ditolak. Token tidak valid.' });

  if (req.method === 'GET') {
    const { suspects, ...rest } = CASE;
    return res.status(200).json({
      ok: true,
      name: me.n,
      file: fileNo(src.token),
      case: { ...rest, suspects: suspects.map(({ cleared, ...s }) => s) }
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method tidak diizinkan.' });

  const { culprit, motive } = src;
  if (culprit === SOLUTION.culprit && motive === SOLUTION.motive) {
    try {
      if (dbReady()) {
        await upsertPlayer(me.e, me.n);
        if (!(await getProgress(me.e, 1)).solved) {
          await notifySolved(req, me, src.token); // gagal kirim = belum dicatat, dicoba lagi saat menuduh ulang
          await recordTry(me.e, 1, true);
        }
      }
    } catch (err) {
      console.error('case1 solve error:', err);
    }
    return res.status(200).json({ ok: true, solved: true, title: 'KASUS DITUTUP KAMU BERHASIL', text: SOLUTION.epilog });
  }
  if (culprit === SOLUTION.culprit) {
    return res.status(200).json({ ok: true, title: 'HAMPIR', text: 'Pelakunya benar, tapi motifmu meleset. Dengarkan lagi kesaksian dan pertanyaannya.' });
  }
  const s = CASE.suspects.find((x) => x.id === culprit);
  return res.status(200).json({ ok: true, title: 'SALAH TANGKAP', text: s ? `${s.name} bukan pelakunya. ${s.cleared}` : 'Tersangka tidak dikenal.' });
}