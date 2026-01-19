import geocercaService from './api/geocercaService.js';
import sedeService from './api/sedeService.js';
import { useState, useEffect } from 'react';
import MapaGeocercaModal from './components/MapaGeocercaModal';
import UsuariosGeocercaModal from './components/UsuariosGeocercaModal';

export default function Geocercas() {
  const [geocercas, setGeocercas] = useState([]);
  const [geocercasFiltradas, setGeocercasFiltradas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [geocercaEditando, setGeocercaEditando] = useState(null);

  // Modales
  const [mostrarModalMapa, setMostrarModalMapa] = useState(false);
  const [mostrarModalUsuarios, setMostrarModalUsuarios] = useState(false);
  const [geocercaSeleccionada, setGeocercaSeleccionada] = useState(null);

  // Filtros
  const [filtroSede, setFiltroSede] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    sede_id: '',
    nombre_zona: '',
    latitud: '',
    longitud: '',
    radio_metros: ''
  });

  // Cargar geocercas y sedes al montar el componente
  useEffect(() => {
    cargarGeocercas();
    cargarSedes();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    aplicarFiltros();
  }, [geocercas, filtroSede]);

  // Mostrar mensaje temporal
  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  // Cargar TODAS las geocercas con nombre de sede
  const cargarGeocercas = async () => {
    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });
      const response = await geocercaService.getAllGeocercas();

      console.log('Respuesta del servidor:', response);

      if (response && response.geocercas && Array.isArray(response.geocercas)) {
        setGeocercas(response.geocercas);
      } else {
        setGeocercas([]);
        mostrarMensaje('La respuesta del servidor no tiene el formato esperado', 'error');
      }
    } catch (err) {
      console.error('Error:', err);
      mostrarMensaje(err.response?.data?.message || 'Error al cargar geocercas', 'error');
      setGeocercas([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar sedes para el filtro
  const cargarSedes = async () => {
    try {
      const response = await sedeService.listar();
      if (response && response.sedes && Array.isArray(response.sedes)) {
        setSedes(response.sedes);
      }
    } catch (err) {
      console.error('Error al cargar sedes:', err);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    let filtradas = [...geocercas];

    // Filtro por sede
    if (filtroSede) {
      filtradas = filtradas.filter(g => g.sede_id === filtroSede);
    }
    setGeocercasFiltradas(filtradas);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crear nueva geocerca
  const handleCrear = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });

      const dataToSend = {
        sede_id: formData.sede_id,
        nombre_zona: formData.nombre_zona,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        radio_metros: parseInt(formData.radio_metros)
      };

      const response = await geocercaService.crear(dataToSend);
      console.log('Geocerca creada:', response);

      mostrarMensaje('Geocerca creada exitosamente', 'success');

      setFormData({
        sede_id: '',
        nombre_zona: '',
        latitud: '',
        longitud: '',
        radio_metros: ''
      });

      setMostrarFormulario(false);
      cargarGeocercas();

    } catch (err) {
      console.error('Error al crear:', err);
      mostrarMensaje(err.response?.data?.message || 'Error al crear geocerca', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Editar geocerca
  const handleEditar = async (geocerca) => {
    try {
      setLoading(true);
      const response = await geocercaService.obtenerPorId(geocerca.id);
      console.log('Geocerca obtenida:', response);

      const geocercaCompleta = response.geocerca;

      if (!geocercaCompleta) {
        throw new Error('No se pudo obtener la geocerca');
      }

      setFormData({
        sede_id: geocercaCompleta.sede_id || '',
        nombre_zona: geocercaCompleta.nombre_zona || '',
        latitud: geocercaCompleta.latitud || '',
        longitud: geocercaCompleta.longitud || '',
        radio_metros: geocercaCompleta.radio_metros || ''
      });

      setGeocercaEditando(geocercaCompleta);
      setModoEdicion(true);
      setMostrarFormulario(true);

    } catch (err) {
      console.error('Error al editar:', err);
      mostrarMensaje('Error al cargar los datos de la geocerca', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar geocerca
  const handleActualizar = async (e) => {
    e.preventDefault();

    if (!geocercaEditando) return;

    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });

      const dataToSend = {
        nombre_zona: formData.nombre_zona,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        radio_metros: parseInt(formData.radio_metros)
      };

      const response = await geocercaService.actualizar(geocercaEditando.id, dataToSend);
      console.log('Geocerca actualizada:', response);

      mostrarMensaje('Geocerca actualizada exitosamente', 'success');

      cancelarEdicion();
      cargarGeocercas();

    } catch (err) {
      console.error('Error al actualizar:', err);
      mostrarMensaje(err.response?.data?.message || 'Error al actualizar geocerca', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar geocerca
  const handleEliminar = async (id, nombreZona) => {
    if (!window.confirm(`¿Está seguro de eliminar la geocerca "${nombreZona}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setLoading(true);
      setMensaje({ texto: '', tipo: '' });

      const response = await geocercaService.eliminar(id);
      console.log('Geocerca eliminada:', response);

      mostrarMensaje('Geocerca eliminada exitosamente', 'success');
      cargarGeocercas();

    } catch (err) {
      console.error('Error al eliminar:', err);
      mostrarMensaje(err.response?.data?.message || 'Error al eliminar geocerca', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edición
  const cancelarEdicion = () => {
    setFormData({
      sede_id: '',
      nombre_zona: '',
      latitud: '',
      longitud: '',
      radio_metros: ''
    });
    setModoEdicion(false);
    setGeocercaEditando(null);
    setMostrarFormulario(false);
  };

  // Abrir formulario para nueva geocerca
  const abrirFormularioNuevo = () => {
    setFormData({
      sede_id: '',
      nombre_zona: '',
      latitud: '',
      longitud: '',
      radio_metros: ''
    });
    setModoEdicion(false);
    setGeocercaEditando(null);
    setMostrarFormulario(true);
  };

  // URL del mapa
  const getMapUrl = () => {
    const lat = formData.latitud || -4.38269;
    const lng = formData.longitud || -79.94549;
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroSede('');
  };

  // Abrir modal de mapa
  const abrirModalMapa = (geocerca) => {
    setGeocercaSeleccionada(geocerca);
    setMostrarModalMapa(true);
  };

  // Abrir modal de usuarios
  const abrirModalUsuarios = (geocerca) => {
    setGeocercaSeleccionada(geocerca);
    setMostrarModalUsuarios(true);
  };

  // Cerrar modales
  const cerrarModalMapa = () => {
    setMostrarModalMapa(false);
    setGeocercaSeleccionada(null);
  };

  const cerrarModalUsuarios = () => {
    setMostrarModalUsuarios(false);
    setGeocercaSeleccionada(null);
  };

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

        <button
          style={styles.btnPrimary}
          onClick={abrirFormularioNuevo}
          disabled={loading}
        >
          Nueva Geocerca
        </button>
      </div>

      {/* MENSAJES DE FEEDBACK */}
      {mensaje.texto && (
        <div style={mensaje.tipo === 'success' ? styles.messageSuccess : styles.messageError}>
          {mensaje.texto}
        </div>
      )}

      {/* FILTROS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Filtros</h3>
        <div style={styles.filterContainer}>
          <div style={styles.filterGroup}>
            <label style={styles.label}>Filtrar por Sede:</label>
            <select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              style={styles.select}
            >
              <option value="">Todas las sedes</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          {filtroSede && (
            <button onClick={limpiarFiltros} style={styles.btnSecondary}>
              Limpiar Filtro
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>
          Listado de Geocercas
          {geocercasFiltradas.length > 0 &&
            ` (${geocercasFiltradas.length} 
          resultado${geocercasFiltradas.length !== 1 ? 's' : ''})`}
        </h3>

        {loading && <p>Cargando geocercas...</p>}

        {!loading && geocercas.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No hay geocercas registradas en el sistema
            </p>
            <p style={styles.emptySubtext}>
              Cree una nueva geocerca para comenzar
            </p>
          </div>
        )}

        {!loading && geocercas.length > 0 && geocercasFiltradas.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              No se encontraron geocercas con los filtros aplicados
            </p>
            <p style={styles.emptySubtext}>
              Intenta ajustar los filtros o limpiarlos
            </p>
          </div>
        )}

        {!loading && geocercasFiltradas.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sede</th>
                  <th style={styles.th}>Zona</th>
                  <th style={styles.th}>Usuarios</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {geocercasFiltradas.map((geocerca) => (
                  <tr key={geocerca.id}>
                    <td style={styles.td}>{geocerca.sede_nombre || 'N/A'}</td>

                    {/* Columna Zona con Radio */}
                    <td style={styles.td}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>
                          {geocerca.nombre_zona}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          Radio: {geocerca.radio_metros}m
                        </div>
                      </div>
                    </td>

                    {/* Columna Usuarios */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                          {geocerca.usuarios_count || 0}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {geocerca.usuarios_count === 1 ? 'usuario' : 'usuarios'}
                        </span>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          style={styles.linkMap}
                          onClick={() => abrirModalMapa(geocerca)}
                          disabled={loading}
                        >
                          Ver mapa
                        </button>
                        <button
                          style={styles.linkUsers}
                          onClick={() => abrirModalUsuarios(geocerca)}
                          disabled={loading}
                        >
                          Usuarios
                        </button>
                        <button
                          style={styles.link}
                          onClick={() => handleEditar(geocerca)}
                          disabled={loading}
                        >
                          Editar
                        </button>
                        <button
                          style={styles.linkDanger}
                          onClick={() => handleEliminar(geocerca.id, geocerca.nombre_zona)}
                          disabled={loading}
                        >
                          Eliminar
                        </button>
                      </div>
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
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {modoEdicion ? 'Editar Geocerca' : 'Crear Nueva Geocerca'}
          </h3>

          <form onSubmit={modoEdicion ? handleActualizar : handleCrear}>
            <div style={styles.formContainer}>
              {/* FORM */}
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Sede *</label>
                  <select
                    name="sede_id"
                    value={formData.sede_id}
                    onChange={handleInputChange}
                    required
                    disabled={modoEdicion}
                    style={styles.select}
                  >
                    <option value="">Seleccione una sede</option>
                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  name="nombre_zona"
                  placeholder="Nombre de la zona *"
                  value={formData.nombre_zona}
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
                <Input
                  name="radio_metros"
                  placeholder="Radio en metros *"
                  value={formData.radio_metros}
                  onChange={handleInputChange}
                  required
                  type="number"
                />
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
                  src={getMapUrl()}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="submit"
                style={styles.btnPrimary}
                disabled={loading}
              >
                {loading ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Guardar'}
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
      {mostrarModalMapa && geocercaSeleccionada && (
        <MapaGeocercaModal
          geocerca={geocercaSeleccionada}
          onClose={cerrarModalMapa}
        />
      )}

      {mostrarModalUsuarios && geocercaSeleccionada && (
        <UsuariosGeocercaModal
          geocerca={geocercaSeleccionada}
          onClose={cerrarModalUsuarios}
          onUsuariosActualizados={cargarGeocercas}
        />
      )}
    </div>
  );
}

/* ===================== */
/* COMPONENTES */
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
    color: "#0f172a",
    fontWeight: "600",
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
    gap: 16,
    alignItems: "end",
  },

  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },

  select: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#ffffff",
    color: "#1e293b",
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
    fontWeight: "600",
    fontSize: 14,
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

  linkUsers: {
    background: "none",
    border: "none",
    color: "#9333ea",
    cursor: "pointer",
    textDecoration: "underline",
    marginRight: 12,
  },

  formContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 18,
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    width: "100%",
    background: "#ffffff",
    color: "#000f"
  },

  map: {
    width: "100%",
    minHeight: 400,
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
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "12px 20px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
};