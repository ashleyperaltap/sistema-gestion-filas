// Definición directa de la URL de Render
const API_URL = "https://sistema-gestion-backend-ap.onrender.com";

export async function obtenerServicios() {
  try {
    const res = await fetch(`${API_URL}/api/servicios`);
    if (!res.ok) throw new Error("Error al obtener servicios");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [{ id: 1, nombre: "Caja de atención" }];
  }
}

export async function crearTurno(idServicio) {
  const res = await fetch(`${API_URL}/api/turnos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ servicio_id: idServicio, id_servicio: idServicio }),
  });

  if (!res.ok) {
    throw new Error(`Error en el servidor (${res.status})`);
  }

  return await res.json();
}

export async function consultarTurno(idTurno) {
  try {
    const res = await fetch(`${API_URL}/api/turnos/${idTurno}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
