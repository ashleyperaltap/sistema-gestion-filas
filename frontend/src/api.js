// Todas las llamadas al backend pasan por aquí.
// Si cambias el puerto del backend, solo hay que actualizar esta constante.
const API_URL = "https://sistema-gestion-backend-ap.onrender.com/api";
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
