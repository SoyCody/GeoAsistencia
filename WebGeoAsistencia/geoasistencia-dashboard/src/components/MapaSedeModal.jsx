export default function MapaSedeModal({ sede, onClose }) {
    if (!sede) return null;

    const calcularZoom = () => {
        // Para sede, zoom estándar
        return 15;
    };

    const mapUrl = `https://www.google.com/maps?q=${sede.latitud},${sede.longitud}&z=${calcularZoom()}&output=embed`;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>Sede: {sede.nombre}</h3>
                        <p style={styles.subtitle}>{sede.direccion}</p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Mapa */}
                <div style={styles.mapContainer}>
                    <iframe
                        title="Mapa Sede"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={mapUrl}
                    />
                </div>

                {/* Información */}
                <div style={styles.info}>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Ubicación</div>
                                <div style={styles.infoValue}>{sede.nombre}</div>
                                <div style={styles.infoSubtext}>{sede.direccion}</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Geocercas activas</div>
                                <div style={styles.infoValue}>
                                    {sede.cantidad_geocercas || 0} {sede.cantidad_geocercas === 1 ? 'zona' : 'zonas'}
                                </div>
                                <div style={styles.infoSubtext}>Zonas de control configuradas</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Usuarios asignados</div>
                                <div style={styles.infoValue}>
                                    {sede.total_usuarios || 0} usuarios
                                </div>
                                <div style={styles.infoSubtext}>En todas las geocercas</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Coordenadas</div>
                                <div style={{ ...styles.infoCoord }}>
                                    Lat: {sede.latitud?.toFixed(6)}
                                </div>
                                <div style={{ ...styles.infoCoord }}>
                                    Lng: {sede.longitud?.toFixed(6)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.btnClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },

    modal: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '92%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4)',
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 28px",
        borderBottom: "1px solid #e5e7eb",
        background: 'linear-gradient(135deg, #110a53 0%, #1e1b4b 100%)',
        color: '#ffffff',
    },

    title: {
        margin: 0,
        fontSize: '22px',
        fontWeight: '700',
        color: '#ffffff',
    },

    subtitle: {
        margin: '6px 0 0 0',
        fontSize: '14px',
        color: '#cbd5e1',
    },

    closeBtn: {
        background: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        fontSize: 20,
        cursor: "pointer",
        color: "#ffffff",
        padding: "8px 12px",
        borderRadius: "8px",
        transition: "all 0.2s ease",
        fontWeight: "600",
    },

    mapContainer: {
        height: '380px',
        width: '100%',
        backgroundColor: '#f3f4f6',
    },

    info: {
        padding: '36px 28px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        minHeight: '220px',
    },

    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '28px',
    },

    infoItem: {
        display: 'flex',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s ease',
    },

    infoLabel: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },

    infoValue: {
        fontSize: '18px',
        color: '#1f2937',
        fontWeight: '700',
        marginBottom: '4px',
    },

    infoSubtext: {
        fontSize: '13px',
        color: '#6b7280',
        marginTop: '4px',
        lineHeight: '1.4',
    },

    infoCoord: {
        fontSize: '13px',
        color: '#4b5563',
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        backgroundColor: '#f3f4f6',
        padding: '4px 8px',
        borderRadius: '6px',
        marginTop: '4px',
        display: 'inline-block',
    },

    footer: {
        padding: '20px 28px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: '#ffffff',
    },

    btnClose: {
        padding: '12px 28px',
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
    },
};

// Agregar estilos hover con JavaScript
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .modal button:hover {
            transform: translateY(-1px);
        }
        
        .modal .closeBtn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
        }
        
        .modal .btnClose:hover {
            background: #1d4ed8 !important;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
        }
        
        .modal .infoItem:hover {
            border-color: #cbd5e1;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
    `;
    document.head.appendChild(style);
}