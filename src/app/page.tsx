import data from "../data/tugas.json";
import { validasiWorkspace } from "../lib/data.mjs";
import Papan from "../components/Papan";

export default function Page() {
  return <Papan data={validasiWorkspace(data)} />;
}
