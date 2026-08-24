import React, { useState } from "react";
import VistaUsuario from "./components/VistaUsuario.jsx";
import VistaAdmin from "./components/VistaAdmin.jsx";

export default function App() {
  const [vista, setVista] = useState("usuario");

  return (
    <div className="contenedor">
      <header className="encabezado">
        <h1>Sistema Inteligente de Gestión de Filas</h1>
        <nav className="nav">
          <button
            className={vista === "usuario" ? "activo" : ""}
            onClick={() => setVista("usuario")}
          >
            Vista Usuario
          </button>
          <button
            className={vista === "admin" ? "activo" : ""}
            onClick={() => setVista("admin")}
          >
            Panel Administrativo
          </button>
        </nav>
      </header>

      <main>
        {vista === "usuario" ? <VistaUsuario /> : <VistaAdmin />}
      </main>
    </div>
  );
}
