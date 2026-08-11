import React, { useEffect, useState } from "react";
import { obtenerServicios, crearTurno } from "../api.js";

export default function VistaUsuario() {
  const [servicios, setServicios] = useState([]);
  const [idServicio, setIdServicio] = useState("");
  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerServicios()
      .then((datos) => {
        if (Array.isArray(datos) && datos.length > 0) {
          setServicios(datos);
          setIdServicio(datos[0].id);
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  async function solicitarTurno() {
    setError("");
    setCargando(true);
    try {
      const res = await crearTurno(idServicio);
      // Extraemos el objeto sin importar si viene plano o anidado
      const t = res.turno || res.data || res;

      setTurno({
        id: t.id || Date.now(),
        codigo: t.codigo || "T-001",
        servicio: t.servicio_nombre || t.servicio || "Caja de atención",
        tiempo_estimado: t.tiempo_espera_estimado || t.tiempo_estimado || 3.0,
        turnos_delante: t.turnos_delante !== undefined ? t.turnos_delante : 0,
        estado: t.estado || "En espera",
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="tarjeta">
      <h2>Mi turno virtual</h2>

      {!turno && (
        <>
          <label>Selecciona un servicio</label>
          <select value={idServicio} onChange={(e) => setIdServicio(e.target.value)}>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
          <button className="boton-principal" onClick={solicitarTurno} disabled={cargando}>
            {cargando ? "Generando turno..." : "Generar turno"}
          </button>
        </>
      )}

      {turno && (
        <div className="detalle-turno">
          <p><strong>Servicio:</strong> {turno.servicio}</p>
          <p><strong>Turno asignado:</strong> {turno.codigo}</p>
          <p className="destacado">
            Tiempo estimado de espera (IA): {turno.tiempo_estimado} minutos
          </p>
          <p><strong>Turnos por delante:</strong> {turno.turnos_delante}</p>
          <p><strong>Estado:</strong> {turno.estado}</p>
          <button className="boton-secundario" onClick={() => setTurno(null)}>
            Solicitar otro turno
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </section>
  );
}
