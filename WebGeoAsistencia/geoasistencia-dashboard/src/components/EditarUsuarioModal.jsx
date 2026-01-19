import { useState, useEffect } from 'react';
import { userService } from '../api/userService';

export default function EditarUsuarioModal({ usuario, onClose, onUsuarioActualizado }) {
    const [formData, setFormData] = useState({
        email: '',
        telefono: '',
        cargo: ''
    });
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (usuario) {
            setFormData({
                email: usuario.user_email || '',
                telefono: usuario.user_telefono || '',
                cargo: usuario.user_cargo || ''
            });
        }
    }, [usuario]);

    const validarFormulario = () => {
        const nuevosErrors = {};

        // Validar email
        if (!formData.email.trim()) {
            nuevosErrors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nuevosErrors.email = 'Email inválido';
        }

        // Teléfono y cargo son opcionales en el backend

        setErrors(nuevosErrors);
        return Object.keys(nuevosErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setLoading(true);
        setMensaje({ texto: '', tipo: '' });

        try {
            await userService.updateUser(usuario.user_id, {
                email: formData.email,
                telefono: formData.telefono || null,
                cargo: formData.cargo || null
            });

            setMensaje({ texto: 'Usuario actualizado exitosamente', tipo: 'success' });

            setTimeout(() => {
                if (onUsuarioActualizado) onUsuarioActualizado();
                onClose();
            }, 1000);

        } catch (error) {
            console.error('Error actualizando usuario:', error);
            setMensaje({
                texto: error.response?.data?.message || 'Error al actualizar usuario',
                tipo: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando el usuario escribe
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    if (!usuario) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>Editar Usuario</h3>
                        <p style={styles.subtitle}>
                            {usuario.user_codigo} - {usuario.user_nombre_completo}
                        </p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Mensaje */}
                {mensaje.texto && (
                    <div style={mensaje.tipo === 'success' ? styles.messageSuccess : styles.messageError}>
                        {mensaje.texto}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit} style={styles.content}>
                    <div style={styles.formSection}>
                        <h4 style={styles.sectionTitle}>Información de Contacto</h4>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    ...styles.input,
                                    ...(errors.email ? styles.inputError : {})
                                }}
                                placeholder="usuario@empresa.com"
                                disabled={loading}
                            />
                            {errors.email && (
                                <p style={styles.errorText}>{errors.email}</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Teléfono
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="+593 999 999 999"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div style={styles.formSection}>
                        <h4 style={styles.sectionTitle}>Información Laboral</h4>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Cargo
                            </label>
                            <input
                                type="text"
                                name="cargo"
                                value={formData.cargo}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="Ej: Analista Senior"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div style={styles.infoBox}>
                        <div style={{ fontSize: '14px', color: '#1e40af', marginBottom: '4px', fontWeight: '500' }}>
                            ℹ️ Información
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e40af' }}>
                            <li>Los cambios se aplicarán inmediatamente</li>
                            <li>El usuario recibirá una notificación de los cambios</li>
                        </ul>
                    </div>

                    {/* Footer con botones */}
                    <div style={styles.footer}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.btnSecondary}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={styles.btnPrimary}
                            disabled={loading}
                        >
                            {loading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    },

    header: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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

    content: {
        padding: '24px',
        maxHeight: '60vh',
        overflowY: 'auto',
    },

    formSection: {
        marginBottom: '24px',
    },

    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e5e7eb',
    },

    formGroup: {
        marginBottom: '16px',
    },

    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
    },

    input: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box',
    },

    inputError: {
        borderColor: '#dc2626',
    },

    errorText: {
        margin: '4px 0 0 0',
        fontSize: '12px',
        color: '#dc2626',
    },

    infoBox: {
        padding: '12px 16px',
        backgroundColor: '#dbeafe',
        borderLeft: '4px solid #3b82f6',
        borderRadius: '4px',
        marginBottom: '24px',
    },

    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
    },

    btnPrimary: {
        padding: '10px 24px',
        backgroundColor: '#3b82f6',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },

    btnSecondary: {
        padding: '10px 24px',
        backgroundColor: '#e5e7eb',
        color: '#111827',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
};
