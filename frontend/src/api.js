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

export async function obtenerServicios() {
  const respuesta = await fetch(`${API_URL}/servicios`);
  return manejarRespuesta(respuesta);
}

export async function crearTurno(idServicio) {
  const respuesta = await fetch(`${API_URL}/turnos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_servicio: idServicio }),
  });
  return manejarRespuesta(respuesta);
}

export async function consultarTurno(idTurno) {
  const respuesta = await fetch(`${API_URL}/turnos/${idTurno}`);
  return manejarRespuesta(respuesta);
}

export async function listarTurnosEnEspera() {
  const respuesta = await fetch(`${API_URL}/turnos?estado=en_espera`);
  return manejarRespuesta(respuesta);
}

export async function atenderTurno(idTurno) {
  const respuesta = await fetch(`${API_URL}/turnos/${idTurno}/atender`, {
    method: "PUT",
  });
  return manejarRespuesta(respuesta);
}

export async function obtenerResumen() {
  const respuesta = await fetch(`${API_URL}/turnos/reportes/resumen`);
  return manejarRespuesta(respuesta);
}
