import React, { useEffect, useState } from "react";
import { obtenerServicios, crearTurno, consultarTurno } from "../api.js";

const ICONOS = {
  "Caja de atención": "💳",
  "Información": "ℹ️",
  "Servicio al cliente": "🎧",
};

export default function VistaUsuario() {
  const [servicios, setServicios] = useState([]);
  const [idServicio, setIdServicio] = useState("");
  const [turno, setTurno] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerServicios()
      .then((datos) => {
        setServicios(datos);
        if (datos.length > 0) setIdServicio(datos[0].id);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!turno) return;
    const intervalo = setInterval(() => {
      consultarTurno(turno.id).then(setTurno).catch(() => {});
    }, 8000);
    return () => clearInterval(intervalo);
  }, [turno]);

  async function solicitarTurno() {
    setError("");
    setCargando(true);
    try {
      const resultado = await crearTurno(idServicio);
      const detalle = await consultarTurno(resultado.turno.id);
      setTurno(detalle);
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
          <div className="servicios-grid">
            {servicios.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`servicio-card ${String(idServicio) === String(s.id) ? "seleccionado" : ""}`}
                onClick={() => setIdServicio(s.id)}
              >
                <span className="servicio-icono">{ICONOS[s.nombre] || "🗂️"}</span>
                <span className="servicio-nombre">{s.nombre}</span>
                {s.descripcion && <span className="servicio-descripcion">{s.descripcion}</span>}
              </button>
            ))}
          </div>
          <button className="boton-principal" onClick={solicitarTurno} disabled={cargando || !idServicio}>
            {cargando ? "Generando turno..." : "Generar turno"}
          </button>
        </>
      )}

      {turno && (
        <div className="detalle-turno">
          <p><strong>Servicio:</strong> {turno.servicio}</p>
          <p><strong>Turno asignado:</strong> {turno.codigo}</p>
          <p className="destacado">
            Tiempo estimado de espera: {turno.tiempo_estimado} minutos
          </p>
          <p><strong>Turnos por delante:</strong> {turno.turnos_delante}</p>
          <p><strong>Estado:</strong> {turno.estado === "en_espera" ? "En espera" : turno.estado}</p>
          <button className="boton-secundario" onClick={() => setTurno(null)}>
            Solicitar otro turno
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </section>
  );
}