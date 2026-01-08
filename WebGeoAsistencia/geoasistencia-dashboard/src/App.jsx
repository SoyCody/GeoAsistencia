import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Usuarios from "./Usuarios";
import Sedes from "./Sedes";
import Geocercas from "./Geocercas";
import Auditoria from "./Auditoria"; // ✅ NUEVO

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState("dashboard");

  // 🔴 LOGIN PRIMERO
  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  // ✅ APP PRINCIPAL
  return (
    <div style={styles.layout}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>GeoAsistencia</h2>

        <ul style={styles.menu}>
          <li
            style={vista === "dashboard" ? styles.menuActive : styles.menuItem}
            onClick={() => setVista("dashboard")}
          >
            Panel de control
          </li>

          {usuario.rol === "admin" && (
            <li
              style={vista === "usuarios" ? styles.menuActive : styles.menuItem}
              onClick={() => setVista("usuarios")}
            >
              Usuarios
            </li>
          )}

          <li
            style={vista === "sedes" ? styles.menuActive : styles.menuItem}
            onClick={() => setVista("sedes")}
          >
            Sedes
          </li>

          <li
            style={vista === "geocercas" ? styles.menuActive : styles.menuItem}
            onClick={() => setVista("geocercas")}
          >
            Geocercas
          </li>

          {/* ✅ AUDITORÍA (SOLO ADMIN) */}
          {usuario.rol === "admin" && (
            <li
              style={vista === "auditoria" ? styles.menuActive : styles.menuItem}
              onClick={() => setVista("auditoria")}
            >
              Auditoría
            </li>
          )}

          <li
            style={styles.logout}
            onClick={() => {
              setUsuario(null);
              setVista("dashboard");
            }}
          >
            🚪 Cerrar sesión
          </li>
        </ul>
      </aside>

      {/* CONTENIDO */}
      <main style={styles.main}>
        {vista === "dashboard" && <Dashboard />}
        {vista === "usuarios" && <Usuarios />}
        {vista === "sedes" && <Sedes />}
        {vista === "geocercas" && <Geocercas />}
        {vista === "auditoria" && <Auditoria />} {/* ✅ NUEVO */}
      </main>
    </div>
  );
}

/* ================== */
/* ESTILOS */
/* ================== */

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "Segoe UI, sans-serif",
    background: "#f1f5f9",
  },

  sidebar: {
    width: "240px",
    background: "#020617",
    color: "#fff",
    padding: "24px",
    flexShrink: 0,
  },

  logo: {
    marginBottom: "40px",
    fontSize: "22px",
    fontWeight: "600",
  },

  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },

  menuItem: {
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "12px",
  },

  menuActive: {
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "12px",
    background: "#2563eb",
  },

  logout: {
    padding: "14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "40px",
    background: "#dc2626",
    textAlign: "center",
  },

  main: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
    width: "100%",
  },
};
