import React, { useEffect, useState } from "react";
import { listarTurnosEnEspera, atenderTurno, obtenerResumen } from "../api.js";

export default function VistaAdmin() {
  const [turnos, setTurnos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  async function cargarDatos() {
    try {
      const [listaTurnos, datosResumen] = await Promise.all([
        listarTurnosEnEspera(),
        obtenerResumen(),
      ]);
      setTurnos(listaTurnos);
      setResumen(datosResumen);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    cargarDatos();
    const intervalo = setInterval(cargarDatos, 8000);
    return () => clearInterval(intervalo);
  }, []);

  async function marcarAtendido(id) {
    try {
      await atenderTurno(id);
      cargarDatos();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="tarjeta">
      <h2>Panel administrativo</h2>

      {resumen && (
        <div className="indicadores">
          <div className="indicador">
            <span className="numero">{resumen.turnos_en_espera}</span>
            <span>Turnos en espera</span>
          </div>
          <div className="indicador">
            <span className="numero">{resumen.tiempo_promedio_estimado.toFixed(1)} min</span>
            <span>Tiempo promedio estimado (IA)</span>
          </div>
          <div className="indicador">
            <span className="numero">{resumen.turnos_atendidos_hoy}</span>
            <span>Turnos atendidos hoy</span>
          </div>
        </div>
      )}

      <table className="tabla-turnos">
        <thead>
          <tr>
            <th>Turno</th>
            <th>Servicio</th>
            <th>Espera estimada</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((t) => (
            <tr key={t.id}>
              <td>{t.codigo}</td>
              <td>{t.servicio}</td>
              <td>{t.tiempo_estimado} min</td>
              <td>{t.estado}</td>
              <td>
                <button onClick={() => marcarAtendido(t.id)}>Atender</button>
              </td>
            </tr>
          ))}
          {turnos.length === 0 && (
            <tr><td colSpan="5">No hay turnos en espera</td></tr>
          )}
        </tbody>
      </table>

      {error && <p className="error">{error}</p>}
    </section>
  );
}
