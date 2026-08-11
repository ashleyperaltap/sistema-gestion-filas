<<<<<<< HEAD
// Todas las llamadas al backend pasan por aquí.
// En desarrollo local usa http://localhost:4000/api por defecto.
// En producción (Render, Vercel, Netlify, etc.) se define la variable de entorno
// VITE_API_URL con la URL pública del backend desplegado, por ejemplo:
//   VITE_API_URL=https://gestion-filas-backend.onrender.com/api
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function manejarRespuesta(respuesta) {
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.error || "Ocurrió un error inesperado");
  }
  return datos;
}
=======
// Definición directa de la URL de Render
const API_URL = "https://sistema-gestion-backend-ap.onrender.com";
>>>>>>> 2f5cb302dd16725b73fc37e00c7b34be75feebae

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
