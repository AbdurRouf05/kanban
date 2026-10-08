export const STATUS = ["belum_selesai", "dikerjakan", "selesai"];

export function validasiData(data) {
  const wajib = (nilai) => typeof nilai === "string" && nilai.trim().length > 0;
  if (!data || !wajib(data.nama) || !/^\d{4}-\d{2}-\d{2}$/.test(data.diperbaruiPada ?? "")) {
    throw new Error("Nama proyek atau tanggal pembaruan tidak valid.");
  }
  const tanggal = new Date(`${data.diperbaruiPada}T00:00:00Z`);
  if (Number.isNaN(tanggal.valueOf()) || tanggal.toISOString().slice(0, 10) !== data.diperbaruiPada) {
    throw new Error("Tanggal pembaruan tidak valid.");
  }
  if (!Array.isArray(data.tugas)) throw new Error("Daftar tugas harus berupa array.");
  const ids = new Set();
  for (const tugas of data.tugas) {
    if (!tugas || ![tugas.id, tugas.judul, tugas.kategori, tugas.sumber].every(wajib)) {
      throw new Error("Identitas, judul, kategori, dan sumber tugas wajib diisi.");
    }
    if (ids.has(tugas.id)) throw new Error(`ID tugas ganda: ${tugas.id}`);
    ids.add(tugas.id);
    if (!STATUS.includes(tugas.status) || !["pengembangan", "pengujian"].includes(tugas.jenis)) {
      throw new Error(`Status atau jenis tugas tidak valid: ${tugas.id}`);
    }
    if (tugas.catatan !== undefined && typeof tugas.catatan !== "string") throw new Error("Catatan harus berupa teks.");
    if (tugas.tahapEstafet !== undefined && (!Number.isInteger(tugas.tahapEstafet) || tugas.tahapEstafet < 1 || tugas.tahapEstafet > 10)) {
      throw new Error("Tahap estafet harus antara 1 dan 10.");
    }
  }
  return data;
}

export function saringTugas(tugas, jenis, kategori = "semua", pencarian = "") {
  const kata = pencarian.trim().toLocaleLowerCase("id-ID");
  return tugas.filter((item) => item.jenis === jenis
    && (kategori === "semua" || item.kategori === kategori)
    && `${item.judul} ${item.kategori} ${item.catatan ?? ""}`.toLocaleLowerCase("id-ID").includes(kata));
}

export function hitungStatus(tugas) {
  return Object.fromEntries(STATUS.map((status) => [status, tugas.filter((item) => item.status === status).length]));
}

export function validasiWorkspace(data) {
  if (!data || !Array.isArray(data.proyek)) {
    return { defaultProyekId: "lsp-smart", proyek: [{ ...validasiData(data), id: "lsp-smart" }] };
  }
  if (!data.proyek.length) throw new Error("Minimal satu proyek diperlukan.");
  const ids = new Set();
  for (const proyek of data.proyek) {
    validasiData(proyek);
    if (typeof proyek.id !== "string" || !proyek.id.trim() || ids.has(proyek.id)) {
      throw new Error("ID proyek harus terisi dan unik.");
    }
    ids.add(proyek.id);
  }
  if (!ids.has(data.defaultProyekId)) throw new Error("Proyek default tidak ditemukan.");
  return data;
}
