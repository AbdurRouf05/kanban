import { readFile } from "node:fs/promises";
import { validasiWorkspace } from "../src/lib/data.mjs";

const data = validasiWorkspace(JSON.parse(await readFile(new URL("../src/data/tugas.json", import.meta.url), "utf8")));
console.log(`Data valid: ${data.proyek.length} proyek, ${data.proyek.reduce((total, proyek) => total + proyek.tugas.length, 0)} tugas.`);
