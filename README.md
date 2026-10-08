# Monitoring proyek LSP-Smart

Kanban beberapa proyek, default hanya baca. Aplikasi menggunakan Next.js dan CSS biasa dengan semantic tokens agar dependensi tetap sedikit. Data pengembangan dan pengujian ditampilkan terpisah.

## Mode developer

Klik tulisan **Monitoring proyek** di header 10 kali. Mode developer menyediakan:

- Pilihan status pada setiap kartu dan tombol Edit untuk mengubah judul, kategori, jenis, catatan, sumber, serta tahap estafet.
- Tombol **+ Tugas** atau **+** di header kolom untuk menambah kartu.
- Tombol **+ Proyek** untuk membuat papan proyek baru.
- Tombol **Atur proyek** untuk mengganti nama dan memilih proyek default saat halaman dimuat.
- Tombol **Ekspor data** untuk mengunduh seluruh proyek menjadi `tugas.json`.

Perubahan disimpan di localStorage browser ini. Muat ulang tetap membuka mode baca dan proyek default yang dipilih. Aktivasi developer tidak disimpan. Ini akses edit internal sederhana, bukan autentikasi.

Untuk membagikan perubahan ke perangkat lain: ekspor data, ganti `src/data/tugas.json` dengan hasil ekspor, kemudian commit dan push. Ekspor berisi `defaultProyekId` dan array `proyek`; format lama satu proyek tetap didukung. Pengunjung tanpa edit lokal memakai data hasil push. Browser yang sudah memiliki edit lokal tetap memakai salinan lokal dan diberi pemberitahuan jika data deployment berubah.

Header dan toolbar diringkas agar tinggi kanban lebih besar. Catatan sumber berada dalam kartu yang dapat dibuka; judul dan kategori selalu terlihat.

## Menjalankan

Dari root repositori:

```sh
pnpm install
pnpm --filter monitoring-proyek dev
```

Buka http://localhost:3006.

## Memperbarui progres

1. Perbarui catatan pada `docs/developmentdocs` atau `docs2/PANDUAN_AUDIT_DAN_TODO_ESTAFET_ROLE.md`.
2. Perbarui tugas terkait di `src/data/tugas.json` dan `diperbaruiPada`.
3. Gunakan status `belum_selesai`, `dikerjakan`, atau `selesai`. Pengujian selesai harus mengikuti catatan hasil uji, bukan status implementasi.
4. Commit data bersama dokumen, kemudian push melalui alur branch/PR repositori.

Dokumen tidak diimpor otomatis. Website menampilkan data dari deployment terakhir yang berhasil. Tugas awal merupakan ringkasan dokumen, bukan audit ulang aplikasi. Kolom Dikerjakan berisi pekerjaan yang sedang direncanakan atau dibangun.

Jangan masukkan kredensial, identitas asesi, atau isi audit internal ke data publik. `noindex` tidak membuat situs privat.

## Build dan hosting

```sh
pnpm --filter monitoring-proyek build
```

Build memvalidasi file data dan menghasilkan `docs2/monitoring-proyek/out`. Untuk Vercel, pilih root directory `docs2/monitoring-proyek`, framework Next.js, dan build command `pnpm build`. Instalasi menggunakan workspace dan lockfile root. Aktifkan akses file di luar root directory bila diperlukan untuk instalasi workspace.

Untuk hosting statis lain, jalankan build terfilter dari root repositori dan gunakan output `docs2/monitoring-proyek/out`.

Hubungkan branch deployment yang diinginkan. Jangan mengaktifkan skip build yang mengabaikan perubahan data atau dokumen sumber. Push branch lain tidak otomatis memperbarui URL produksi. Vercel Hobby hanya untuk penggunaan personal nonkomersial; paket/penyedia produksi belum dipilih atau diaktifkan.

## Arah desain

Antislop diterapkan selama implementasi: ENERGY 1, RHYTHM 2, MOTION 1. Header navy mengikuti identitas corporate LSP; permukaan terang dan font sistem Segoe UI memudahkan pembacaan laporan. Tiga kolom membedakan tahap kerja, warna selalu disertai teks, dan mobile menampilkan satu status agar papan tidak perlu digeser horizontal. CSS biasa menggantikan Tailwind pada rencana awal karena halaman ini tidak membutuhkan framework styling tambahan.

Pengujian browser, typecheck, dan production build belum dijalankan atas permintaan pengguna untuk langsung menjalankan hasilnya. Tidak ada deployment publik pada sesi implementasi ini.
