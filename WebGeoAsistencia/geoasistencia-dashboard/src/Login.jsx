import { useState } from "react";
import { authService } from "./api/authService";
import { userService } from "./api/userService";

export default function Login({ onLogin }) {
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loginData = await authService.login(codigo, password);
      localStorage.setItem("token", loginData.token);

      const userData = await userService.getMe();
      onLogin(userData.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError(
          err.response?.data?.message ||
          "No tienes permisos de administrador para acceder al panel de control"
        );
      } else {
        setError(
          err.response?.data?.message ||
          "Código o contraseña incorrectos"
        );
      }
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* PANEL IZQUIERDO - BRANDING */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingContent}>
          <h1 style={styles.brandTitle}>GeoAsistencia</h1>
          <p style={styles.brandSubtitle}>
            Plataforma empresarial de control y gestión de asistencias
          </p>

          {/* Características */}
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span style={styles.featureText}>Control de asistencia en tiempo real</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span style={styles.featureText}>Geolocalización precisa por zonas</span>
            </div>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>✓</div>
              <span style={styles.featureText}>Reportes y auditoría completa</span>
            </div>
          </div>
        </div>

        {/* Patrón decorativo de fondo */}
        <div style={styles.decorativePattern}></div>
      </div>

      {/* PANEL DERECHO - FORMULARIO */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          {/* Header del formulario */}
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Bienvenido de nuevo</h2>
            <p style={styles.formSubtitle}>
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          {/* Formulario */}
          <form style={styles.form} onSubmit={handleSubmit}>
            {/* Campo de Código */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Código de empleado</label>
              <div style={styles.inputWrapper}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  style={styles.inputIcon}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="Ej: EMP-5856"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  style={styles.input}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.inputWrapper}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  style={styles.inputIcon}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.togglePassword}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div style={styles.errorBox}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={styles.errorIcon}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            {/* Botón de login */}
            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonLoading : {}),
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={styles.buttonIcon}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer del formulario */}
          <div style={styles.formFooter}>
            <p style={styles.footerText}>
              ¿Problemas para ingresar? Contacta al administrador del sistema
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================== */
/* ESTILOS - DISEÑO MODERNO Y PROFESIONAL */
/* ===================================== */

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* ========== PANEL IZQUIERDO ========== */
  leftPanel: {
    flex: "0 0 45%",
    background: "linear-gradient(135deg, #141c3f 0%, #1e293b 100%)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
  },

  brandingContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "480px",
  },

  brandTitle: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 16px 0",
    letterSpacing: "-0.02em",
  },

  brandSubtitle: {
    fontSize: "18px",
    color: "#cbd5e1",
    lineHeight: "1.6",
    marginBottom: "48px",
  },

  featuresList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  featureIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#4ade80",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    flexShrink: 0,
  },

  featureText: {
    fontSize: "15px",
    color: "#e2e8f0",
  },

  decorativePattern: {
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "150%",
    height: "150%",
    background: `
      radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
    `,
    pointerEvents: "none",
  },

  /* ========== PANEL DERECHO ========== */
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#f8fafc",
  },

  formContainer: {
    width: "100%",
    maxWidth: "440px",
    background: "#ffffff",
    padding: "48px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
  },

  formHeader: {
    marginBottom: "40px",
  },

  formTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.01em",
  },

  formSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    marginBottom: "4px",
  },

  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  inputIcon: {
    position: "absolute",
    left: "16px",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    padding: "14px 16px 14px 48px",
    fontSize: "15px",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#0f172a",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },

  togglePassword: {
    position: "absolute",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "background 0.2s ease",
  },

  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 16px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
  },

  errorIcon: {
    color: "#dc2626",
    flexShrink: 0,
    marginTop: "1px",
  },

  errorText: {
    fontSize: "14px",
    color: "#dc2626",
    lineHeight: "1.5",
  },

  submitButton: {
    width: "100%",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    marginTop: "8px",
  },

  submitButtonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  buttonIcon: {
    transition: "transform 0.3s ease",
  },

  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  formFooter: {
    marginTop: "32px",
    textAlign: "center",
  },

  footerText: {
    fontSize: "13px",
    color: "#94a3b8",
    margin: 0,
  },
};

// Agregar la animación del spinner en un tag <style> global o CSS
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  input:focus {
    border-color: #2563eb !important;
    background: #ffffff !important;
  }

  button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3) !important;
  }

  button:hover svg {
    transform: translateX(2px);
  }

  button[type="button"]:hover {
    background: #f1f5f9 !important;
  }

  @media (max-width: 968px) {
    .leftPanel {
      display: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);