import { useState } from "react";
import { authService } from "./api/authService";
import { userService } from "./api/userService";

export default function Login({ onLogin }) {
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Login y obtener token
      const loginData = await authService.login(codigo, password);
      localStorage.setItem("token", loginData.token);

      // 2. Obtener datos completos del usuario
      const userData = await userService.getMe();

      // 3. Pasar datos del usuario al componente padre
      onLogin(userData.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Código o contraseña incorrectos"
      );
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h1 style={styles.brand}>GeoAsistencia</h1>
        <p style={styles.slogan}>
          Plataforma empresarial de control y gestión de asistencias.
        </p>
      </div>

      <div style={styles.right}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Iniciar sesión</h2>

          <input
            type="text"
            placeholder="Código"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ===== ESTILOS ===== */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  left: {
    flex: 1,
    background: "#020617",
    color: "#fff",
    padding: "80px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brand: {
    fontSize: "42px",
    marginBottom: "20px",
  },
  slogan: {
    fontSize: "18px",
    opacity: 0.85,
  },
  right: {
    flex: 1,
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "40px",
    borderRadius: "14px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },
  title: {
    marginBottom: "30px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "18px",
    borderRadius: "10px",
    border: "1px solid #cbd5f5",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    marginBottom: "12px",
    textAlign: "center",
  },
};