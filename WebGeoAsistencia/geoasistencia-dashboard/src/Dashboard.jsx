import { useState, useEffect } from "react";
import registroService from "./api/registroService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    dentro: 1,
    fuera: 8,
    aTiempo: 0,
    atrasados: 1
  });
  const [usuariosDentro, setUsuariosDentro] = useState([]);
  const [usuariosFuera, setUsuariosFuera] = useState([]);
  const [usuariosATiempo, setUsuariosATiempo] = useState([]);
  const [usuariosAtrasados, setUsuariosAtrasados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
    // Recargar cada 30 segundos
    const interval = setInterval(cargarEstadisticas, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const data = await registroService.getEstadisticasHoy();

      setStats(data.conteo);
      setUsuariosDentro(data.usuariosDentro || []);
      setUsuariosFuera(data.usuariosFuera || []);
      setUsuariosATiempo(data.usuariosATiempo || []);
      setUsuariosAtrasados(data.usuariosAtrasados || []);
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
        <h1 style={styles.title}>Panel de Control de Asistencia</h1>
        <span style={styles.subtitle}>
          Estadísticas en tiempo real del día actual
        </span>
      </div>

      {/* KPI CARDS */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          <div style={styles.cards}>
            <Card
              title="Usuarios Dentro"
              value={stats.dentro}
              color="#10b981"
              icon="🟢"
            />
            <Card
              title="Usuarios Fuera"
              value={stats.fuera}
              color="#ef4444"
              icon="🔴"
            />
            <Card
              title="Llegadas a Tiempo"
              value={stats.aTiempo}
              color="#3b82f6"
              icon="✅"
            />
            <Card
              title="Llegadas Tarde"
              value={stats.atrasados}
              color="#f59e0b"
              icon="⚠️"
            />
          </div>

          {/* LISTADOS */}
          <div style={styles.listsGrid}>
            {/* Usuarios Dentro */}
            <ListSection
              title="Usuarios Dentro de la Sede"
              data={usuariosDentro}
              emptyMessage="No hay usuarios dentro actualmente"
            />

            {/* Usuarios Fuera */}
            <ListSection
              title="Usuarios Fuera de la Sede"
              data={usuariosFuera}
              emptyMessage="Todos los usuarios están dentro"
              showSalida
            />

            {/* Usuarios a Tiempo */}
            <ListSection
              title="Llegadas a Tiempo"
              data={usuariosATiempo}
              emptyMessage="No hay registros aún"
              variant="success"
            />

            {/* Usuarios Atrasados */}
            <ListSection
              title="Llegadas Tarde"
              data={usuariosAtrasados}
              emptyMessage="No hay atrasos"
              variant="warning"
            />
          </div>
        </>
      )}
    </>
  );
}

/* COMPONENTES */

function Card({ title, value, color, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={{ ...styles.cardValue, color }}>{value}</p>
    </div>
  );
}

function ListSection({ title, data, emptyMessage, variant = "default", showSalida = false }) {
  const borderColor = variant === "success" ? "#10b981" :
    variant === "warning" ? "#f59e0b" :
      "#e2e8f0";

  return (
    <div style={{ ...styles.section, borderTop: `3px solid ${borderColor}` }}>
      <h3 style={styles.sectionTitle}>{title}</h3>

      {data.length === 0 ? (
        <p style={styles.emptyText}>{emptyMessage}</p>
      ) : (
        <div style={styles.list}>
          {data.map((usuario, index) => (
            <div key={index} style={styles.listItem}>
              <div style={styles.listItemMain}>
                <span style={styles.codigo}>{usuario.codigo_empleado}</span>
                <span style={styles.nombre}>{usuario.nombre_completo}</span>
              </div>
              <span style={styles.hora}>
                {showSalida ? usuario.hora_salida : usuario.hora_entrada}
              </span>
            </div>
          ))}
        </div>
      )}
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
    textAlign: "center",
  },

  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  cardTitle: {
    margin: 0,
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },

  cardValue: {
    fontSize: "32px",
    fontWeight: "bold",
    margin: 0,
  },

  listsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "600",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  listItemMain: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  codigo: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#2563eb",
  },

  nombre: {
    fontSize: "14px",
    color: "#334155",
  },

  hora: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0f172a",
    fontFamily: "monospace",
  },

  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "20px",
  },
};
