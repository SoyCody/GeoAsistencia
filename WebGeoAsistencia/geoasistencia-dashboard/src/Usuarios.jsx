export default function Usuarios() {
  return (
    <>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}> Gestión de Usuarios</h1>
        <button style={styles.btnPrimary}>➕ Crear Usuario</button>
      </div>

      {/* TABLA */}
      <Section title="Listado de usuarios">
        <Table
          headers={["ID Usuario", "Rol", "Sede", "Última Marca", "Acciones"]}
          rows={[
            ["DOC-001", "Empleado", "Quito Norte", "08:23"],
            ["DOC-014", "Empleado", "Loja Matriz", "Sin marcar"],
            ["DOC-013", "Empleado", "Quito Sur", "08:21"],
            ["DOC-256", "Admin", "Matriz", "11:41"],
          ]}
        />
      </Section>

      {/* FORMULARIO */}
      <Section title="Crear Usuario">
        <div style={styles.formGrid}>
          <Input placeholder="Email" />
          <Input placeholder="Nombre Completo" />
          <Input placeholder="Rol" />
          <Input placeholder="Sede Asignada" />
        </div>

        <div style={styles.formActions}>
          <button style={styles.btnPrimary}>💾 Guardar</button>
          <button style={styles.btnSecondary}>Cancelar</button>
        </div>
      </Section>
    </>
  );
}

/* COMPONENTES AUXILIARES */

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} style={styles.th}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} style={styles.td}>
                {cell}
              </td>
            ))}
            <td style={styles.td}>
              <button style={styles.iconBtn}>✏️</button>
              <button style={styles.iconBtn}>📍</button>
              <button style={styles.iconBtnDanger}>🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Input(props) {
  return <input {...props} style={styles.input} />;
}

/* ESTILOS */
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
  },

  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
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

  iconBtn: {
    marginRight: "6px",
    padding: "6px",
  },

  iconBtnDanger: {
    padding: "6px",
    background: "#fee2e2",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
  },

  formActions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },

  btnPrimary: {
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
  },

  btnSecondary: {
    background: "#e5e7eb",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
  },
};
