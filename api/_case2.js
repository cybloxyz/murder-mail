// Data Kasus #02. Semua jawaban hanya di server.
export const C2 = {
  title: 'Surat dari Bunda Lila',
  tagline: 'Panti Senja Ceria: hidup itu indah, apalagi gratis.',
  intro: [
    'Bunda Lila mengelola Panti Senja Ceria selama 22 tahun. Dinding panti dicat kuning, penghuninya diajak senam tiap pagi, dan setiap kematian dirayakan dengan kue. Kematian Bunda Lila sendiri dirayakan dengan kue rasa pandan.',
    'Ia ditemukan jam 03:10 di dasar tangga belakang. Polisi menulis: kecelakaan. Yayasan menulis: kecelakaan. Spanduk di gerbang menulis: "Selamat Jalan, Kami Bahagia." Terlalu cepat bahagia.',
    'Sebelum meninggal, Bunda Lila menitipkan kotak surat yang masih membalas. Jangan tanya cara kerjanya. Balas suratnya, tanyakan hal yang spesifik, dan kumpulkan berkasnya di sini.'
  ],
  timeline: [
    ['20:00', 'Dr. Arman pulang dari shift.'],
    ['22:00', 'Sari mulai shift malam.'],
    ['02:20', 'CCTV lantai 2 mati untuk "perawatan rutin".'],
    ['03:10', 'Bunda Lila ditemukan di dasar tangga belakang.']
  ],
  suspects: [
    { id: 'sari', name: 'Sari', role: 'Perawat malam', statement: '"Aku keliling lantai dua dan tiga seperti biasa. Bunda Lila itu seperti ibuku. Aku bahkan masih menyimpan senyumnya."' },
    { id: 'arman', name: 'Dr. Arman', role: 'Dokter panti', statement: '"Aku sudah pulang jam delapan. Kalau kartuku tercatat masuk lagi, itu pasti kartu yang bandel."' },
    { id: 'jaya', name: 'Pak Jaya', role: 'Tukang kebun', statement: '"Aku cuma memperbaiki pemanas. Semua orang di sini suka menyalahkan yang punya kunci."' },
    { id: 'rahma', name: 'Ibu Rahma', role: 'Ketua yayasan', statement: '"Aku sedang tidur di rumah. Aku kehilangan sahabat, tolong hargai duka dan jadwal transfernya."' },
    { id: 'bram', name: 'Eyang Bram', role: 'Penghuni tertua', statement: '"Bidadari putih membawa cangkir. Cit cit cit. Kamu mau permen?"' }
  ],
  methods: [['sedatif_tangga', 'Dibius lewat teh, lalu dijatuhkan di tangga'], ['dorong', 'Didorong langsung di tangga'], ['racun', 'Diracun lewat cangkir'], ['kecelakaan', 'Murni kecelakaan']],
  sentences: [['seumur_hidup', 'Penjara seumur hidup, tanpa kue'], ['saksi_kunci', 'Penjara, dengan status saksi kunci: ia harus bicara'], ['bebas', 'Bebas, ini kecelakaan'], ['rehab', 'Rehabilitasi dan jadi badut panti']]
};

export const EVIDENCE = {
  e1: ['BUKU JAGA', 'Catatan Malam', 'Sari: shift 22:00 sampai 06:00, tanda tangan patroli jam 02:00 dan 04:00, kolom 03:00 kosong. Dr. Arman: pulang 20:00, kartu akses mencatat masuk 02:15 dan keluar 02:50. Pak Jaya: patroli taman 02:40.'],
  e2: ['CANGKIR', 'Teh di Meja Lila', 'Sisa teh mengandung obat tidur dosis tinggi. Obat itu hanya ada di lemari obat; kuncinya dipegang Dr. Arman dan Sari.'],
  e3: ['MEMO', 'Perintah CCTV', 'CCTV lantai 2 dimatikan 02:20 sampai 03:10 atas memo "perawatan rutin" bertanda tangan Ibu Rahma, bertanggal dua hari sebelum kejadian.'],
  e4: ['FORENSIK', 'Jejak Tangga', 'Ada jejak sol karet putih beralur di anak tangga. Sepatu Dr. Arman berbahan kulit licin, Pak Jaya memakai bot hitam. Satu-satunya alas kaki beralur putih di panti adalah sandal klog perawat, yang berdecit saat dipakai berjalan.'],
  e5: ['BUKU KAS', 'Aliran Donasi', 'Tiap bulan donasi dialihkan ke "Sunshine Party Co." berlabel "acara hiburan". Bunda Lila melingkarinya dan menulis: "T. tahu soal ini?" Persetujuan transfer ditandatangani Ibu Rahma. Dr. Arman hanya tercatat sebagai saksi tanda tangan.'],
  e6: ['GAMBAR', 'Karya Eyang Bram', 'Gambar krayon: sosok putih membawa cangkir di tangga, dengan tulisan "cit cit cit". Eyang pikun soal hari, tapi tidak pernah salah soal bunyi.'],
  e7: ['LOG KUNCI', 'Kunci Induk', 'Pak Jaya meminjam kunci induk 02:30 untuk pemanas dan mengembalikannya 02:50. CCTV taman memperlihatkan ia di luar gedung sepanjang waktu itu.'],
  e8: ['SURAT', 'Pesan Terakhir', '"Kalau aku jatuh, aku tidak menjatuhkan diriku. Cari yang tersenyum paling lama saat aku diangkat. Dan tanyakan pada T. kenapa pestanya selalu butuh uangku."']
};

// Satu surat balasan = satu berkas. Kata kunci harus spesifik.
export const THREADS = [
  { ev: 'e1', re: /jam|waktu|malam|jaga|shift|jadwal/i, mail: 'Waktu itu licin, Sayang. Aku jatuh jam tiga, tapi kata orang jam tiga itu jam tidur. Buku jaga tahu siapa yang tidak tidur.' },
  { ev: 'e2', re: /teh|cangkir|minum|obat|pil/i, mail: 'Tehku manis sekali malam itu. Terlalu manis, seperti senyum seseorang.' },
  { ev: 'e3', re: /cctv|kamera|rekam/i, mail: 'Kamera itu mata panti. Seseorang menyuruhnya tidur lebih dulu dariku. Perintahnya tertulis rapi.' },
  { ev: 'e4', re: /tangga|sandal|sepatu|jejak|alas/i, mail: 'Tangga itu bernyanyi sebelum aku jatuh. Cit. Cit. Cit.' },
  { ev: 'e5', re: /uang|kas|donasi|dana|transfer|keuangan/i, mail: 'Pesta itu mahal, Sayang. Aku melingkari satu nama di buku kas. Kamu pasti kenal pestanya.' },
  { ev: 'e6', re: /eyang|bram|saksi|gambar|lihat/i, mail: 'Eyang Bram pikun soal hari, tapi tidak soal suara. Minta gambarnya.' },
  { ev: 'e7', re: /kunci|jaya|tukang|taman/i, mail: 'Pak Jaya selalu punya kunci dan selalu punya alasan. Periksa keduanya.' },
  { ev: 'e8', re: /surat|pesan|wasiat|terakhir/i, mail: 'Ada surat terakhirku. Tapi kumpulkan dulu empat berkas lain. Aku tidak suka dibaca terburu-buru.' }
];
export const DEFAULT_MAIL = 'Aku tidak mengerti. Pertanyaanmu terlalu bahagia. Tanyakan sesuatu yang bisa kubuktikan.';

export const SOLUTION = {
  culprit: 'sari', method: 'sedatif_tangga', sentence: 'saksi_kunci', minFiles: 4,
  cleared: {
    arman: 'Dr. Arman memang masuk jam 02:15, tapi sepatunya kulit licin dan tidak beralur. Ia mencurigakan, tapi bukan di tangga itu.',
    jaya: 'Pak Jaya terekam CCTV taman sepanjang waktu kuncinya dipinjam. Ia hanya tukang yang selalu jadi kambing hitam.',
    rahma: 'Ibu Rahma memegang kertas, bukan tangga. Ia tidak ada di panti malam itu.',
    bram: 'Eyang Bram memakai kursi roda. Tangga itu mustahil baginya. Ia hanya saksi yang tidak dipercaya siapa pun.'
  },
  epilog: 'Sari menolak bicara dan hanya berbisik: "Dia bilang ini pesta kejutan." Ibu Rahma menyewa pengacara, dan "Sunshine Party Co." tiba-tiba mengganti nomor teleponnya. Satu nama di buku kas masih tersegel: T. Kasus #03 menyusul.'
};