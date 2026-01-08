export default function Geocercas() {
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Geocercas</h1>
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
              <td style={styles.td}>Loja</td>
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

      {/* FORMULARIO + MAPA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Crear nueva geocerca</h3>

        <div style={styles.formContainer}>
          {/* FORM */}
          <div style={styles.formGrid}>
            <Input placeholder="Nombre de la sede" defaultValue="Loja" />
            <Input placeholder="Nombre de la zona" defaultValue="Macará" />
            <Input placeholder="Latitud" defaultValue="-4.38269" />
            <Input placeholder="Longitud" defaultValue="-79.94549" />
            <Input placeholder="Radio en metros" defaultValue="100" />
          </div>

          {/* MAPA */}
          <div style={styles.map}>
            <iframe
              title="Mapa Geocerca"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: 10 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=-4.38269,-79.94549&z=15&output=embed"
            />
          </div>
        </div>

        <div style={styles.formActions}>
          <button style={styles.btnPrimary}>💾 Guardar</button>
          <button style={styles.btnSecondary}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ===================== */
/* COMPONENTES */
/* ===================== */

function Input(props) {
  return <input {...props} style={styles.input} />;
}

/* ===================== */
/* ESTILOS EMPRESARIALES */
/* ===================== */

const styles = {
  container: {
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    margin: 0,
    fontSize: 28,
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
    marginBottom: 16,
    fontSize: 18,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "2px solid #e5e7eb",
    color: "#334155",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
  },

  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginRight: 12,
  },

  linkDanger: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
  },

  formContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },

  map: {
    width: "100%",
    minHeight: 280,
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
  },

  formActions: {
    display: "flex",
    gap: 14,
    marginTop: 24,
  },

  btnPrimary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer",
  },

  btnSecondary: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer",
  },
};
