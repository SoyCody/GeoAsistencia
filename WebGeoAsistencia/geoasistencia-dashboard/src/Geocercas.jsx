import geocercaService from './api/geocercaService.js';
import { useState, useEffect } from 'react';

export default function Geocercas() {
  // Estados
  const [geocercas, setGeocercas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [geocercaEditando, setGeocercaEditando] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    sede_id: '',
    nombre_zona: '',
    latitud: '',
    longitud: '',
    radio_metros: ''
  });

  // Cargar geocercas al montar el componente
  useEffect(() => {
    // Por defecto cargaremos todas, pero idealmente deberías tener una sede seleccionada
    // cargarGeocercas('7259a661-6104-43f8-8144-3ca4b9f95c13'); // Ejemplo con UUID
  }, []);

  // Cargar geocercas por sede
  const cargarGeocercas = async (sedeId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await geocercaService.listarPorSede(sedeId);
      
      // Verificar que la respuesta tenga la estructura correcta
      console.log('Respuesta del servidor:', response);
      
      if (response && response.geocercas && Array.isArray(response.geocercas)) {
        setGeocercas(response.geocercas);
      } else {
        setGeocercas([]);
        setError('La respuesta del servidor no tiene el formato esperado');
      }
    } catch (err) {
      console.error('Error completo:', err);
      setError(err.response?.data?.message || 'Error al cargar geocercas');
      setGeocercas([]); 
    } finally {
      setLoading(false);
    }
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
      setError(null);

      const dataToSend = {
        sede_id: formData.sede_id,
        nombre_zona: formData.nombre_zona,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        radio_metros: parseInt(formData.radio_metros)
      };

      const response = await geocercaService.crear(dataToSend);
      console.log('Geocerca creada:', response);
      
      alert('Geocerca creada exitosamente');
      
      // Limpiar formulario
      setFormData({
        sede_id: '',
        nombre_zona: '',
        latitud: '',
        longitud: '',
        radio_metros: ''
      });
      
      setMostrarFormulario(false);
      
      // Recargar lista
      if (formData.sede_id) {
        cargarGeocercas(formData.sede_id);
      }
      
    } catch (err) {
      console.error('Error al crear:', err);
      setError(err.response?.data?.message || 'Error al crear geocerca');
      alert(err.response?.data?.message || 'Error al crear geocerca');
    } finally {
      setLoading(false);
    }
  };

  // Editar geocerca
  const handleEditar = async (geocerca) => {
    try {
      setLoading(true);
      // Cargar datos completos de la geocerca
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
      setError(err.response?.data?.message || 'Error al cargar geocerca');
      alert('Error al cargar los datos de la geocerca');
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
      setError(null);

      const dataToSend = {
        nombre_zona: formData.nombre_zona,
        latitud: parseFloat(formData.latitud),
        longitud: parseFloat(formData.longitud),
        radio_metros: parseInt(formData.radio_metros)
      };

      const response = await geocercaService.actualizar(geocercaEditando.id, dataToSend);
      console.log('Geocerca actualizada:', response);
      
      alert('Geocerca actualizada exitosamente');
      
      // Limpiar
      cancelarEdicion();
      
      // Recargar lista
      if (formData.sede_id) {
        cargarGeocercas(formData.sede_id);
      }
      
    } catch (err) {
      console.error('Error al actualizar:', err);
      setError(err.response?.data?.message || 'Error al actualizar geocerca');
      alert(err.response?.data?.message || 'Error al actualizar geocerca');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar geocerca
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta geocerca?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await geocercaService.eliminar(id);
      console.log('Geocerca eliminada:', response);
      
      alert('Geocerca eliminada exitosamente');
      
      // Recargar lista
      const sedeActual = geocercas[0]?.sede_id;
      if (sedeActual) {
        cargarGeocercas(sedeActual);
      } else {
        setGeocercas(prev => prev.filter(g => g.id !== id));
      }
      
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError(err.response?.data?.message || 'Error al eliminar geocerca');
      alert(err.response?.data?.message || 'Error al eliminar geocerca');
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

      {/* MENSAJES DE ERROR */}
      {error && (
        <div style={styles.errorCard}>
          <p style={styles.errorText}>{error}</p>
          <button 
            onClick={() => setError(null)}
            style={{...styles.link, marginTop: 8}}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* FILTRO POR SEDE */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Filtrar por Sede</h3>
        <div style={styles.filterContainer}>
          <Input
            name="filtro_sede"
            placeholder="UUID de la Sede (ej: 7259a661-6104-43f8-8144-3ca4b9f95c13)"
            type="text"
            style={{...styles.input, flex: 1}}
          />
          <button 
            style={styles.btnPrimary}
            onClick={(e) => {
              const sedeId = e.target.previousSibling.value.trim();
              if (sedeId) {
                console.log('Buscando geocercas para sede:', sedeId);
                cargarGeocercas(sedeId);
              } else {
                alert('Por favor ingrese un UUID de sede');
              }
            }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Listado de Geocercas</h3>

        {loading && <p>Cargando geocercas...</p>}

        {!loading && geocercas.length === 0 && (
          <p style={styles.emptyText}>
            No hay geocercas registradas. Utilice el filtro para buscar por sede.
          </p>
        )}

        {!loading && geocercas.length > 0 && (
          <div style={{overflowX: 'auto'}}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Sede ID</th>
                  <th style={styles.th}>Zona</th>
                  <th style={styles.th}>Latitud</th>
                  <th style={styles.th}>Longitud</th>
                  <th style={styles.th}>Radio (m)</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {geocercas.map((geocerca) => (
                  <tr key={geocerca.id}>
                    <td style={styles.td} title={geocerca.id}>
                      {/*Validar que id exista antes de usar substring */}
                      {geocerca.id ? geocerca.id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td style={styles.td} title={geocerca.sede_id}>
                      {geocerca.sede_id ? geocerca.sede_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td style={styles.td}>{geocerca.nombre_zona || 'N/A'}</td>
                    <td style={styles.td}>{geocerca.latitud || 'N/A'}</td>
                    <td style={styles.td}>{geocerca.longitud || 'N/A'}</td>
                    <td style={styles.td}>{geocerca.radio_metros || 'N/A'}</td>
                    <td style={styles.td}>
                      <button 
                        style={styles.link}
                        onClick={() => handleEditar(geocerca)}
                        disabled={loading}
                      >
                        Editar
                      </button>
                      <button 
                        style={styles.linkDanger}
                        onClick={() => handleEliminar(geocerca.id)}
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
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            {modoEdicion ? 'Editar Geocerca' : 'Crear Nueva Geocerca'}
          </h3>

          <form onSubmit={modoEdicion ? handleActualizar : handleCrear}>
            <div style={styles.formContainer}>
              {/* FORM */}
              <div style={styles.formGrid}>
                <Input
                  name="sede_id"
                  placeholder="UUID de la Sede *"
                  value={formData.sede_id}
                  onChange={handleInputChange}
                  required
                  type="text"
                  disabled={modoEdicion}
                />
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
    </div>
  );
}

/* ===================== */
/* COMPONENTES */
/* ===================== */

function Input(props) {
  return <input {...props} style={{...styles.input, ...props.style}} />;
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
  },

  errorCard: {
    background: "#fee2e2",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
    border: "1px solid #fecaca",
  },

  errorText: {
    color: "#dc2626",
    margin: 0,
  },

  emptyText: {
    color: "#64748b",
    textAlign: "center",
    padding: "20px 0",
  },

  filterContainer: {
    display: "flex",
    gap: 12,
    alignItems: "center",
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
    width: "100%",
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
    fontSize: 14,
    fontWeight: 500,
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