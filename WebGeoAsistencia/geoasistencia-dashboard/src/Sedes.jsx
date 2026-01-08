export default function Sedes() {
  return (
    <>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de Sedes</h1>
        <button style={styles.btnPrimary}>➕ Nueva Sede</button>
      </div>

      {/* LISTADO */}
      <Section title="Listado de sedes">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre sede</th>
              <th style={styles.th}>Latitud</th>
              <th style={styles.th}>Longitud</th>
              <th style={styles.th}>Radio</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>Loja Matriz</td>
              <td style={styles.td}>-3.99313</td>
              <td style={styles.td}>-79.20422</td>
              <td style={styles.td}>100 m</td>
              <td style={styles.td}>
                <button style={styles.link}>Editar</button>
                <button style={styles.linkDanger}>Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* FORMULARIO */}
      <Section title="Crear nueva sede">
        <div style={styles.formContainer}>
          {/* FORM */}
          <div style={styles.form}>
            <input style={styles.input} placeholder="Nombre de la sede" />
            <input style={styles.input} placeholder="Latitud" defaultValue="-3.99313" />
            <input style={styles.input} placeholder="Longitud" defaultValue="-79.20422" />
            <input style={styles.input} placeholder="Radio (metros)" />

            <div style={styles.actions}>
              <button style={styles.btnPrimary}>Guardar</button>
              <button style={styles.btnSecondary}>Cancelar</button>
            </div>
          </div>

          {/* MAPA */}
          <div style={styles.map}>
            <iframe
              title="Mapa Loja"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: 8 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=-3.99313,-79.20422&z=14&output=embed"
            />
          </div>
        </div>
      </Section>
    </>
  );
}

/* ===================== */
/* COMPONENTE SECTION */
/* ===================== */

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

/* ===================== */
/* ESTILOS */
/* ===================== */

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "#e5e7eb",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginRight: 8,
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
    gap: 20,
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  map: {
    width: "100%",
    minHeight: 300,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
};
