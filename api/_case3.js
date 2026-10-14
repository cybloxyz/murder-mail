// Data Kasus #03. Semua jawaban hanya di server.
export const C3 = {
  title: 'Aku Raga, aku hanya seorang fotografer',
  tagline: 'Aku masih hidup sampai saat ini',
  intro: [
    'Ibu Rahma, ketua Yayasan Senja Ceria, menikahi penerus bisnis Sunshine Party co, Alberto, di Gedung Pelangi dengan kue tujuh tingkat, merpati putih, dan konfeti secukupnya. Semuanya sempurna, kecuali mempelai wanitanya.',
    'Jam 18:49 Ibu Rahma masuk ke ruang pendingin untuk menyetujui kue. Jam 20:05 ia ditemukan di dalamnya, masih anggun, hanya sedikit lebih dingin dari biasanya. Pintunya terkunci dari luar.',
    'Tamu bilang ini kecelakaan. Katering bilang kuenya masih aman dimakan. Tolong aku hanya fotografer pernikahan mereka tapi ntah kenapa akhir akhir ini aku selalu merasa diikuti',
    'mereka menuduhku punya bukti dan menghapusnya, foto foto di kameraku hilang, padahal aku tidak pernah melepas kameraku'],

  timeline: [
    ['16:00', 'Tuas pelepas darurat di dalam ruang pendingin dicuci dan dipasang kembali oleh staf katering.'],
    ['18:49', 'Ibu Rahma masuk ruang pendingin untuk menyetujui kue.'],
    ['18:52', 'Pintu ruang pendingin terkunci.'],
    ['20:05', 'Ibu Rahma ditemukan di dalam ruang pendingin.']
  ],
  suspects: [
    { id: 'alea', name: 'Alea', role: 'Penyusun acara', statement: '"Aku di panggung mengatur musik dari jam setengah tujuh. Aku memegang semua kunci dan semua kekacauan, tapi tidak semua rahasia."' },
    { id: 'Alberto', name: 'Alberto', role: 'Mempelai pria', statement: '"Aku di ruang rias bersama tiga saksi, mencoba mengikat dasi dan masa depan. Aku menikahinya karena cinta. Warisan itu bonus."' },
    { id: 'dewi', name: 'Dewi', role: 'Adik tiri', statement: '"Aku bertengkar dengan Rahma jam enam, lalu menangis di toilet. Menangis itu bukan kejahatan. Di keluarga ini mungkin iya."' },
    { id: 'kiki', name: 'Kiki', role: 'Kepala katering', statement: '"Ruang pendingin itu wilayahku. Tuasnya sudah kucuci dan kupasang. Kalau hilang, itu bukan salah kueku."' },
    { id: 'raga', name: 'raga', role: 'Fotografer', statement: '"aku memang mengikuti kedua mempelai, tapi itu karna tugasku fotografer, ibu rahma bilang dia ingin melihat kue ke dalam, aku hanya menunggu diluar di belakang mempelai pria, aku sibuk melihat hasil foto."' },
    { id: 'c', name: 'Tuan C.', role: 'Notaris yayasan', statement: '"Aku di lobi mencatat tamu dengan tablet. Notaris itu setia, konsisten, dan sangat membosankan. Aku tidak pernah dekat dapur."' }
  ],
  methods: [['jarak_jauh', 'Tuas dicopot lebih dulu, lalu pintu dikunci dari jarak jauh'], ['manual', 'Pintu dikunci manual dari luar saat Rahma masuk'], ['rusak', 'Tuas rusak sendiri dan pintu terkunci otomatis'], ['prank', 'Kejutan pernikahan yang tidak lucu']],
  motives: [['hibah', 'Mencegah Rahma membatalkan hibah yayasan jam sembilan'], ['warisan', 'Mengincar warisan Rahma'], ['cinta', 'Cemburu pada mempelai'], ['balas', 'Balas dendam lama']]
};

export const EVIDENCE = {
  f1: ['CCTV KORIDOR', 'Pintu Pendingin', 'Ibu Rahma masuk ruang pendingin jam 18:49. Antara 18:49 dan 20:00 tidak ada seorang pun yang menyentuh pintu dari luar. Pintu terkunci sendiri jam 18:52.'],
  f2: ['LOG KUNCI', 'Kunci Elektronik', 'Jam 18:52: perintah kunci jarak jauh dari perangkat terdaftar "NOTARIS-TAB". Kode manual tidak dipakai sepanjang malam.'],
  f3: ['FOTO STAF', 'Tuas Darurat', 'Foto staf katering jam 16:00 memperlihatkan tuas pelepas darurat di sisi dalam terpasang rapi. Pada 20:05 tuas itu hilang, dan ada bekas obeng di engselnya.'],
  f4: ['BUKU TAMU', 'Masuk Dapur', 'Antara 16:00 dan 18:49 hanya satu orang masuk ruang pendingin: Tuan C., jam 17:30 sampai 17:41, dengan catatan "mencicipi kue".'],
  f5: ['FOTO PANGGUNG', 'Album 18:35 sampai 19:25', 'Alea terlihat di panggung pada tujuh foto. Alberto terlihat di ruang rias pada rekaman 18:40 sampai 19:10.'],
  f6: ['CCTV LOBI', 'Tuan C.', 'Tuan C. berdiri di lobi memegang tablet dari 18:45 sampai 19:20 dan tidak pernah mendekati koridor dapur.'],
  f7: ['STRUK', 'Dewi', 'Struk toilet digital dan CCTV menempatkan Dewi di toilet dari 18:30 sampai 19:15.'],
  f8: ['SURAT', 'Tulisan di Undangan', '"Jika aku tidak sempat memotong kue, tanyakan pada C. kenapa ia begitu ingin tanda tanganku jam sembilan. Aku berniat membatalkan hibah itu."']
};

export const THREADS = [
  { ev: 'f3', re: /tuas|darurat|obeng|pelepas/i, mail: 'Tuas kecil itu tidak pernah kuperhatikan, sampai aku butuh. Cari siapa yang membawa obeng ke pesta.' },
  { ev: 'f2', re: /kunci|kode|gembok|lock|elektronik/i, mail: 'Pintu itu modern sekali, Sayang. Bisa dikunci tanpa ada yang menyentuhnya. Lihat lognya.' },
  { ev: 'f6', re: /lobi|notaris|tuan c|tablet/i, mail: 'Tuan C. selalu terlihat sibuk di tempat yang jauh. Itu keahliannya.' },
  { ev: 'f7', re: /dewi|toilet|struk|adik/i, mail: 'Adikku menangis dengan sangat meyakinkan. Cek strukturnya, bukan air matanya.' },
  { ev: 'f4', re: /buku tamu|tamu|dapur|daftar|masuk/i, mail: 'Dapur punya buku tamu karena kue lebih dilindungi daripada pengantin.' },
  { ev: 'f5', re: /foto|panggung|alea|Alberto|rias|album/i, mail: 'Semua orang suka berfoto saat orang lain sedang dikunci. Lihat siapa yang punya alibi paling indah.' },
  { ev: 'f8', re: /surat|undangan|pesan|wasiat|terakhir/i, mail: 'Ada tulisanku di balik undangan. Tapi kumpulkan dulu empat berkas lain. Aku tidak suka dibaca terburu-buru.' },
  { ev: 'f1', re: /cctv|kamera|koridor|rekam|pintu/i, mail: 'Kamera koridor itu setia. Ia melihat semua orang yang tidak melakukan apa-apa.' }
];
export const DEFAULT_MAIL = 'Aku tidak tau semua hal, tanyakan hal lain.';

export const SOLUTION = {
  culprit: 'c', method: 'jarak_jauh', motive: 'hibah', minFiles: 4,
  cleared: {
    alea: 'Alea terlihat di panggung pada tujuh foto, dan kode manual tidak pernah dipakai. Ia memegang kunci, tapi bukan dialah yang mengunci.',
    Alberto: 'Alberto berada di ruang rias bersama tiga saksi saat pintu terkunci. Ia untung secara warisan, tapi tidak hadir di mana pun yang relevan.',
    dewi: 'Dewi tercatat di toilet sepanjang waktu itu. Pertengkarannya nyata, tapi pintu pendingin tidak ada hubungannya.',
    kiki: 'Tuas masih terpasang jam 16:00 menurut foto stafmu sendiri. Kiki justru saksi bahwa tuas itu dicopot setelahnya oleh orang yang masuk sebelum jam 18:49.'
  },
  epilog: 'Tuan C. tersenyum sopan: "Konsisten sampai akhir." Lalu ia berbisik: "Alea tidak sekadar penyusun acara. Tanyakan padanya siapa yang menggaji kami semua." Alea sudah menghilang bersama buku jadwalnya, meninggalkan satu merpati putih yang tidak mau pergi. Dan Raga menghilang bersama foto pernikahan terakhir. Kasus #04 menyusul.'
};