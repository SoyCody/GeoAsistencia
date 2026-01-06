export default function Dashboard() {
  return (
    <>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}> Dashboard General</h1>
        <span style={styles.subtitle}>
          Resumen del sistema de asistencia
        </span>
      </div>

      {/* KPI CARDS */}
      <div style={styles.cards}>
        <Card title="Usuarios Totales" value="256" />
        <Card title="Asistencias Hoy" value="143" />
        <Card title="Llegadas Tarde" value="12" />
        <Card title="Sedes Activas" value="6" />
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <Section title="Actividad Reciente">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Usuario</th>
              <th style={styles.th}>Sede</th>
              <th style={styles.th}>Hora</th>
              <th style={styles.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>DOC-001</td>
              <td style={styles.td}>Quito Norte</td>
              <td style={styles.td}>08:23</td>
              <td style={styles.ok}>A tiempo</td>
            </tr>
            <tr>
              <td style={styles.td}>DOC-014</td>
              <td style={styles.td}>Loja Matriz</td>
              <td style={styles.td}>08:41</td>
              <td style={styles.warn}>Tarde</td>
            </tr>
            <tr>
              <td style={styles.td}>DOC-256</td>
              <td style={styles.td}>Matriz</td>
              <td style={styles.td}>07:58</td>
              <td style={styles.ok}>A tiempo</td>
            </tr>
          </tbody>
        </table>
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

/* ESTILOS */

const styles = {
  header: {
    marginBottom: "24px",
  },

  title: {
    margin: 0,
  },

  subtitle: {
    color: "#64748b",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },

  cardTitle: {
    margin: 0,
    color: "#475569",
  },

  cardValue: {
    fontSize: "30px",
    fontWeight: "bold",
    marginTop: "10px",
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "14px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginBottom: "16px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },

  ok: {
    padding: "12px",
    color: "#16a34a",
    fontWeight: "bold",
  },

  warn: {
    padding: "12px",
    color: "#dc2626",
    fontWeight: "bold",
  },
};
