import { useState, useEffect, useRef } from 'react';

/**
 * MapLocationPicker - Componente para seleccionar ubicación mediante mapa interactivo
 * 
 * @param {number} latitude - Latitud inicial
 * @param {number} longitude - Longitud inicial
 * @param {function} onChange - Callback cuando cambia la ubicación: (lat, lng) => void
 * @param {number} radius - Radio en metros (para geocercas, opcional)
 * @param {boolean} showRadiusCircle - Mostrar círculo de radio (default: false)
 */
export default function MapLocationPicker({
    latitude = -4.38269,
    longitude = -79.94549,
    onChange,
    radius = 100,
    showRadiusCircle = false
}) {
    const [currentLat, setCurrentLat] = useState(latitude);
    const [currentLng, setCurrentLng] = useState(longitude);
    const [manualMode, setManualMode] = useState(false);
    const mapContainerRef = useRef(null);

    // Actualizar cuando cambien las props
    useEffect(() => {
        setCurrentLat(latitude);
        setCurrentLng(longitude);
    }, [latitude, longitude]);

    const handleMapClick = () => {
        // El mapa se maneja en el iframe con mensaje
        onChange && onChange(currentLat, currentLng);
    };

    const handleManualChange = (field, value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        if (field === 'lat') {
            setCurrentLat(numValue);
            onChange && onChange(numValue, currentLng);
        } else {
            setCurrentLng(numValue);
            onChange && onChange(currentLat, numValue);
        }
    };

    const useCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCurrentLat(lat);
                    setCurrentLng(lng);
                    onChange && onChange(lat, lng);
                },
                (error) => {
                    console.error('Error obteniendo ubicación:', error);
                    alert('No se pudo obtener la ubicación actual. Verifique los permisos del navegador.');
                }
            );
        } else {
            alert('Geolocalización no soportada por este navegador.');
        }
    };

    const createMapUrl = () => {
        const zoom = 15;

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
                    #map { width: 100%; height: 100vh; cursor: crosshair; }
                    .location-info {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        z-index: 1000;
                        max-width: 200px;
                    }
                    .coords {
                        font-family: monospace;
                        color: #2563eb;
                        margin-top: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="location-info">
                    <div><strong>Click para seleccionar</strong></div>
                    <div class="coords" id="coords">
                        Lat: ${currentLat.toFixed(6)}<br>
                        Lng: ${currentLng.toFixed(6)}
                    </div>
                </div>
                <div id="map"></div>
                <script>
                    let marker = null;
                    let circle = null;
                    
                    const map = L.map('map').setView([${currentLat}, ${currentLng}], ${zoom});
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors',
                        maxZoom: 19
                    }).addTo(map);
                    
                    // Marcador inicial
                    marker = L.marker([${currentLat}, ${currentLng}], {
                        draggable: true
                    }).addTo(map);
                    
                    ${showRadiusCircle ? `
                    // Círculo de radio
                    circle = L.circle([${currentLat}, ${currentLng}], {
                        color: '#2563eb',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.2,
                        radius: ${radius},
                        weight: 2
                    }).addTo(map);
                    ` : ''}
                    
                    // Actualizar coordenadas en UI
                    function updateCoords(lat, lng) {
                        document.getElementById('coords').innerHTML = 
                            'Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6);
                    }
                    
                    // Click en el mapa
                    map.on('click', function(e) {
                        const lat = e.latlng.lat;
                        const lng = e.latlng.lng;
                        
                        if (marker) {
                            marker.setLatLng([lat, lng]);
                        } else {
                            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                            setupMarkerDrag();
                        }
                        
                        ${showRadiusCircle ? `
                        if (circle) {
                            circle.setLatLng([lat, lng]);
                        }
                        ` : ''}
                        
                        updateCoords(lat, lng);
                        
                        // Enviar al componente padre
                        window.parent.postMessage({
                            type: 'locationSelected',
                            lat: lat,
                            lng: lng
                        }, '*');
                    });
                    
                    // Arrastrar marcador
                    function setupMarkerDrag() {
                        marker.on('dragend', function(e) {
                            const lat = e.target.getLatLng().lat;
                            const lng = e.target.getLatLng().lng;
                            
                            ${showRadiusCircle ? `
                            if (circle) {
                                circle.setLatLng([lat, lng]);
                            }
                            ` : ''}
                            
                            updateCoords(lat, lng);
                            
                            window.parent.postMessage({
                                type: 'locationSelected',
                                lat: lat,
                                lng: lng
                            }, '*');
                        });
                    }
                    
                    setupMarkerDrag();
                </script>
            </body>
            </html>
        `)}`;
    };

    // Escuchar mensajes del iframe
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'locationSelected') {
                setCurrentLat(event.data.lat);
                setCurrentLng(event.data.lng);
                onChange && onChange(event.data.lat, event.data.lng);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onChange]);

    return (
        <div style={styles.container}>
            {/* Controles superiores */}
            <div style={styles.controls}>
                <button
                    type="button"
                    onClick={useCurrentLocation}
                    style={styles.btnLocation}
                >
                    Usar mi ubicación
                </button>
                <button
                    type="button"
                    onClick={() => setManualMode(!manualMode)}
                    style={styles.btnToggle}
                >
                    {manualMode ? 'Modo Mapa' : 'Entrada Manual'}
                </button>
            </div>

            {/* Modo Manual */}
            {manualMode ? (
                <div style={styles.manualInputs}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Latitud:</label>
                        <input
                            type="number"
                            step="any"
                            value={currentLat}
                            onChange={(e) => handleManualChange('lat', e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Longitud:</label>
                        <input
                            type="number"
                            step="any"
                            value={currentLng}
                            onChange={(e) => handleManualChange('lng', e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>
            ) : (
                /* Mapa Interactivo */
                <div style={styles.mapContainer} ref={mapContainerRef}>
                    <iframe
                        title="Map Location Picker"
                        width="100%"
                        height="100%"
                        style={{ border: 0, borderRadius: '8px' }}
                        loading="lazy"
                        src={createMapUrl()}
                    />
                </div>
            )}

            {/* Info actual */}
            <div style={styles.currentLocation}>
                <strong>Ubicación seleccionada:</strong>
                <div style={styles.coordsDisplay}>
                    <span>Lat: {currentLat.toFixed(6)}</span>
                    <span>Lng: {currentLng.toFixed(6)}</span>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
    },

    controls: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
    },

    btnLocation: {
        padding: '8px 14px',
        backgroundColor: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    btnToggle: {
        padding: '8px 14px',
        backgroundColor: '#6b7280',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },

    mapContainer: {
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid #e5e7eb',
        backgroundColor: '#f9fafb',
    },

    manualInputs: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
    },

    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },

    label: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
    },

    input: {
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        backgroundColor: '#fff',
        color: '#000',
    },

    currentLocation: {
        padding: '12px 16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#1e40af',
    },

    coordsDisplay: {
        display: 'flex',
        gap: '16px',
        marginTop: '6px',
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: '12px',
        fontWeight: '600',
    },
};
