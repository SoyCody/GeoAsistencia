import { useState, useEffect } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import Usuarios from "./Usuarios";
import Sedes from "./Sedes";
import Geocercas from "./Geocercas";
import Auditoria from "./Auditoria";
import { userService } from "./api/userService";
import { authService } from "./api/authService";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await userService.getMe();
      setUsuario(response.data);
    } catch (error) {
      console.error("Error al verificar sesión:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      setUsuario(null);
      setVista("dashboard");
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Verificando sesión...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

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

          <li
            style={vista === "usuarios" ? styles.menuActive : styles.menuItem}
            onClick={() => setVista("usuarios")}
          >
            Usuarios
          </li>

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

          <li
            style={vista === "auditoria" ? styles.menuActive : styles.menuItem}
            onClick={() => setVista("auditoria")}
          >
            Auditoría
          </li>
        </ul>

        <div style={styles.logoutContainer}>
          <div style={styles.logout} onClick={handleLogout}>
            Cerrar sesión
          </div>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main style={styles.main}>
        {vista === "dashboard" && <Dashboard />}
        {vista === "usuarios" && <Usuarios />}
        {vista === "sedes" && <Sedes />}
        {vista === "geocercas" && <Geocercas />}
        {vista === "auditoria" && <Auditoria />}
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

  /* SIDEBAR */
  sidebar: {
    width: "260px",
    background: "#141c3fff",
    color: "#e5e7eb",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 12px rgba(0,0,0,0.25)",
    flexShrink: 0,
  },

  logo: {
    fontSize: "20px",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: "0.5px",
    paddingBottom: "20px",
    marginBottom: "28px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  menu: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flex: 1,
  },

  menuItem: {
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "8px",
    color: "#cbd5f5",
    transition: "all 0.2s ease",
  },

  menuActive: {
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "8px",
    background: "rgba(37,99,235,0.15)",
    color: "#ffffff",
    borderLeft: "4px solid #2563eb",
  },

  logoutContainer: {
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  logout: {
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "rgba(119, 12, 12, 1)",
    color: "#efe6e6ff",
    textAlign: "center",
    fontWeight: "500",
    transition: "background 0.2s ease",
  },

  /* MAIN */
  main: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
    width: "100%",
  },

  /* LOADING */
  loadingScreen: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f1f5f9",
  },

  spinner: {
    width: 50,
    height: 50,
    border: "5px solid #e2e8f0",
    borderTop: "5px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: 20,
    color: "#64748b",
    fontSize: 14,
  },
};
