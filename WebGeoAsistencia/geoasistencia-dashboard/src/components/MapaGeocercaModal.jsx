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

    // URL con círculo de radio en lugar de solo pin
    const createMapUrlWithCircle = () => {
        const center = `${geocerca.latitud},${geocerca.longitud}`;
        const zoom = calcularZoom(geocerca.radio_metros);

        // Google Maps con API de Static Maps (simulado con parámetros)
        // Como no podemos usar la API directamente, usamos OpenStreetMap con Leaflet embebido
        return `data:text/html;charset=utf-8,${encodeURIComponent(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                <style>
                    body { margin: 0; padding: 0; }
                    #map { width: 100%; height: 100vh; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    const map = L.map('map').setView([${geocerca.latitud}, ${geocerca.longitud}], ${zoom});
                    
                    // Capa de mapa (OpenStreetMap)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 19
                    }).addTo(map);
                    
                    // Círculo de la geocerca
                    const circle = L.circle([${geocerca.latitud}, ${geocerca.longitud}], {
                        color: '#2563eb',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.2,
                        radius: ${geocerca.radio_metros},
                        weight: 2
                    }).addTo(map);
                    
                    // Marcador central
                    const marker = L.marker([${geocerca.latitud}, ${geocerca.longitud}]).addTo(map);
                    marker.bindPopup('<b>${geocerca.nombre_zona}</b><br>${geocerca.sede_nombre}<br>Radio: ${geocerca.radio_metros}m').openPopup();
                    
                    // Ajustar vista para incluir todo el círculo
                    map.fitBounds(circle.getBounds(), { padding: [50, 50] });
                </script>
            </body>
            </html>
        `)}`;
    };

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

                {/* Mapa con círculo */}
                <div style={styles.mapContainer}>
                    <iframe
                        title="Mapa Geocerca"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        src={createMapUrlWithCircle()}
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
                                <div style={styles.infoValue}>
                                    {geocerca.usuarios_count || 0} usuarios
                                </div>
                                <div style={styles.infoSubtext}>Personal activo en esta zona</div>
                            </div>
                        </div>

                        <div style={styles.infoItem}>
                            <div>
                                <div style={styles.infoLabel}>Coordenadas</div>
                                <div style={styles.infoCoord}>
                                    Lat: {geocerca.latitud?.toFixed(6)}
                                </div>
                                <div style={styles.infoCoord}>
                                    Lng: {geocerca.longitud?.toFixed(6)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional del radio */}
                    <div style={styles.radioBanner}>
                        <div style={styles.radioBannerIcon}>🔵</div>
                        <div>
                            <div style={styles.radioBannerText}>
                                El área azul representa la zona de cobertura de {geocerca.radio_metros}m de radio
                            </div>
                            <div style={styles.radioBannerSubtext}>
                                Los empleados deben estar dentro de esta zona para registrar asistencia
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
        color: '#e0e7ff',
    },

    closeBtn: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#fff',
        fontSize: '20px',
        padding: '8px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontWeight: '600',
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
        marginBottom: '24px',
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

    radioBanner: {
        display: 'flex',
        gap: '16px',
        padding: '18px 20px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        alignItems: 'flex-start',
    },

    radioBannerIcon: {
        fontSize: '24px',
        flexShrink: 0,
    },

    radioBannerText: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1e40af',
        marginBottom: '4px',
    },

    radioBannerSubtext: {
        fontSize: '13px',
        color: '#3b82f6',
        lineHeight: '1.4',
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

// Agregar estilos hover
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