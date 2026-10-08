"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { hitungStatus, saringTugas, validasiWorkspace } from "../lib/data.mjs";

type Tugas = {
  id: string; judul: string; jenis: string; kategori: string;
  status: string; sumber: string; catatan?: string; tahapEstafet?: number;
};
type Proyek = { id: string; nama: string; diperbaruiPada: string; tugas: Tugas[] };
type Workspace = { defaultProyekId: string; proyek: Proyek[] };
type Editor = { tipe: "tugas"; tugas?: Tugas; status: string } | { tipe: "proyek"; baru: boolean };
const STORAGE_KEY = "monitoring-proyek.workspace.v2";
const kolom = [
  { id: "belum_selesai", nama: "Belum selesai" },
  { id: "dikerjakan", nama: "Dikerjakan" },
  { id: "selesai", nama: "Selesai" },
];

function hariIni() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function Modal({ judul, onClose, children }: { judul: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="editor-dialog" aria-labelledby="editor-title" onCancel={onClose} onClose={onClose}>
    <div className="dialog-heading"><h2 id="editor-title">{judul}</h2><button type="button" aria-label="Tutup editor" onClick={onClose}>×</button></div>
    {children}
  </dialog>;
}

export default function Papan({ data }: { data: Workspace }) {
  const [workspace, setWorkspace] = useState<Workspace>(data);
  const [proyekId, setProyekId] = useState(data.defaultProyekId);
  const [jenis, setJenis] = useState(() => data.proyek.find((item) => item.id === data.defaultProyekId)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
  const [kategori, setKategori] = useState("semua");
  const [pencarian, setPencarian] = useState("");
  const [statusMobile, setStatusMobile] = useState("belum_selesai");
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [pesan, setPesan] = useState("");
  const [error, setError] = useState("");
  const klik = useRef(0);
  const proyek = workspace.proyek.find((item) => item.id === proyekId) ?? workspace.proyek[0];

  useEffect(() => {
    try {
      // Hapus cache versi lama jika ada
      localStorage.removeItem("monitoring-proyek.workspace.v1");

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const tersimpan = JSON.parse(raw);
        // Jika data repositori hasil git push berbeda dengan basis lokal, langsung prioritaskan data push terbaru!
        if (tersimpan.basis !== JSON.stringify(data)) {
          localStorage.removeItem(STORAGE_KEY);
          setWorkspace(data);
          setProyekId(data.defaultProyekId);
          setJenis(data.proyek.find((item) => item.id === data.defaultProyekId)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
          setPesan("");
        } else {
          const hasil = validasiWorkspace(tersimpan.workspace) as Workspace;
          setWorkspace(hasil);
          setProyekId(hasil.defaultProyekId);
          setJenis(hasil.proyek.find((item) => item.id === hasil.defaultProyekId)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
        }
      } else {
        setWorkspace(data);
        setProyekId(data.defaultProyekId);
        setJenis(data.proyek.find((item) => item.id === data.defaultProyekId)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
      }
    } catch {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      setWorkspace(data);
      setProyekId(data.defaultProyekId);
      setJenis(data.proyek.find((item) => item.id === data.defaultProyekId)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
    }
    setIsReady(true);
  }, [data]);

  function sinkronkanKePush() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("monitoring-proyek.workspace.v1");
    } catch {}
    setWorkspace(data);
    setProyekId(data.defaultProyekId);
    setJenis(data.proyek.find((item) => item.id === data.defaultProyekId)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
    setError("");
    setPesan("Data berhasil disinkronkan langsung ke versi push repositori terbaru.");
  }

  function simpan(hasil: Workspace) {
    if (!isDeveloper) return;
    try {
      validasiWorkspace(hasil);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ basis: JSON.stringify(data), workspace: hasil }));
      setWorkspace(hasil);
      setError("");
      setPesan("Perubahan tersimpan di browser ini.");
      return true;
    } catch {
      setError("Perubahan belum tersimpan. Penyimpanan browser mungkin penuh atau tidak tersedia.");
      return false;
    }
  }

  function simpanProyek(hasil: Proyek) {
    return simpan({ ...workspace, proyek: workspace.proyek.map((item) => item.id === hasil.id ? hasil : item) });
  }

  function resetFilter() { setKategori("semua"); setPencarian(""); }
  function gantiProyek(id: string) {
    setProyekId(id); resetFilter(); setStatusMobile("belum_selesai");
    setJenis(workspace.proyek.find((item) => item.id === id)?.tugas.some((item) => item.jenis === "pengujian") ? "pengujian" : "pengembangan");
  }
  function bukaDeveloper() {
    if (!isReady || isDeveloper) return;
    klik.current += 1;
    if (klik.current >= 10) {
      setIsDeveloper(true); klik.current = 0; setPesan("Mode developer aktif. Edit tersimpan di browser ini.");
    }
  }
  function ubahStatus(id: string, status: string) {
    simpanProyek({ ...proyek, diperbaruiPada: hariIni(), tugas: proyek.tugas.map((item) => item.id === id ? { ...item, status } : item) });
  }
  function ekspor() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(workspace, null, 2) + "\n"], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "tugas.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setPesan("Ekspor selesai. Ganti src/data/tugas.json dengan file unduhan, lalu push untuk membagikan perubahan.");
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || !isDeveloper) return;
    const form = new FormData(event.currentTarget);
    const teks = (key: string) => String(form.get(key) ?? "").trim();
    if (editor.tipe === "proyek") {
      const nama = teks("nama");
      if (!nama) return;
      const id = editor.baru ? crypto.randomUUID() : proyek.id;
      const hasil = editor.baru
        ? [...workspace.proyek, { id, nama, diperbaruiPada: hariIni(), tugas: [] }]
        : workspace.proyek.map((item) => item.id === id ? { ...item, nama, diperbaruiPada: hariIni() } : item);
      if (simpan({ ...workspace, proyek: hasil, defaultProyekId: form.has("default") ? id : workspace.defaultProyekId })) {
        gantiProyek(id); setEditor(null);
        if (editor.baru) setJenis("pengembangan");
      }
      return;
    }
    if (!teks("judul") || !teks("kategori")) return;
    const tugas: Tugas = {
      ...editor.tugas,
      id: editor.tugas?.id ?? crypto.randomUUID(), judul: teks("judul"), kategori: teks("kategori"),
      jenis: teks("jenis"), status: teks("status"), catatan: teks("catatan"),
      sumber: teks("sumber") || "Catatan proyek",
    };
    const tahap = Number(teks("tahapEstafet"));
    if (tugas.jenis === "pengujian" && tahap >= 1 && tahap <= 10) tugas.tahapEstafet = tahap;
    else delete tugas.tahapEstafet;
    const daftar = editor.tugas ? proyek.tugas.map((item) => item.id === tugas.id ? tugas : item) : [...proyek.tugas, tugas];
    if (simpanProyek({ ...proyek, diperbaruiPada: hariIni(), tugas: daftar })) {
      setJenis(tugas.jenis); resetFilter(); setStatusMobile(tugas.status); setEditor(null);
    }
  }

  const tugas = saringTugas(proyek.tugas, jenis, kategori, pencarian) as Tugas[];
  const jumlah = hitungStatus(tugas);
  const kategoriPilihan = [...new Set(proyek.tugas.filter((item) => item.jenis === jenis).map((item) => item.kategori))];
  const tanggal = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${proyek.diperbaruiPada}T00:00:00Z`));
  const isFiltered = kategori !== "semua" || pencarian !== "";

  return <div className="app-shell">
    <a className="skip-link" href="#papan">Lewati ke papan tugas</a>
    <header className="topbar">
      <button className="brand-context" type="button" onClick={bukaDeveloper}>Monitoring proyek</button>
      <div className="header-actions">
        {isDeveloper && <button type="button" onClick={sinkronkanKePush} title="Muat ulang versi data resmi dari repositori">🔄 Sinkronkan Data Push</button>}
        <span className="access-label">{isDeveloper ? "Mode developer" : "Hanya baca"}</span>
        {isDeveloper && <button type="button" onClick={() => { setIsDeveloper(false); setEditor(null); setPesan(""); }}>Selesai mengedit</button>}
      </div>
    </header>
    <main>
      <section className="project-row" aria-label="Proyek aktif">
        <label className="project-picker"><span className="sr-only">Pilih proyek</span><select value={proyek.id} onChange={(e) => gantiProyek(e.target.value)}>{workspace.proyek.map((item) => <option key={item.id} value={item.id}>{item.nama}{item.id === workspace.defaultProyekId ? " · Default" : ""}</option>)}</select></label>
        <h1>Papan progres</h1>
        <time dateTime={proyek.diperbaruiPada}>Diperbarui {tanggal}</time>
      </section>
      {isDeveloper && <section className="developer-bar" aria-label="Pengaturan developer">
        <div className="developer-actions"><button type="button" onClick={() => setEditor({ tipe: "proyek", baru: true })}>+ Proyek</button><button type="button" onClick={() => setEditor({ tipe: "proyek", baru: false })}>Atur proyek</button><button type="button" onClick={ekspor}>Ekspor data</button></div>
        <span>Edit lokal di browser · Ekspor untuk push</span>
      </section>}
      {error && <p className="notice error" role="alert">{error}</p>}
      {pesan && <div className="notice" role="status">
        <span>{pesan}</span>
        {isDeveloper && <button type="button" onClick={sinkronkanKePush} style={{ marginLeft: "8px", textDecoration: "underline", background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold" }}>Gunakan Data Push</button>}
        <button type="button" aria-label="Tutup pesan" onClick={() => setPesan("")}>×</button>
      </div>}
      <section className="toolbar" aria-label="Filter tugas">
        <div className="view-switch" role="group" aria-label="Jenis tugas">{["pengujian", "pengembangan"].map((value) => <button key={value} type="button" aria-pressed={jenis === value} onClick={() => { setJenis(value); resetFilter(); }}>{value === "pengujian" ? "Pengujian" : "Pengembangan"}<span>{proyek.tugas.filter((item) => item.jenis === value).length}</span></button>)}</div>
        <label className="search-field"><span className="sr-only">Cari tugas</span><input type="search" placeholder="Cari tugas..." value={pencarian} onChange={(e) => setPencarian(e.target.value)} /></label>
        <label className="category-field"><span className="sr-only">Filter kategori</span><select value={kategori} onChange={(e) => setKategori(e.target.value)}><option value="semua">Semua kategori</option>{kategoriPilihan.map((item) => <option key={item}>{item}</option>)}</select></label>
        {isFiltered && <button className="reset-button" type="button" onClick={resetFilter}>Reset</button>}
        <span className="completion" role="status"><strong>{jumlah.selesai}/{tugas.length}</strong> selesai{isFiltered ? " · filter" : ""}</span>
        {isDeveloper && <button className="primary-button" type="button" onClick={() => setEditor({ tipe: "tugas", status: "belum_selesai" })}>+ Tugas</button>}
      </section>
      <div className="mobile-status"><label htmlFor="status-mobile">Status</label><select id="status-mobile" value={statusMobile} onChange={(e) => setStatusMobile(e.target.value)}>{kolom.map((item) => <option key={item.id} value={item.id}>{item.nama} ({jumlah[item.id]})</option>)}</select></div>
      <div className="board" id="papan" tabIndex={-1}>
        {kolom.map((item) => {
          const daftar = tugas.filter((t) => t.status === item.id);
          return <section key={`${proyek.id}-${jenis}-${item.id}`} className={`column ${item.id} ${statusMobile === item.id ? "mobile-active" : ""}`} aria-labelledby={`kolom-${item.id}`}>
            <div className="column-heading"><span className="status-mark" aria-hidden="true" /><h2 id={`kolom-${item.id}`}>{item.nama}</h2><span className="column-count">{daftar.length}</span>{isDeveloper && <button type="button" className="add-column" aria-label={`Tambah tugas ${item.nama.toLowerCase()}`} onClick={() => setEditor({ tipe: "tugas", status: item.id })}>+</button>}</div>
            <div className="task-list" tabIndex={0} role="region" aria-label={`Daftar ${item.nama.toLowerCase()}`}>
              {daftar.map((t) => <article className="task-card" key={t.id}>
                <details><summary><span className="card-meta"><span className="category-tag">{t.kategori}</span>{t.tahapEstafet && <span>Estafet {t.tahapEstafet}</span>}<span className="expand-icon" aria-hidden="true">+</span></span><span className="task-title">{t.judul}</span></summary><div className="task-detail">{t.catatan && <p>{t.catatan}</p>}<p className="source">Sumber: {t.sumber}</p></div></details>
                {isDeveloper && <div className="card-actions"><label><span className="sr-only">Status {t.judul}</span><select value={t.status} onChange={(e) => ubahStatus(t.id, e.target.value)}>{kolom.map((status) => <option key={status.id} value={status.id}>{status.nama}</option>)}</select></label><button type="button" aria-label={`Edit ${t.judul}`} onClick={() => setEditor({ tipe: "tugas", tugas: t, status: t.status })}>Edit</button></div>}
              </article>)}
              {!daftar.length && <div className="empty-state"><span aria-hidden="true" /><h3>{isFiltered ? "Tidak ada hasil" : "Belum ada tugas"}</h3><p>{isFiltered ? "Coba pencarian atau kategori lain." : isDeveloper ? "Tambahkan tugas dengan tombol + di atas." : "Tugas akan muncul saat statusnya diperbarui."}</p></div>}
            </div>
          </section>;
        })}
      </div>
      <footer><span>Catatan pengembangan dan pengujian</span><span>Klik kartu untuk detail</span></footer>
    </main>
    {editor && isDeveloper && <Modal judul={editor.tipe === "proyek" ? editor.baru ? "Tambah proyek" : "Atur proyek" : editor.tugas ? "Edit tugas" : "Tambah tugas"} onClose={() => setEditor(null)}>
      <form onSubmit={handleSubmit}>
        {editor.tipe === "proyek" ? <>
          <label>Nama proyek<input name="nama" autoFocus required maxLength={100} defaultValue={editor.baru ? "" : proyek.nama} placeholder="Nama proyek Anda" /></label>
          <label className="checkbox-field"><input name="default" type="checkbox" defaultChecked={!editor.baru && proyek.id === workspace.defaultProyekId} />Buka proyek ini secara default</label>
          <p className="form-hint">Proyek default dibuka setiap kali halaman dimuat. Pilih proyek lain untuk mengganti default.</p>
        </> : <>
          <label>Judul tugas<input name="judul" autoFocus required maxLength={200} defaultValue={editor.tugas?.judul} placeholder="Apa yang perlu dikerjakan?" /></label>
          <div className="form-row"><label>Jenis<select name="jenis" defaultValue={editor.tugas?.jenis ?? jenis}><option value="pengembangan">Pengembangan</option><option value="pengujian">Pengujian</option></select></label><label>Status<select name="status" defaultValue={editor.status}>{kolom.map((item) => <option key={item.id} value={item.id}>{item.nama}</option>)}</select></label></div>
          <label>Kategori<input name="kategori" list="kategori-tugas" required maxLength={80} defaultValue={editor.tugas?.kategori ?? (kategori !== "semua" ? kategori : "Umum")} /><datalist id="kategori-tugas">{[...new Set(proyek.tugas.map((t) => t.kategori))].map((value) => <option key={value} value={value} />)}</datalist></label>
          <label>Catatan<textarea name="catatan" rows={3} maxLength={2000} defaultValue={editor.tugas?.catatan} placeholder="Keterangan singkat (opsional)" /></label>
          <div className="form-row"><label>Sumber<input name="sumber" maxLength={200} defaultValue={editor.tugas?.sumber} placeholder="Catatan proyek" /></label><label>Estafet (opsional)<input name="tahapEstafet" type="number" min={1} max={10} step={1} defaultValue={editor.tugas?.tahapEstafet} /></label></div>
        </>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <div className="form-actions"><button type="button" onClick={() => setEditor(null)}>Batal</button><button className="primary-button" type="submit">Simpan</button></div>
      </form>
    </Modal>}
  </div>;
}
