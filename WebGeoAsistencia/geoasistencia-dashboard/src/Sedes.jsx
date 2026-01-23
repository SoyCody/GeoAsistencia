import { useEffect, useState } from "react";
import sedeService from "./api/sedeService.js";
import MapaSedeModal from './components/MapaSedeModal';
import ActionDropdown from './components/ActionDropdown';
import MapLocationPicker from './components/MapLocationPicker';

export default function Sedes() {
  // Estados
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // 'success' | 'error'
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sedeEditando, setSedeEditando] = useState(null);

  // Estados para modales
  const [mostrarModalMapa, setMostrarModalMapa] = useState(false);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    latitud: "",
    longitud: "",
  });

  /* =========================
     CARGAR SEDES AL MONTAR
  ========================= */
  useEffect(() => {
    cargarSedes();
  }, []);

  /* =========================
     MOSTRAR MENSAJE TEMPORAL
  ========================= */
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  /* =========================
     LISTAR SEDES
  ========================= */
  const cargarSedes = async () => {
    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });
      const response = await sedeService.listar();

      console.log('Respuesta de sedes:', response);

      // El backend devuelve { status: 'success', sedes: [...] }
      if (response && response.sedes && Array.isArray(response.sedes)) {
        setSedes(response.sedes);
      } else {
        setSedes([]);
        mostrarMensaje('La respuesta del servidor no tiene el formato esperado', 'error');
      }
    } catch (err) {
      console.error("Error al cargar sedes:", err);
      mostrarMensaje(err.response?.data?.message || "Error al cargar sedes", 'error');
      setSedes([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     MANEJAR CAMBIOS EN INPUTS
  ========================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     CREAR SEDE
  ========================= */
  const handleCrear = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });

      // Validar coordenadas
      const latitud = parseFloat(formData.latitud);
      const longitud = parseFloat(formData.longitud);

      if (isNaN(latitud) || isNaN(longitud)) {
        mostrarMensaje('Las coordenadas deben ser números válidos', 'error');
        setLoading(false);
        return;
      }

      if (latitud < -90 || latitud > 90) {
        mostrarMensaje('La latitud debe estar entre -90 y 90', 'error');
        setLoading(false);
        return;
      }

      if (longitud < -180 || longitud > 180) {
        mostrarMensaje('La longitud debe estar entre -180 y 180', 'error');
        setLoading(false);
        return;
      }

      const dataToSend = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        latitud: latitud,
        longitud: longitud,
      };

      const response = await sedeService.crear(dataToSend);
      console.log("Sede creada:", response);

      mostrarMensaje('✓ Sede creada exitosamente', 'success');

      // Limpiar formulario
      setFormData({
        nombre: "",
        direccion: "",
        latitud: "",
        longitud: "",
      });

      setMostrarFormulario(false);

      // Recargar lista
      cargarSedes();
    } catch (err) {
      console.error("Error al crear:", err);
      mostrarMensaje(err.response?.data?.message || "Error al crear sede", 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
   EDITAR SEDE
========================= */
  const handleEditar = async (sede) => {
    try {
      setLoading(true);

      console.log('Sede a editar:', sede);

      // Cargar datos completos de la sede
      const response = await sedeService.obtenerPorId(sede.id);
      console.log("Respuesta completa:", response);
      console.log("Sede obtenida:", response.sede);

      const sedeCompleta = response.sede;

      if (!sedeCompleta) {
        throw new Error("No se pudo obtener la sede");
      }

      setFormData({
        nombre: sedeCompleta.nombre || "",
        direccion: sedeCompleta.direccion || "",
        latitud: sedeCompleta.latitud || "",
        longitud: sedeCompleta.longitud || "",
      });

      setSedeEditando(sedeCompleta);
      setModoEdicion(true);
      setMostrarFormulario(true);
    } catch (err) {
      console.error("Error al editar:", err);
      mostrarMensaje('Error al cargar los datos de la sede', 'error');
    } finally {
      setLoading(false);
    }
  };
  /* =========================
     ACTUALIZAR SEDE
  ========================= */
  const handleActualizar = async (e) => {
    e.preventDefault();

    if (!sedeEditando) return;

    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });

      // Validar coordenadas
      const latitud = parseFloat(formData.latitud);
      const longitud = parseFloat(formData.longitud);

      if (isNaN(latitud) || isNaN(longitud)) {
        mostrarMensaje('Las coordenadas deben ser números válidos', 'error');
        setLoading(false);
        return;
      }

      if (latitud < -90 || latitud > 90) {
        mostrarMensaje('La latitud debe estar entre -90 y 90', 'error');
        setLoading(false);
        return;
      }

      if (longitud < -180 || longitud > 180) {
        mostrarMensaje('La longitud debe estar entre -180 y 180', 'error');
        setLoading(false);
        return;
      }

      const dataToSend = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        latitud: latitud,
        longitud: longitud,
      };

      const response = await sedeService.actualizar(sedeEditando.id, dataToSend);
      console.log("Sede actualizada:", response);

      mostrarMensaje('Sede actualizada exitosamente', 'success');
      cancelarEdicion();

      cargarSedes();
    } catch (err) {
      console.error("Error al actualizar:", err);
      mostrarMensaje(err.response?.data?.message || "Error al actualizar sede", 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ELIMINAR SEDE
  ========================= */
  const handleEliminar = async (id, nombreSede) => {
    if (!window.confirm(`¿Está seguro de eliminar la sede "${nombreSede}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });

      const response = await sedeService.eliminar(id);
      console.log("Sede eliminada:", response);

      mostrarMensaje('Sede eliminada exitosamente', 'success');

      // Recargar lista
      cargarSedes();
    } catch (err) {
      console.error("Error al eliminar:", err);
      mostrarMensaje(err.response?.data?.message || "Error al eliminar sede", 'error');
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CANCELAR EDICIÓN
  ========================= */
  const cancelarEdicion = () => {
    setFormData({
      nombre: "",
      direccion: "",
      latitud: "",
      longitud: "",
    });
    setModoEdicion(false);
    setSedeEditando(null);
    setMostrarFormulario(false);
  };

  /* =========================
     ABRIR FORMULARIO NUEVO
  ========================= */
  const abrirFormularioNuevo = () => {
    setFormData({
      nombre: "",
      direccion: "",
      latitud: "",
      longitud: "",
    });
    setModoEdicion(false);
    setSedeEditando(null);
    setMostrarFormulario(true);
  };

  /* =========================
     MODALES
  ========================= */
  const abrirModalMapa = (sede) => {
    setSedeSeleccionada(sede);
    setMostrarModalMapa(true);
  };

  const cerrarModalMapa = () => {
    setMostrarModalMapa(false);
    setSedeSeleccionada(null);
  };

  /* =========================
     URL DEL MAPA
  ========================= */
  const getMapUrl = () => {
    const lat = formData.latitud || -4.0;
    const lng = formData.longitud || -79.0;
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Sedes</h1>
          <p style={styles.subtitle}>
            Administre las sedes de su empresa
          </p>
        </div>

        <button
          style={styles.btnPrimary}
          onClick={abrirFormularioNuevo}
          disabled={loading}
        >
          Nueva Sede
        </button>
      </div>

      {/* MENSAJES DE FEEDBACK */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'success' ? styles.messageSuccess : styles.messageError}>
          {mensaje.texto}
        </div>
      )}

      {/* TABLA DE SEDES */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Listado de Sedes</h3>

        {loading && <p>Cargando ...</p>}

        {!loading && sedes.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No hay sedes registradas
            </p>
            <p style={styles.emptySubtext}>
              Cree una nueva sede para comenzar
            </p>
          </div>
        )}

        {!loading && sedes.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Dirección</th>
                  <th style={styles.th}>Geocercas</th>
                  <th style={styles.th}>Usuarios</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sedes.map((sede) => (
                  <tr key={sede.id}>
                    <td style={styles.td}>{sede.nombre || "N/A"}</td>
                    <td style={styles.td}>{sede.direccion || "N/A"}</td>

                    {/* Geocercas */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {sede.cantidad_geocercas || 0}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {sede.cantidad_geocercas === 1 ? 'zona' : 'zonas'}
                        </span>
                      </div>
                    </td>

                    {/* Usuarios */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {sede.total_usuarios || 0}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {sede.total_usuarios === 1 ? 'usuario' : 'usuarios'}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td style={styles.td}>
                      <ActionDropdown
                        items={[
                          {
                            label: "Ver Mapa",
                            onClick: () => abrirModalMapa(sede),
                            color: "info",
                          },
                          {
                            label: "Editar",
                            onClick: () => handleEditar(sede),
                            color: "primary",
                          },
                          { divider: true },
                          {
                            label: "Eliminar",
                            onClick: () => handleEliminar(sede.id, sede.nombre),
                            color: "danger",
                          },
                        ]}
                        position="right"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORMULARIO + MAPA */}
      {mostrarFormulario && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            {modoEdicion ? "Editar Sede" : "Crear Nueva Sede"}
          </h3>

          <form onSubmit={modoEdicion ? handleActualizar : handleCrear}>
            <div style={styles.formContainer}>
              {/* FORMULARIO */}
              <div style={styles.form}>
                <Input
                  name="nombre"
                  placeholder="Nombre de la sede *"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="direccion"
                  placeholder="Dirección *"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* MAPA LOCATION PICKER */}
              <div style={{ gridColumn: '1 / -1' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                  Ubicación de la Sede
                </h4>
                <MapLocationPicker
                  latitude={parseFloat(formData.latitud) || -4.38269}
                  longitude={parseFloat(formData.longitud) || -79.94549}
                  onChange={(lat, lng) => {
                    setFormData(prev => ({
                      ...prev,
                      latitud: lat.toString(),
                      longitud: lng.toString()
                    }));
                  }}
                  showRadiusCircle={false}
                />
              </div>
            </div>

            <div style={styles.actions}>
              <button
                type="submit"
                style={styles.btnPrimary}
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : modoEdicion
                    ? "Actualizar"
                    : "Guardar"}
              </button>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={cancelarEdicion}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODALES */}
      {mostrarModalMapa && sedeSeleccionada && (
        <MapaSedeModal
          sede={sedeSeleccionada}
          onClose={cerrarModalMapa}
        />
      )}
    </div>
  );
}

/* ===================== */
/* COMPONENTE INPUT */
/* ===================== */
function Input(props) {
  return <input {...props} style={{ ...styles.input, ...props.style }} />;
}

/* ===================== */
/* ESTILOS */
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

  section: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 14,
    marginBottom: 24,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    color: "#000f"
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

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },

  emptyText: {
    color: "#475569",
    fontSize: 16,
    margin: "0 0 8px 0",
  },

  emptySubtext: {
    color: "#94a3b8",
    fontSize: 14,
    margin: 0,
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
    whiteSpace: "nowrap",
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
    textDecoration: "underline",
  },

  linkDanger: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    textDecoration: "underline",
  },

  linkMap: {
    background: "none",
    border: "none",
    color: "#0891b2",
    cursor: "pointer",
    textDecoration: "underline",
    marginRight: 12,
  },

  formContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 20,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    width: "70%",
    background: "#ffffff",
    color: "#000f"
  },

  actions: {
    display: "flex",
    gap: 14,
  },

  map: {
    width: "100%",
    minHeight: 300,
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },

  btnPrimary: {
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

  btnSecondary: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
};