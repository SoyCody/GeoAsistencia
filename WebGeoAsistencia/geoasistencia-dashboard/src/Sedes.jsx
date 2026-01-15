import { useEffect, useState } from "react";
import sedeService from "./api/sedeService.js";

export default function Sedes() {
  // Estados
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sedeEditando, setSedeEditando] = useState(null);

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
     LISTAR SEDES
  ========================= */
  const cargarSedes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await sedeService.listar();
      
      console.log('Respuesta de sedes:', response);
      
      // El backend devuelve { status: 'success', sedes: [...] }
      if (response && response.sedes && Array.isArray(response.sedes)) {
        setSedes(response.sedes);
      } else {
        setSedes([]);
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      console.error("Error al cargar sedes:", err);
      setError(err.response?.data?.message || "Error al cargar sedes");
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
      setError(null);

      const dataToSend = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
      };

      const response = await sedeService.crear(dataToSend);
      console.log("Sede creada:", response);

      alert("Sede creada exitosamente");

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
      setError(err.response?.data?.message || "Error al crear sede");
      alert(err.response?.data?.message || "Error al crear sede");
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

    console.log('Campos de la sede:', {
      nombre: sedeCompleta.nombre,
      nombre_sede: sedeCompleta.nombre_sede, // Por si tiene alias
      direccion: sedeCompleta.direccion,
      latitud: sedeCompleta.latitud,
      longitud: sedeCompleta.longitud
    });

    setFormData({
      nombre: sedeCompleta.nombre || sedeCompleta.nombre_sede || "",
      direccion: sedeCompleta.direccion || "",
      latitud: sedeCompleta.latitud || "",
      longitud: sedeCompleta.longitud || "",
    });

    setSedeEditando(sedeCompleta);
    setModoEdicion(true);
    setMostrarFormulario(true);
  } catch (err) {
    console.error("Error al editar:", err);
    setError(err.response?.data?.message || "Error al cargar sede");
    alert("Error al cargar los datos de la sede");
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
      setError(null);

      const dataToSend = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
      };

      const response = await sedeService.update(sedeEditando.id, dataToSend);
      console.log("Sede actualizada:", response);

      alert("Sede actualizada exitosamente");
      cancelarEdicion();

      cargarSedes();
    } catch (err) {
      console.error("Error al actualizar:", err);
      setError(err.response?.data?.message || "Error al actualizar sede");
      alert(err.response?.data?.message || "Error al actualizar sede");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ELIMINAR SEDE
  ========================= */
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar esta sede?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await sedeService.eliminar(id);
      console.log("Sede eliminada:", response);

      alert("Sede eliminada exitosamente");

      // Recargar lista
      cargarSedes();
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError(err.response?.data?.message || "Error al eliminar sede");
      alert(err.response?.data?.message || "Error al eliminar sede");
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

      {/* MENSAJES DE ERROR */}
      {error && (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => setError(null)} style={styles.closeError}>
            ✕
          </button>
        </div>
      )}

      {/* TABLA DE SEDES */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Listado de Sedes</h3>

        {loading && <p>Cargando sedes...</p>}

        {!loading && sedes.length === 0 && (
          <p style={styles.emptyText}>
            No hay sedes registradas. Cree una nueva sede.
          </p>
        )}

        {!loading && sedes.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Dirección</th>
                  <th style={styles.th}>Latitud</th>
                  <th style={styles.th}>Longitud</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sedes.map((sede) => (
                  <tr key={sede.id}>
                    <td style={styles.td} title={sede.id}>
                      {sede.id ? sede.id.substring(0, 8) + "..." : "N/A"}
                    </td>
                    <td style={styles.td}>{sede.nombre || "N/A"}</td>
                    <td style={styles.td}>{sede.direccion || "N/A"}</td>
                    <td style={styles.td}>{sede.latitud || "N/A"}</td>
                    <td style={styles.td}>{sede.longitud || "N/A"}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.link}
                        onClick={() => handleEditar(sede)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button
                        style={styles.linkDanger}
                        onClick={() => handleEliminar(sede.id)}
                        disabled={loading}
                      >
                        Eliminar
                      </button>
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
                <Input
                  name="latitud"
                  placeholder="Latitud *"
                  value={formData.latitud}
                  onChange={handleInputChange}
                  required
                  type="number"
                  step="any"
                />
                <Input
                  name="longitud"
                  placeholder="Longitud *"
                  value={formData.longitud}
                  onChange={handleInputChange}
                  required
                  type="number"
                  step="any"
                />
              </div>

              {/* MAPA */}
              <div style={styles.map}>
                <iframe
                  title="Mapa Sede"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: 8 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={getMapUrl()}
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
  },

  errorCard: {
    background: "#fee2e2",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    border: "1px solid #fecaca",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  errorText: {
    color: "#dc2626",
    margin: 0,
  },

  closeError: {
    background: "none",
    border: "none",
    color: "#dc2626",
    fontSize: 18,
    cursor: "pointer",
    fontWeight: "bold",
  },

  emptyText: {
    color: "#64748b",
    textAlign: "center",
    padding: "20px 0",
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
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14,
    width: "100%",
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
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
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