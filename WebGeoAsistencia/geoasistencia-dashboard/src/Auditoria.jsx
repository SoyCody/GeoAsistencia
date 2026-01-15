export default function Auditoria() {
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Auditoría del Sistema</h1>
          <p style={styles.subtitle}>
            Registro de acciones realizadas por administradores
          </p>
        </div>
      </div>

   

      {/* TABLA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Historial de Auditoría</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Admin ID</th>
              <th style={styles.th}>Tabla</th>
              <th style={styles.th}>Acción</th>
              <th style={styles.th}>Detalle del cambio</th>
              <th style={styles.th}>Fecha / Hora</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style={styles.td}>7259a661...</td>
              <td style={styles.td}>geocercas</td>
              <td style={styles.badgeUpdate}>UPDATE</td>
              <td style={styles.td}>
                
              </td>
              <td style={styles.td}>2026-01-06 10:32</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== */
/* ESTILOS EMPRESARIALES */
/* ===================== */

const styles = {
  container: {
    width: "100%",
  },

  header: {
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    margin: 0,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: 6,
    color: "#64748b",
  },

  card: {
    background: "#ffffff",
    padding: 24,
    borderRadius: 14,
    marginBottom: 24,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
  },

  filters: {
    display: "flex",
    gap: 16,
  },

  select: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    minWidth: 200,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: 12,
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    color: "#334155",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
    verticalAlign: "top",
  },

  badgeUpdate: {
    padding: "6px 10px",
    borderRadius: 8,
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: 600,
    display: "inline-block",
  },

  json: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    color: "#334155",
    maxWidth: 350,
    overflowX: "auto",
  },
};
