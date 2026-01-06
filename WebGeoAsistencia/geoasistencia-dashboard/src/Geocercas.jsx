export default function Geocercas() {
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>   Gestión de Geocercas</h1>
          <p style={styles.subtitle}>
            Defina zonas de control por sede para validar asistencias
          </p>
        </div>

        <button style={styles.btnPrimary}>➕ Nueva Geocerca</button>
      </div>

      {/* TABLA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Listado de Geocercas</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Sede</th>
              <th style={styles.th}>Zona</th>
              <th style={styles.th}>Latitud</th>
              <th style={styles.th}>Longitud</th>
              <th style={styles.th}>Radio (m)</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Quito Norte</td>
              <td style={styles.td}>Macará</td>
              <td style={styles.td}>-4.38269</td>
              <td style={styles.td}>-79.94549</td>
              <td style={styles.td}>100</td>
              <td style={styles.td}>
                <button style={styles.link}>Editar</button>
                <button style={styles.linkDanger}>Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FORMULARIO */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Crear nueva geocerca</h3>

        <div style={styles.formGrid}>
          <Input placeholder="Nombre de la sede" />
          <Input placeholder="Nombre de la zona" />
          <Input placeholder="Latitud" />
          <Input placeholder="Longitud" />
          <Input placeholder="Radio en metros" />
        </div>

        <div style={styles.formActions}>
          <button style={styles.btnPrimary}>💾 Guardar</button>
          <button style={styles.btnSecondary}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTES */

function Input(props) {
  return <input {...props} style={styles.input} />;
}

/* ESTILOS EMPRESARIALES */

const styles = {
  container: {
    width: "100%",
    maxWidth: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "6px",
    color: "#64748b",
  },

  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "14px",
    marginBottom: "24px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    marginBottom: "16px",
    fontSize: "18px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb",
    color: "#334155",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
  },

  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginRight: "12px",
  },

  linkDanger: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },

  formActions: {
    display: "flex",
    gap: "14px",
    marginTop: "24px",
  },

  btnPrimary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  btnSecondary: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};
