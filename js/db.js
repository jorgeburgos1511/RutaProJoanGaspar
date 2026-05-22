import { db } from './firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Salidas ──────────────────────────────────────────────────────────────────

export async function crearSalida(datos) {
  const ref = await addDoc(collection(db, 'salidas'), {
    ...datos,
    estado: 'pendiente',
    creadoEn: serverTimestamp()
  });
  return ref.id;
}

export async function obtenerSalidas() {
  const q = query(collection(db, 'salidas'), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function obtenerSalida(id) {
  const snap = await getDoc(doc(db, 'salidas', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function actualizarSalida(id, datos) {
  await updateDoc(doc(db, 'salidas', id), datos);
}

export async function eliminarSalida(id) {
  await deleteDoc(doc(db, 'salidas', id));
}

// ── Paradas (actualización inline dentro del doc de salida) ──────────────────

export async function marcarParadaCompletada(salidaId, paradasActualizadas) {
  await updateDoc(doc(db, 'salidas', salidaId), {
    paradas: paradasActualizadas
  });
}
