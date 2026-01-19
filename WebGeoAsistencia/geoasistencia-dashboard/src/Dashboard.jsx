import { useState, useEffect } from "react";
import { userService } from "./api/userService.js";
import sedeService from "./api/sedeService.js";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    sedesActivas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);

    try {
      // Cargar datos en paralelo
      const [totalUsuarios, usuariosActivos, sedesActivas] = await Promise.all([
        userService.total(),
        userService.totalActivos(),
        sedeService.total(),
      ]);

      setStats({
        totalUsuarios: totalUsuarios?.total || 0,
        usuariosActivos: usuariosActivos?.total || 0,
        sedesActivas: sedesActivas?.total || 0,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard General</h1>
        <span style={styles.subtitle}>
          Resumen del sistema de asistencia
        </span>
      </div>

      {/* KPI CARDS */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Cargando estadísticas...</p>
        </div>
      ) : (
        <div style={styles.cards}>
          <Card title="Usuarios Totales" value={stats.totalUsuarios} />
          <Card title="Usuarios Activos" value={stats.usuariosActivos} />
          <Card title="Sedes Activas" value={stats.sedesActivas} />
          <Card
            title="Tasa de Actividad"
            value={stats.totalUsuarios > 0
              ? `${Math.round((stats.usuariosActivos / stats.totalUsuarios) * 100)}%`
              : "0%"
            }
          />
        </div>
      )}

      {/* ACTIVIDAD RECIENTE */}
      <Section title="Resumen del Sistema">
        <div style={styles.summaryGrid}>
          <SummaryItem
            label="Total de usuarios registrados"
            value={stats.totalUsuarios}
            sublabel="En todo el sistema"
          />
          <SummaryItem
            label="Usuarios activos"
            value={stats.usuariosActivos}
            sublabel="Con acceso al sistema"
          />
          <SummaryItem
            label="Sedes operativas"
            value={stats.sedesActivas}
            sublabel="Con geocercas configuradas"
          />
        </div>
      </Section>
    </>
  );
}

/* COMPONENTES */

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function SummaryItem({ label, value, sublabel }) {
  return (
    <div style={styles.summaryItem}>
      <div style={styles.summaryValue}>{value}</div>
      <div style={styles.summaryLabel}>{label}</div>
      {sublabel && <div style={styles.summarySublabel}>{sublabel}</div>}
    </div>
  );
}

/* ESTILOS */

const styles = {
  header: {
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
  },

  subtitle: {
    color: "#64748b",
    fontSize: 15,
  },

  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
  },

  loadingText: {
    color: "#64748b",
    fontSize: 16,
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    margin: 0,
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },

  cardValue: {
    fontSize: "32px",
    fontWeight: "bold",
    marginTop: "12px",
    color: "#0f172a",
  },

  section: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginBottom: "20px",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "600",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },

  summaryItem: {
    padding: "20px",
    borderRadius: "8px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  summaryValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: "8px",
  },

  summaryLabel: {
    fontSize: "14px",
    color: "#334155",
    fontWeight: "500",
  },

  summarySublabel: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "4px",
  },
};
