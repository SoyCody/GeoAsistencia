import { useState, useEffect } from 'react';
import asignacionService from '../api/asignacionService';

export default function UsuariosGeocercaModal({ geocerca, onClose, onUsuariosActualizados }) {
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarAgregar, setMostrarAgregar] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    useEffect(() => {
        if (geocerca) {
            cargarUsuarios();
        }
    }, [geocerca]);

    useEffect(() => {
        if (mostrarAgregar && geocerca) {
            cargarUsuariosDisponibles();
        }
    }, [mostrarAgregar, geocerca]);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            console.log('🔍 Cargando usuarios para geocerca:', geocerca.id);
            const response = await asignacionService.getUsuariosGeocerca(geocerca.id);
            console.log('✅ Respuesta recibida:', response);
            console.log('Usuarios:', response.usuarios);
            setUsuarios(response.usuarios || []);
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            console.error('Error response:', error.response?.data);
            mostrarMensajeTemporal('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarUsuariosDisponibles = async () => {
        try {
            setLoading(true);
            const response = await asignacionService.getUsuariosDisponibles(geocerca.id, geocerca.sede_id);
            setUsuariosDisponibles(response.usuarios || []);
        } catch (error) {
            console.error('Error al cargar usuarios disponibles:', error);
            mostrarMensajeTemporal('Error al cargar usuarios disponibles', 'error');
        } finally {
            setLoading(false);
        }
    };

    const agregarUsuario = async (userId) => {
        try {
            setLoading(true);
            // Por defecto usamos horario 08:00-17:00
            await asignacionService.asignarUsuario(userId, geocerca.id, '08:00', '17:00');
            mostrarMensajeTemporal('Usuario asignado exitosamente', 'success');
            cargarUsuarios();
            cargarUsuariosDisponibles();
            if (onUsuariosActualizados) onUsuariosActualizados();
        } catch (error) {
            console.error('Error al asignar usuario:', error);
            mostrarMensajeTemporal(error.response?.data?.message || 'Error al asignar usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const removerUsuario = async (userId) => {
        if (!window.confirm('¿Está seguro de remover este usuario de la geocerca?')) return;

        try {
            setLoading(true);
            await asignacionService.removerUsuario(userId, geocerca.id);
            mostrarMensajeTemporal('Usuario removido exitosamente', 'success');
            cargarUsuarios();
            cargarUsuariosDisponibles();
            if (onUsuariosActualizados) onUsuariosActualizados();
        } catch (error) {
            console.error('Error al remover usuario:', error);
            mostrarMensajeTemporal('Error al remover usuario', 'error');
        } finally {
            setLoading(false);
        }
    };

    const mostrarMensajeTemporal = (texto, tipo) => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES');
    };

    const usuariosFiltrados = usuarios.filter(u =>
        u.user_nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.user_email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const disponiblesFiltrados = usuariosDisponibles.filter(u =>
        u.user_nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.user_email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    if (!geocerca) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>Usuarios asignados a: {geocerca.nombre_zona}</h3>
                        <p style={styles.subtitle}>Gestiona qué usuarios pueden registrar asistencia en esta geocerca</p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Mensaje */}
                {mensaje.texto && (
                    <div style={mensaje.tipo === 'success' ? styles.messageSuccess : styles.messageError}>
                        {mensaje.texto}
                    </div>
                )}

                {/* Barra de búsqueda */}
                <div style={styles.searchBar}>
                    <div style={styles.searchContainer}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <button
                        onClick={() => setMostrarAgregar(!mostrarAgregar)}
                        style={styles.btnAgregar}
                    >
                        {mostrarAgregar ? '← Volver' : '+ Agregar'}
                    </button>
                </div>

                {/* Lista de usuarios asignados */}
                {!mostrarAgregar && (
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <h4 style={styles.sectionTitle}>
                                Usuarios Asignados ({usuariosFiltrados.length})
                            </h4>
                        </div>

                        <div style={styles.listContainer}>
                            {loading && <div style={styles.loading}>Cargando...</div>}

                            {!loading && usuariosFiltrados.length === 0 && (
                                <div style={styles.emptyState}>
                                    <span style={{ fontSize: '48px' }}>👥</span>
                                    <p>No hay usuarios asignados a esta geocerca</p>
                                </div>
                            )}

                            {!loading && usuariosFiltrados.map((usuario) => (
                                <div key={usuario.user_id} style={styles.userCard}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.avatar}>
                                            {usuario.user_nombre_completo?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div style={styles.userName}>
                                                {usuario.user_nombre_completo}
                                            </div>
                                            <div style={styles.userEmail}>
                                                {usuario.user_email}
                                            </div>
                                            <div style={styles.userMeta}>
                                                Asignado: {formatearFecha(usuario.fecha_asignacion)}
                                                {usuario.hora_entrada && usuario.hora_salida && (
                                                    <span> • Horario: {usuario.hora_entrada} - {usuario.hora_salida}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removerUsuario(usuario.user_id)}
                                        style={styles.btnRemover}
                                        disabled={loading}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de usuarios disponibles */}
                {mostrarAgregar && (
                    <div style={styles.section}>
                        <h4 style={styles.sectionTitle}>
                            Usuarios Disponibles ({disponiblesFiltrados.length})
                        </h4>

                        <div style={styles.listContainer}>
                            {loading && <div style={styles.loading}>Cargando...</div>}

                            {!loading && disponiblesFiltrados.length === 0 && (
                                <div style={styles.emptyState}>
                                    <span style={{ fontSize: '48px' }}>📋</span>
                                    <p>No hay usuarios disponibles para asignar</p>
                                </div>
                            )}

                            {!loading && disponiblesFiltrados.map((usuario) => (
                                <div key={usuario.user_id} style={styles.userCardDisponible}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.avatarDisponible}>
                                            {usuario.user_nombre_completo?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div style={styles.userName}>
                                                {usuario.user_nombre_completo}
                                            </div>
                                            <div style={styles.userEmail}>
                                                {usuario.user_email}
                                            </div>
                                            <div style={styles.userMeta}>
                                                {usuario.cargo || 'Sin cargo'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => agregarUsuario(usuario.user_id)}
                                        style={styles.btnAgregarUsuario}
                                        disabled={loading}
                                    >
                                        +
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.btnCerrar}>
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
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },

    header: {
        background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
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

    messageSuccess: {
        padding: '12px 24px',
        backgroundColor: '#d1fae5',
        color: '#065f46',
        fontSize: '14px',
        borderBottom: '1px solid #6ee7b7',
    },

    messageError: {
        padding: '12px 24px',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        fontSize: '14px',
        borderBottom: '1px solid #fca5a5',
    },

    searchBar: {
        padding: '16px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: '12px',
    },

    searchContainer: {
        flex: 1,
        position: 'relative',
    },

    searchIcon: {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '16px',
    },

    searchInput: {
        width: '100%',
        padding: '10px 12px 10px 36px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
    },

    btnAgregar: {
        padding: '10px 20px',
        backgroundColor: '#9333ea',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },

    section: {
        padding: '24px',
    },

    sectionHeader: {
        marginBottom: '16px',
    },

    sectionTitle: {
        margin: 0,
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
    },

    listContainer: {
        maxHeight: '400px',
        overflowY: 'auto',
    },

    loading: {
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280',
    },

    emptyState: {
        padding: '40px',
        textAlign: 'center',
        color: '#6b7280',
    },

    userCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#f3e8ff',
        border: '1px solid #e9d5ff',
        borderRadius: '8px',
        marginBottom: '8px',
    },

    userCardDisponible: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginBottom: '8px',
    },

    userInfo: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },

    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#9333ea',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '16px',
    },

    avatarDisponible: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#9ca3af',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '16px',
    },

    userName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#1f2937',
    },

    userEmail: {
        fontSize: '13px',
        color: '#6b7280',
        marginTop: '2px',
    },

    userMeta: {
        fontSize: '12px',
        color: '#9ca3af',
        marginTop: '4px',
    },

    btnRemover: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnAgregarUsuario: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#e0e7ff',
        color: '#4f46e5',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    footer: {
        padding: '16px 24px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'flex-end',
    },

    btnCerrar: {
        padding: '10px 24px',
        backgroundColor: '#4b5563',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
};
