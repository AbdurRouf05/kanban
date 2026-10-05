# Rencana implementasi monitoring proyek

Status: Rencana revisi, belum implementasi.
Tanggal: 5 Oktober 2026.

## Keputusan

Aplikasi berada di `docs2/monitoring-proyek`, berupa satu halaman kanban untuk dibaca klien. Data disimpan dalam Git dan diterbitkan ketika perubahan masuk ke branch deployment. Gunakan Next.js, TypeScript, Tailwind, dan static export. Workspace sudah mencakup `docs2/*`.

Tidak diperlukan database, backend, panel admin, drag-and-drop, komentar, atau pembaruan realtime. Aplikasi dan build terpisah dari `docs2/progres-deck` serta aplikasi operasional LSP.

## Sumber data

- `docs/developmentdocs/README.md`: indeks milestone M1–M7.
- README dan `pembagian-modul-dan-task.md` di masing-masing milestone: rincian pekerjaan pengembangan.
- `docs/developmentdocs/m3/sisa-pekerjaan-dan-uji-coba.md`: sisa pekerjaan dan pengujian.
- `docs2/PANDUAN_AUDIT_DAN_TODO_ESTAFET_ROLE.md`: checklist delapan tahap estafet, hasil pengujian, dan audit menu Admin LSP.

Ringkas tugas dari sumber tersebut ke `src/data/tugas.json` secara terkurasi. Perbarui file data bersama dokumen dalam commit perubahan progres. MVP tidak memakai parser Markdown otomatis karena format sumber beragam dan memuat instruksi internal.

Push saja tidak menafsirkan perubahan kode sebagai perubahan status. Website menampilkan versi file data dari deployment terbaru yang berhasil. Tidak ada pembacaan dokumen melalui browser atau API GitHub.

## Kanban dan status

Dua tab pada halaman yang sama:

| Tab | Isi | Kategori |
| --- | --- | --- |
| Pengujian | Checklist dan hasil uji per estafet | Role dan tahap estafet |
| Pengembangan | Pekerjaan implementasi | Milestone M1–M7 |

Tab Pengujian dibuka pertama agar klien melihat kesiapan alur yang sudah diuji. Keduanya memiliki tiga kolom: **Belum selesai**, **Dikerjakan**, **Selesai**. “Belum selesai” dipilih karena checkbox kosong tidak membuktikan pekerjaan belum pernah dimulai.

Aturan pemetaan:

1. `[x]` berarti selesai menurut catatan sumber untuk jenis tugas tersebut. Selesai pengembangan tidak berarti lulus pengujian.
2. `[ ]` berarti belum selesai. Dikerjakan harus memiliki catatan eksplisit bahwa pekerjaan sedang berlangsung.
3. Pengujian gagal tetap belum selesai, atau dikerjakan jika perbaikannya aktif; tambahkan catatan hasil uji.
4. Status tidak jelas masuk belum selesai dengan catatan “Perlu konfirmasi status”. Jangan menyimpulkan progres dari jumlah commit atau keberadaan file.
5. Jika sumber bertentangan, tandai untuk konfirmasi sebelum menetapkan selesai. Contoh nyata: indeks developmentdocs menyebut M7 masih rencana, sedangkan README M7 menyebut selesai.
6. Gabungkan tugas yang sama dari README dan breakdown. Pengembangan dan pengujian fitur yang sama tetap berbeda karena mengukur hasil berbeda.
7. Rekap audit menu menjadi konteks untuk tugas uji terkait, tidak otomatis menambah kartu duplikat.

Tampilkan keterangan “Status berdasarkan catatan pengembangan dan pengujian”. Portal tidak melakukan pengujian aplikasi secara otomatis.

## Tampilan

Design Read: papan monitoring LSP-Smart untuk klien, minimalis corporate, ENERGY 1 / RHYTHM 2 / MOTION 1. Antislop berlaku selama perencanaan dan implementasi sesuai pilihan pengguna.

- Bagian atas: nama proyek, tanggal pembaruan data, jumlah selesai dibanding total pada tab/filter aktif. Tidak memakai bobot atau persentase proyek selesai karena ukuran tugas tidak setara.
- Kontrol: dua tab, pencarian judul, satu filter kategori (milestone atau role), serta reset filter.
- Kartu: judul singkat, kategori, catatan satu atau dua baris. Detail tambahan dibuka inline bila diperlukan.
- Sumber ditampilkan sebagai label dokumen/nomor tugas, bukan tautan localhost, `file://`, atau repository privat.
- Desktop: tiga kolom dengan scroll daftar di dalam kolom. Ringkasan dan kontrol muat di laptop 1366×768 dan 1280×720.
- Mobile: pemilih status dan satu daftar vertikal tanpa scroll horizontal. Tombol utama berdampingan satu baris. Saat zoom, konten mengalir agar tidak terpotong.
- Header navy solid dan permukaan terang mengikuti identitas LSP. Gunakan semantic tokens M3 untuk surface, onSurface, primary, outline, dan error. Warna status selalu disertai teks.
- Fokus keyboard terlihat, kontrol berlabel, kontras AA, target sentuh memadai, dan tipografi terbaca. Tidak ada animasi dekoratif atau tombol edit semu.
- Kondisi kosong: “Belum ada tugas” atau “Tidak ada hasil”, dengan reset filter sesuai konteks. Data tidak valid ditolak saat build sebelum publikasi.

## Data dan struktur

```text
docs2/monitoring-proyek/
  IMPLEMENTATION_PLAN.md
  package.json
  next.config.mjs
  src/app/                  satu halaman monitoring
  src/components/           papan, kartu, filter
  src/data/tugas.json        ringkasan publik dari dokumen
  src/lib/                  validasi dan pengelompokan data
  README.md                 panduan update dan deployment
```

Data proyek: `nama`, `diperbaruiPada`.

Data tugas: `id`, `judul`, `jenis` (pengembangan/pengujian), `kategori`, `tahapEstafet` opsional, `status` (belum_selesai/dikerjakan/selesai), `catatan` opsional, serta `sumber` berupa label dokumen dan nomor tugas/bagian.

Gunakan ID stabil dan unik seperti `dev-m2-02` dan `uji-estafet-1-02`. Tanggal konten diperbarui saat isi berubah, bukan setiap build. Validasi menolak ID ganda, field wajib kosong, tanggal tidak valid, dan status/jenis tidak dikenal.

Panduan estafet memuat kredensial pengujian. File publik hanya memuat ringkasan tugas: kata sandi, email akun, identitas contoh, URL lokal, dan instruksi database tidak ikut disalin. Jangan menyalin Markdown sumber ke folder publik atau bundle frontend.

## Pembaruan melalui push

1. Perbarui dokumen setelah pengerjaan atau pengujian.
2. Sesuaikan tugas terkait di `tugas.json` dan tanggal pembaruan dalam commit yang sama.
3. Jalankan validasi data dan build aplikasi monitoring.
4. Push melalui alur branch/PR repositori; jangan direct push ke `main`.
5. Hosting membangun ulang saat branch deployment berubah. Push branch fitur dapat menghasilkan preview; hanya branch produksi yang dikonfigurasi memperbarui tautan klien.
6. Jika build gagal, laporan sebelumnya tetap tampil; jangan menganggap pembaruan sudah terpublikasi.

Tentukan branch deployment saat setup hosting. Konfigurasi pemicu build mencakup aplikasi monitoring, kedua lokasi dokumen sumber, serta lockfile/config terkait. Perubahan dokumen saja tetap tidak mengubah kartu apabila file data belum diperbarui.

## Tahapan implementasi

| Tahap | Pekerjaan | Kriteria selesai |
| --- | --- | --- |
| 1 | Inventaris dan ringkas tugas | Tidak duplikat; pengembangan/uji dipisahkan; konflik status ditandai |
| 2 | Aplikasi statis dan data | Build mandiri tanpa backend; validasi data berjalan |
| 3 | Kanban dan filter | Tab, pencarian, filter, detail, serta jumlah bekerja |
| 4 | Verifikasi konten dan browser | Tidak ada kredensial; mobile, keyboard, dan kondisi kosong bekerja |
| 5 | Hosting dan panduan update | Push ke branch deployment menerbitkan versi data yang tepat |

Pengujian cukup mencakup validasi data, pengelompokan/status, jumlah dengan filter, typecheck, production build, dan browser desktop/mobile. Audit antislop dilakukan pada UI yang berjalan; rencana ini tidak mengklaim UI sudah lulus. Data awal belum diaudit menyeluruh pada tahap rencana.

## Hosting dan batas tugas

Output statis dapat diterbitkan di Vercel. Catatan rencana awal tetap berlaku: Vercel Hobby untuk penggunaan personal nonkomersial. Pilihan penyedia dan paket ditetapkan sebelum publikasi; kandidat gratis alternatif adalah Cloudflare Pages, dengan syarat diverifikasi saat setup.

Sumber yang diperiksa pada rencana awal 5 Oktober 2026:

- https://vercel.com/docs/plans/hobby
- https://developers.cloudflare.com/pages/platform/limits/

Rencana ini menggantikan portal di `apps/progres-klien` dengan scope lebih sederhana. Belum ada kode aplikasi, push, atau deployment. Asumsi MVP adalah laporan publik yang disanitasi; jika isi laporan harus privat, tambahkan kontrol akses sebelum publikasi.
