export default function MapaGeocercaModal({ geocerca, onClose }) {
    if (!geocerca) return null;

    const calcularZoom = (radio) => {
        if (radio <= 50) return 18;
        if (radio <= 100) return 17;
        if (radio <= 200) return 16;
        if (radio <= 500) return 15;
        if (radio <= 1000) return 14;
        return 13;
    };

    const calcularArea = (radio) => {
        const area = Math.PI * radio * radio;
        if (area > 10000) {
            return `${(area / 10000).toFixed(2)} hectáreas`;
        }
        return `${Math.round(area)} m²`;
    };

    const mapUrl = `https://www.google.com/maps?q=${geocerca.latitud},${geocerca.longitud}&z=${calcularZoom(geocerca.radio_metros)}&output=embed`;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>Geocerca: {geocerca.nombre_zona}</h3>
                        <p style={styles.subtitle}>{geocerca.sede_nombre}</p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Mapa */}
                <div style={styles.mapContainer}>
                    <iframe
                        title="Mapa Geocerca"
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
                                <div style={styles.infoValue}>{geocerca.nombre_zona}</div>
                                <div style={styles.infoSubtext}>{geocerca.sede_nombre}</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Radio de cobertura</div>
                                <div style={styles.infoValue}>{geocerca.radio_metros} metros</div>
                                <div style={styles.infoSubtext}>Área: {calcularArea(geocerca.radio_metros)}</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Usuarios asignados</div>
                                <div style={styles.infoValue}>{geocerca.usuarios_count || 0} usuarios</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Coordenadas técnicas</div>
                                <div style={{ ...styles.infoSubtext, fontFamily: 'monospace' }}>
                                    Lat: {geocerca.latitud?.toFixed(6)}
                                </div>
                                <div style={{ ...styles.infoSubtext, fontFamily: 'monospace' }}>
                                    Lng: {geocerca.longitud?.toFixed(6)}
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
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
        backgroundColor: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
};
