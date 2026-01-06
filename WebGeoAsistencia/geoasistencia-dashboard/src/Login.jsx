import { useState } from "react";

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Credenciales de prueba
    if (correo === "admin@geo.com" && password === "1234") {
      onLogin({ rol: "admin", correo });
    } else if (correo === "usuario@geo.com" && password === "1234") {
      onLogin({ rol: "usuario", correo });
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <div style={styles.page}>
      {/* LADO IZQUIERDO */}
      <div style={styles.left}>
        <h1 style={styles.brand}>GeoAsistencia</h1>
        <p style={styles.slogan}>
          Plataforma de control, gestión de usuarios y sedes empresariales.
        </p>
      </div>

      {/* LADO DERECHO */}
      <div style={styles.right}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Iniciar sesión</h2>

          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
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

          <button type="submit" style={styles.button}>
            Ingresar
          </button>

          <div style={styles.help}>
            <p><b>Admin:</b> admin@geo.com / 1234</p>
            <p><b>Usuario:</b> usuario@geo.com / 1234</p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===================== */
/* ESTILOS PROFESIONALES */
/* ===================== */

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "Segoe UI, sans-serif",
  },

  left: {
    flex: 1,
    background: "linear-gradient(135deg, #020617, #020617)",
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
    maxWidth: "420px",
    lineHeight: 1.5,
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
    fontSize: "26px",
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
    marginTop: "10px",
  },

  error: {
    color: "red",
    marginBottom: "12px",
    textAlign: "center",
  },

  help: {
    marginTop: "25px",
    fontSize: "13px",
    textAlign: "center",
    color: "#64748b",
  },
};
