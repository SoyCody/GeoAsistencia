import React, { useState, useEffect } from "react";
import { auditoriaService } from "./api/auditoriaService";

export default function Auditoria() {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detalleVisible, setDetalleVisible] = useState(null);

  useEffect(() => {
    cargarAuditorias();
  }, []);

  const cargarAuditorias = async () => {
    try {
      setLoading(true);
      const response = await auditoriaService.getAuditorias();
      setAuditorias(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar auditorías:", err);
      setError("Error al cargar los registros de auditoría");
    } finally {
      setLoading(false);
    }
  };

  const toggleDetalle = (id) => {
    setDetalleVisible(detalleVisible === id ? null : id);
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAccionEstilo = (accion) => {
    const estilos = {
      CREATE: { bg: "#dcfce7", color: "#15803d", label: "CREAR" },
      UPDATE: { bg: "#e0f2fe", color: "#0369a1", label: "ACTUALIZAR" },
      DELETE: { bg: "#fee2e2", color: "#dc2626", label: "ELIMINAR" },
      STATUS_CHANGE: { bg: "#fef3c7", color: "#d97706", label: "CAMBIO ESTADO" },
      ROLE_CHANGE: { bg: "#e9d5ff", color: "#9333ea", label: "CAMBIO ROL" },
    };
    return estilos[accion] || { bg: "#f3f4f6", color: "#6b7280", label: accion };
  };

  const renderDetalleJSON = (detalle) => {
    if (!detalle) return <em style={{ color: "#94a3b8" }}>Sin detalles</em>;

    try {
      const detalleObj = typeof detalle === 'string' ? JSON.parse(detalle) : detalle;

      // Detectar tipo de acción basado en las claves
      const esCreacion = detalleObj.creado !== undefined;
      const esEliminacion = detalleObj.eliminado !== undefined;
      const esActualizacion = detalleObj.cambio !== undefined || (detalleObj.antes !== undefined && detalleObj.despues !== undefined);

      // Función auxiliar para formatear nombres de campos
      const formatearNombreCampo = (campo) => {
        return campo
          .replace(/_/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .replace(/^\w/, c => c.toUpperCase());
      };

      // Función auxiliar para formatear valores
      const formatearValor = (valor) => {
        if (valor === null || valor === undefined) return 'N/A';
        if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
        if (typeof valor === 'object') return JSON.stringify(valor, null, 2);
        return String(valor);
      };

      // CASO 1: CREACIÓN
      if (esCreacion) {
        const datos = detalleObj.creado;
        return (
          <div style={styles.interpretacionContainer}>
            <div style={styles.accionTitulo}>
              <span style={styles.iconoCrear}>✓</span>
              <strong>Se creó un nuevo registro</strong>
            </div>
            <div style={styles.datosLista}>
              {Object.entries(datos).map(([campo, valor]) => (
                <div key={campo} style={styles.datoItem}>
                  <span style={styles.campoLabel}>{formatearNombreCampo(campo)}:</span>
                  <span style={styles.valorTexto}>{formatearValor(valor)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // CASO 2: ELIMINACIÓN
      if (esEliminacion) {
        const datos = detalleObj.eliminado;
        return (
          <div style={styles.interpretacionContainer}>
            <div style={styles.accionTitulo}>
              <span style={styles.iconoEliminar}>✕</span>
              <strong>Se eliminó un registro</strong>
            </div>
            <div style={styles.alertaEliminacion}>
              Este registro fue eliminado permanentemente del sistema
            </div>
            <div style={styles.datosLista}>
              <div style={styles.subtitulo}>Datos del registro eliminado:</div>
              {Object.entries(datos).map(([campo, valor]) => (
                <div key={campo} style={styles.datoItem}>
                  <span style={styles.campoLabel}>{formatearNombreCampo(campo)}:</span>
                  <span style={styles.valorTexto}>{formatearValor(valor)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // CASO 3: ACTUALIZACIÓN
      if (esActualizacion) {
        let cambios = [];

        // Formato 1: {cambio: {antes: {...}, despues: {...}}}
        if (detalleObj.cambio) {
          const antes = detalleObj.cambio.antes || {};
          const despues = detalleObj.cambio.despues || {};

          // Obtener todos los campos únicos
          const campos = new Set([...Object.keys(antes), ...Object.keys(despues)]);

          campos.forEach(campo => {
            const valorAntes = antes[campo];
            const valorDespues = despues[campo];

            // Solo mostrar si realmente cambió
            if (JSON.stringify(valorAntes) !== JSON.stringify(valorDespues)) {
              cambios.push({ campo, antes: valorAntes, despues: valorDespues });
            }
          });
        }
        // Formato 2: {antes: {...}, despues: {...}}
        else if (detalleObj.antes && detalleObj.despues) {
          const campos = new Set([...Object.keys(detalleObj.antes), ...Object.keys(detalleObj.despues)]);

          campos.forEach(campo => {
            const valorAntes = detalleObj.antes[campo];
            const valorDespues = detalleObj.despues[campo];

            if (JSON.stringify(valorAntes) !== JSON.stringify(valorDespues)) {
              cambios.push({ campo, antes: valorAntes, despues: valorDespues });
            }
          });
        }

        // Información adicional (ej: codigoEmpleado)
        const infoAdicional = Object.keys(detalleObj)
          .filter(k => k !== 'cambio' && k !== 'antes' && k !== 'despues')
          .reduce((acc, k) => ({ ...acc, [k]: detalleObj[k] }), {});

        return (
          <div style={styles.interpretacionContainer}>
            <div style={styles.accionTitulo}>
              <span style={styles.iconoActualizar}>⟳</span>
              <strong>Se modificó un registro</strong>
            </div>

            {Object.keys(infoAdicional).length > 0 && (
              <div style={styles.infoContexto}>
                {Object.entries(infoAdicional).map(([k, v]) => (
                  <span key={k}>
                    {formatearNombreCampo(k)}: <strong>{formatearValor(v)}</strong>
                  </span>
                ))}
              </div>
            )}

            {cambios.length > 0 ? (
              <div style={styles.cambiosLista}>
                <div style={styles.subtitulo}>Cambios realizados:</div>
                {cambios.map(({ campo, antes, despues }, idx) => (
                  <div key={idx} style={styles.cambioItem}>
                    <div style={styles.campoModificado}>{formatearNombreCampo(campo)}</div>
                    <div style={styles.comparacion}>
                      <div style={styles.valorAntes}>
                        <span style={styles.etiquetaAntes}>Antes:</span>
                        <span>{formatearValor(antes)}</span>
                      </div>
                      <div style={styles.flecha}>→</div>
                      <div style={styles.valorDespues}>
                        <span style={styles.etiquetaDespues}>Después:</span>
                        <span>{formatearValor(despues)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.sinCambios}>No se detectaron cambios en los campos registrados</div>
            )}
          </div>
        );
      }

      // FALLBACK: Si no se puede determinar el tipo
      return (
        <div style={styles.interpretacionContainer}>
          <div style={styles.accionTitulo}>
            <strong>Información del cambio</strong>
          </div>
          <div style={styles.datosLista}>
            {Object.entries(detalleObj).map(([campo, valor]) => (
              <div key={campo} style={styles.datoItem}>
                <span style={styles.campoLabel}>{formatearNombreCampo(campo)}:</span>
                <span style={styles.valorTexto}>{formatearValor(valor)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      return (
        <div style={styles.errorInterpretacion}>
          <strong>Error al interpretar los detalles</strong>
          <pre style={styles.errorDetalle}>{String(detalle)}</pre>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Cargando registros de auditoría...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>❌ {error}</p>
          <button onClick={cargarAuditorias} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Auditoría del Sistema</h1>
          <p style={styles.subtitle}>
            Registro de {auditorias.length} acciones realizadas por administradores
          </p>
        </div>
        <button onClick={cargarAuditorias} style={styles.refreshButton}>
          Actualizar
        </button>
      </div>

      {/* TABLA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Historial de Auditoría</h3>

        {auditorias.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No hay registros de auditoría disponibles</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Código Admin</th>
                  <th style={styles.th}>Tabla</th>
                  <th style={styles.th}>Acción</th>
                  <th style={styles.th}>Fecha / Hora</th>
                  <th style={styles.th}>Detalles</th>
                </tr>
              </thead>

              <tbody>
                {auditorias.map((auditoria) => {
                  const accionStyle = getAccionEstilo(auditoria.accion);
                  const isExpanded = detalleVisible === auditoria.id;

                  return (
                    <React.Fragment key={auditoria.id}>
                      <tr>
                        <td style={styles.td}>
                          <code style={styles.code}>{auditoria.codigo_empleado}</code>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.tableName}>{auditoria.tabla_afectada}</span>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.badge,
                              background: accionStyle.bg,
                              color: accionStyle.color,
                            }}
                          >
                            {accionStyle.label}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {formatearFecha(auditoria.fecha_hora)}
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => toggleDetalle(auditoria.id)}
                            style={styles.detalleButton}
                          >
                            {isExpanded ? "Ocultar" : "Ver Detalles"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" style={styles.detalleCell}>
                            <div style={styles.detalleContainer}>
                              <h4 style={styles.detalleTitle}>Detalle del Cambio</h4>
                              {renderDetalleJSON(auditoria.detalle_cambio)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== */
/* ESTILOS */
/* ===================== */

const styles = {
  container: {
    width: "100%",
  },

  header: {
    marginBottom: 30,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    margin: 0,
    color: "#0f172a",
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 14,
  },

  refreshButton: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#475569",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "500",
    transition: "all 0.2s",
  },

  card: {
    background: "#ffffff",
    padding: 24,
    borderRadius: 14,
    marginBottom: 24,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: "#1e293b",
    fontWeight: "600",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: 12,
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
    color: "#334155",
    fontWeight: "600",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    color: "#475569",
    verticalAlign: "middle",
    fontSize: 14,
  },

  code: {
    background: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "monospace",
    color: "#334155",
  },

  tableName: {
    background: "#f8fafc",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: "500",
    color: "#0f172a",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 8,
    fontWeight: 600,
    display: "inline-block",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  detalleButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    color: "#475569",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: "500",
    transition: "all 0.2s",
  },

  detalleCell: {
    background: "#f8fafc",
    padding: 0,
    borderBottom: "1px solid #e5e7eb",
  },

  detalleContainer: {
    padding: 20,
  },

  detalleTitle: {
    margin: "0 0 16px 0",
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
  },

  // Nuevos estilos para interpretación
  interpretacionContainer: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },

  accionTitulo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "2px solid #f1f5f9",
    fontSize: 15,
    color: "#1e293b",
  },

  iconoCrear: {
    fontSize: 20,
    color: "#15803d",
    background: "#dcfce7",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontWeight: "bold",
  },

  iconoActualizar: {
    fontSize: 20,
    color: "#0369a1",
    background: "#e0f2fe",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontWeight: "bold",
  },

  iconoEliminar: {
    fontSize: 20,
    color: "#dc2626",
    background: "#fee2e2",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    fontWeight: "bold",
  },

  datosLista: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  datoItem: {
    display: "flex",
    gap: 8,
    padding: "8px 12px",
    background: "#f8fafc",
    borderRadius: 6,
    fontSize: 13,
  },

  campoLabel: {
    fontWeight: "600",
    color: "#475569",
    minWidth: 140,
  },

  valorTexto: {
    color: "#1e293b",
    flex: 1,
  },

  alertaEliminacion: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "500",
  },

  subtitulo: {
    fontWeight: "600",
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },

  infoContexto: {
    background: "#f1f5f9",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
    color: "#475569",
  },

  cambiosLista: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  cambioItem: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },

  campoModificado: {
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    fontSize: 14,
  },

  comparacion: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  valorAntes: {
    flex: 1,
    minWidth: 150,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#1e293b",
  },

  etiquetaAntes: {
    fontSize: 11,
    fontWeight: "600",
    color: "#dc2626",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  valorDespues: {
    flex: 1,
    minWidth: 150,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    color: "#1e293b",
  },

  etiquetaDespues: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803d",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  flecha: {
    fontSize: 18,
    color: "#94a3b8",
    fontWeight: "bold",
  },

  sinCambios: {
    textAlign: "center",
    padding: 16,
    color: "#94a3b8",
    fontSize: 13,
    fontStyle: "italic",
  },

  errorInterpretacion: {
    background: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #fee2e2",
    color: "#991b1b",
  },

  errorDetalle: {
    marginTop: 8,
    fontSize: 11,
    color: "#7f1d1d",
    background: "#fff",
    padding: 8,
    borderRadius: 4,
    overflow: "auto",
  },

  loading: {
    textAlign: "center",
    padding: 60,
    color: "#64748b",
  },

  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },

  error: {
    textAlign: "center",
    padding: 40,
    background: "#fee2e2",
    borderRadius: 12,
    color: "#991b1b",
  },

  retryButton: {
    marginTop: 16,
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
  },

  emptyState: {
    textAlign: "center",
    padding: 40,
    color: "#94a3b8",
    fontSize: 14,
  },
};
