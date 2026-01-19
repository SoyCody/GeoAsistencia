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
                                <div style={styles.infoLabel}>Coordenadas técnicas</div>
                                <div style={{ ...styles.infoSubtext, fontFamily: 'monospace' }}>
                                    Lat: {sede.latitud?.toFixed(6)}
                                </div>
                                <div style={{ ...styles.infoSubtext, fontFamily: 'monospace' }}>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },

    modal: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '85vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },

    header: {
        background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        color: '#fff',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
    },

    subtitle: {
        margin: '4px 0 0 0',
        fontSize: '14px',
        opacity: 0.9,
    },

    closeBtn: {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        color: '#fff',
        fontSize: '24px',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    mapContainer: {
        height: '500px',
        width: '100%',
    },

    info: {
        padding: '24px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
    },

    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },

    infoItem: {
        display: 'flex',
        gap: '12px',
    },

    icon: {
        fontSize: '20px',
        marginTop: '2px',
    },

    infoLabel: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '4px',
    },

    infoValue: {
        fontSize: '14px',
        color: '#1f2937',
        fontWeight: '500',
    },

    infoSubtext: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '2px',
    },

    footer: {
        padding: '16px 24px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
    },

    btnClose: {
        padding: '10px 24px',
        backgroundColor: '#0891b2',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
};
