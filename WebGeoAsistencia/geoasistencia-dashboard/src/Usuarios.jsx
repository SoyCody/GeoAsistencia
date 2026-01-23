import { useState, useEffect } from "react";
import { userService } from "./api/userService.js";
import EditarUsuarioModal from "./components/EditarUsuarioModal";
import CrearUsuarioModal from "./components/CrearUsuarioModal";
import ActionDropdown from "./components/ActionDropdown";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // Estados para modal de edición
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // Estados para modal de creación
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);

  // Cargar usuarios según el filtro de estado
  useEffect(() => {
    cargarUsuarios();
  }, [filtroEstado]);

  const cargarUsuarios = async () => {
    setLoading(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      let data;
      if (filtroEstado === "TODOS") {
        // Cargar todos los usuarios (activos, suspendidos y eliminados)
        const [activos, suspendidos, eliminados] = await Promise.all([
          userService.getActiveUsers(),
          userService.getSuspendedUsers(),
          userService.getDeletedUsers()
        ]);
        // Combinar todos los usuarios
        const todosUsuarios = [
          ...(activos?.usuarios || []),
          ...(suspendidos?.usuarios || []),
          ...(eliminados?.usuarios || [])
        ];
        data = { usuarios: todosUsuarios };
      } else if (filtroEstado === "ACTIVO") {
        data = await userService.getActiveUsers();
      } else if (filtroEstado === "SUSPENDIDO") {
        data = await userService.getSuspendedUsers();
      } else if (filtroEstado === "BORRADO") {
        data = await userService.getDeletedUsers();
      }

      setUsuarios(data?.usuarios || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      mostrarMensaje("Error al cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
  };

  const handleAsignarAdmin = async (userId, userName) => {
    if (!window.confirm(`¿Asignar rol de Administrador a ${userName}?`)) return;

    setLoading(true);
    try {
      await userService.assignAdmin(userId);
      mostrarMensaje(`Rol de administrador asignado a ${userName}`, "success");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al asignar admin:", error);
      mostrarMensaje("Error al asignar rol de administrador", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRevocarAdmin = async (userId, userName) => {
    if (!window.confirm(`¿Revocar el rol de Administrador a ${userName}?`)) return;

    setLoading(true);
    try {
      await userService.revokeAdmin(userId);
      mostrarMensaje(`Rol de administrador revocado a ${userName}`, "success");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al revocar admin:", error);
      mostrarMensaje("Error al revocar rol de administrador", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspender = async (userId, userName) => {
    if (!window.confirm(`¿Suspender a ${userName}?`)) return;

    setLoading(true);
    try {
      await userService.suspendUser(userId);
      mostrarMensaje(`Usuario ${userName} suspendido`, "success");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al suspender usuario:", error);
      mostrarMensaje("Error al suspender el usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (userId, userName) => {
    if (!window.confirm(`¿Eliminar (borrado lógico) a ${userName}? Esta acción se puede revertir.`)) return;

    setLoading(true);
    try {
      await userService.deleteUser(userId);
      mostrarMensaje(`Usuario ${userName} eliminado`, "success");
      cargarUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      mostrarMensaje("Error al eliminar el usuario", "error");
    } finally {
      setLoading(false);
    }
  };

  // Manejar edición de usuario
  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarModalEditar(true);
  };

  const cerrarModalEditar = () => {
    setMostrarModalEditar(false);
    setUsuarioSeleccionado(null);
  };

  const handleUsuarioActualizado = () => {
    cargarUsuarios();
    mostrarMensaje("Usuario actualizado exitosamente", "success");
  };

  // Manejar creación de usuario
  const abrirModalCrear = () => {
    setMostrarModalCrear(true);
  };

  const cerrarModalCrear = () => {
    setMostrarModalCrear(false);
  };

  const handleUsuarioCreado = () => {
    cargarUsuarios();
    mostrarMensaje("Usuario creado exitosamente", "success");
  };



  return (
    <>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Gestión de Usuarios</h1>
        <button style={styles.createBtn} onClick={abrirModalCrear}>
          Crear Usuario
        </button>
      </div>

      {/* MENSAJE DE FEEDBACK */}
      {mensaje.texto && (
        <div style={mensaje.tipo === "success" ? styles.messageSuccess : styles.messageError}>
          {mensaje.texto}
        </div>
      )}

      {/* FILTROS POR ESTADO */}
      <div style={styles.filterContainer}>
        <button
          style={filtroEstado === "TODOS" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFiltroEstado("TODOS")}
        >
          Todos
        </button>
        <button
          style={filtroEstado === "ACTIVO" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFiltroEstado("ACTIVO")}
        >
          Activos
        </button>
        <button
          style={filtroEstado === "SUSPENDIDO" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFiltroEstado("SUSPENDIDO")}
        >
          Suspendidos
        </button>
        <button
          style={filtroEstado === "BORRADO" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFiltroEstado("BORRADO")}
        >
          Eliminados
        </button>
      </div>

      {/* TABLA */}
      <Section title={filtroEstado === "TODOS" ? "Todos los usuarios" : `Usuarios ${filtroEstado.toLowerCase()}s`}>
        {loading ? (
          <div style={styles.loading}>Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div style={styles.emptyState}>
            No hay usuarios en estado <strong>{filtroEstado.toLowerCase()}</strong>
          </div>
        ) : (
          <Table
            headers={["Código", "Nombre", "Email", "Rol", "Sede", "Acciones"]}
            usuarios={usuarios}
            onEditar={abrirModalEditar}
            onAsignarAdmin={handleAsignarAdmin}
            onRevocarAdmin={handleRevocarAdmin}
            onSuspender={handleSuspender}
            onEliminar={handleEliminar}
            filtroEstado={filtroEstado}
            loading={loading}
          />
        )}
      </Section>

      {/* MODAL DE EDICIÓN */}
      {mostrarModalEditar && usuarioSeleccionado && (
        <EditarUsuarioModal
          usuario={usuarioSeleccionado}
          onClose={cerrarModalEditar}
          onUsuarioActualizado={handleUsuarioActualizado}
        />
      )}

      {/* MODAL DE CREACIÓN */}
      {mostrarModalCrear && (
        <CrearUsuarioModal
          onClose={cerrarModalCrear}
          onUsuarioCreado={handleUsuarioCreado}
        />
      )}
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

function Table({ headers, usuarios, onEditar, onAsignarAdmin, onRevocarAdmin, onSuspender, onEliminar, filtroEstado, loading }) {
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
        {usuarios.map((usuario) => (
          <tr key={usuario.user_id}>
            <td style={styles.td}>{usuario.user_codigo || "N/A"}</td>
            <td style={styles.td}>{usuario.user_nombre_completo || "Sin nombre"}</td>
            <td style={styles.td}>{usuario.user_email || "Sin email"}</td>
            <td style={styles.td}>
              <span style={usuario.user_rol === "ADMIN" ? styles.badgeAdmin : styles.badgeUser}>
                {usuario.user_rol || "Usuario"}
              </span>
            </td>
            <td style={styles.td}>{usuario.sede_nombre || "Sin sede"}</td>
            <td style={styles.td}>
              <ActionDropdown
                items={[
                  {
                    label: "Editar",
                    onClick: () => onEditar(usuario),
                    color: "primary",
                  },
                  {
                    label: usuario.user_rol === "ADMIN" ? "Revocar Admin" : "Hacer Admin",
                    onClick: () => usuario.user_rol === "ADMIN"
                      ? onRevocarAdmin(usuario.user_id, usuario.user_nombre_completo)
                      : onAsignarAdmin(usuario.user_id, usuario.user_nombre_completo),
                    color: "secondary",
                  },
                  { divider: true },
                  ...(filtroEstado === "ACTIVO" ? [{
                    label: "Suspender",
                    onClick: () => onSuspender(usuario.user_id, usuario.user_nombre_completo),
                    color: "warning",
                  }] : []),
                  ...(filtroEstado !== "BORRADO" ? [{
                    label: "Eliminar",
                    onClick: () => onEliminar(usuario.user_id, usuario.user_nombre_completo),
                    color: "danger",
                  }] : []),
                ]}
                position="right"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ESTILOS */
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: 28,
    color: "#0f172a",
  },

  createBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid #c0c0c0ff",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "all 0.2s"
  },

  messageSuccess: {
    padding: "12px 20px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#d1fae5",
    color: "#065f46",
    border: "1px solid #6ee7b7",
    fontWeight: "500",
  },

  messageError: {
    padding: "12px 20px",
    marginBottom: "20px",
    borderRadius: "8px",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    fontWeight: "500",
  },

  filterContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
  },

  filterBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "all 0.2s",
  },

  filterBtnActive: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "600",
    transition: "all 0.2s",
  },

  section: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    marginBottom: "20px",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "600",
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
    fontWeight: "600",
    fontSize: 14,
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
    fontSize: 14,
  },

  badgeAdmin: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    background: "#dbeafe",
    color: "#1e40af",
    fontSize: 12,
    fontWeight: "600",
  },

  badgeUser: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "6px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },

  actionsContainer: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 13,
    fontWeight: "500",
  },

  linkEdit: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 13,
    fontWeight: "600",
  },

  linkWarning: {
    background: "none",
    border: "none",
    color: "#d97706",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 13,
    fontWeight: "500",
  },

  linkDanger: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 13,
    fontWeight: "500",
  },

  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 16,
  },

  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: 15,
  },
};
