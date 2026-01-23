import { useState } from "react";
import { authService } from "../api/authService";

export default function CrearUsuarioModal({ onClose, onUsuarioCreado }) {
    // Estados del formulario
    const [formData, setFormData] = useState({
        nombreCompleto: "",
        documento: "",
        email: "",
        telefono: "",
        cargo: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Para documento, solo permitir números
        if (name === 'documento') {
            const soloNumeros = value.replace(/\D/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: soloNumeros,
            }));
        } else if (name === 'telefono') {
            // Para teléfono, solo números
            const soloNumeros = value.replace(/\D/g, '');
            setFormData((prev) => ({
                ...prev,
                [name]: soloNumeros,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        // Validar campo en tiempo real si ya fue tocado
        if (touched[name]) {
            validateField(name, name === 'documento' || name === 'telefono' ? value.replace(/\D/g, '') : value);
        }
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field, formData[field]);
    };

    const validateField = (field, value) => {
        let error = "";

        switch (field) {
            case 'nombreCompleto':
                if (!value.trim()) {
                    error = "El nombre es obligatorio";
                } else if (value.trim().length < 3) {
                    error = "Mínimo 3 caracteres";
                }
                break;
            case 'documento':
                if (!value.trim()) {
                    error = "El documento es obligatorio";
                } else if (value.length < 7 || value.length > 15) {
                    error = "Debe tener entre 7 y 15 dígitos";
                }
                break;
            case 'email':
                if (!value.trim()) {
                    error = "El email es obligatorio";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = "Formato de email inválido";
                }
                break;
            case 'telefono':
                if (value && (value.length < 7 || value.length > 15)) {
                    error = "Debe tener entre 7 y 15 dígitos";
                }
                break;
            case 'cargo':
                if (!value.trim()) {
                    error = "El cargo es obligatorio";
                } else if (value.trim().length < 2) {
                    error = "Mínimo 2 caracteres";
                }
                break;
            case 'password':
                if (!value) {
                    error = "La contraseña es obligatoria";
                } else if (value.length < 8) {
                    error = "Mínimo 8 caracteres";
                }
                break;
        }

        setFieldErrors((prev) => ({ ...prev, [field]: error }));
        return error === "";
    };

    const generarPassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
        let password = "";
        for (let i = 0; i < 14; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, password }));
        setFieldErrors((prev) => ({ ...prev, password: "" }));
        setTouched((prev) => ({ ...prev, password: true }));
    };

    const validarFormulario = () => {
        // Validar todos los campos
        const nombre = validateField('nombreCompleto', formData.nombreCompleto);
        const doc = validateField('documento', formData.documento);
        const email = validateField('email', formData.email);
        const tel = validateField('telefono', formData.telefono);
        const cargo = validateField('cargo', formData.cargo);
        const pass = validateField('password', formData.password);

        // Marcar todos como tocados
        setTouched({
            nombreCompleto: true,
            documento: true,
            email: true,
            telefono: true,
            cargo: true,
            password: true,
        });

        if (!nombre || !doc || !email || !tel || !cargo || !pass) {
            setError("Por favor corrija los errores en el formulario");
            return false;
        }
        return true;
    };

    const getFieldStatus = (field) => {
        if (!touched[field]) return null;
        if (fieldErrors[field]) return 'error';
        if (formData[field] && formData[field].toString().trim()) return 'success';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            await authService.createUser(formData);
            onUsuarioCreado();
            onClose();
        } catch (err) {
            console.error("Error al crear usuario:", err);
            setError(
                err.response?.data?.message || "Error al crear el usuario"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Crear Nuevo Usuario</h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* DATOS PERSONALES */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Datos Personales</h3>

                        <label style={styles.label}>
                            Nombre completo *
                            <div style={styles.inputWrapper}>
                                <input
                                    type="text"
                                    name="nombreCompleto"
                                    value={formData.nombreCompleto}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('nombreCompleto')}
                                    style={{
                                        ...styles.input,
                                        ...(getFieldStatus('nombreCompleto') === 'error' ? styles.inputError : {}),
                                        ...(getFieldStatus('nombreCompleto') === 'success' ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Ej: Juan Pérez García"
                                    required
                                />
                                {getFieldStatus('nombreCompleto') === 'success' && (
                                    <span style={styles.checkIcon}>✓</span>
                                )}
                                {getFieldStatus('nombreCompleto') === 'error' && (
                                    <span style={styles.errorIcon}>✕</span>
                                )}
                            </div>
                            {fieldErrors.nombreCompleto && touched.nombreCompleto && (
                                <span style={styles.fieldError}>{fieldErrors.nombreCompleto}</span>
                            )}
                        </label>

                        <label style={styles.label}>
                            Documento de identidad (DNI/CE) *
                            <div style={styles.inputWrapper}>
                                <input
                                    type="text"
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('documento')}
                                    style={{
                                        ...styles.input,
                                        ...(getFieldStatus('documento') === 'error' ? styles.inputError : {}),
                                        ...(getFieldStatus('documento') === 'success' ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Ej: 12345678"
                                    required
                                />
                                {getFieldStatus('documento') === 'success' && (
                                    <span style={styles.checkIcon}>✓</span>
                                )}
                                {getFieldStatus('documento') === 'error' && (
                                    <span style={styles.errorIcon}>✕</span>
                                )}
                            </div>
                            {fieldErrors.documento && touched.documento && (
                                <span style={styles.fieldError}>{fieldErrors.documento}</span>
                            )}
                            <small style={styles.hint}>Solo números, entre 7 y 15 dígitos</small>
                        </label>

                        <label style={styles.label}>
                            Email corporativo *
                            <div style={styles.inputWrapper}>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('email')}
                                    style={{
                                        ...styles.input,
                                        ...(getFieldStatus('email') === 'error' ? styles.inputError : {}),
                                        ...(getFieldStatus('email') === 'success' ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Ej: juan.perez@empresa.com"
                                    required
                                />
                                {getFieldStatus('email') === 'success' && (
                                    <span style={styles.checkIcon}>✓</span>
                                )}
                                {getFieldStatus('email') === 'error' && (
                                    <span style={styles.errorIcon}>✕</span>
                                )}
                            </div>
                            {fieldErrors.email && touched.email && (
                                <span style={styles.fieldError}>{fieldErrors.email}</span>
                            )}
                        </label>

                        <label style={styles.label}>
                            Teléfono
                            <div style={styles.inputWrapper}>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('telefono')}
                                    style={{
                                        ...styles.input,
                                        ...(getFieldStatus('telefono') === 'error' ? styles.inputError : {}),
                                        ...(getFieldStatus('telefono') === 'success' ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Ej: 987654321"
                                />
                                {getFieldStatus('telefono') === 'success' && (
                                    <span style={styles.checkIcon}>✓</span>
                                )}
                                {getFieldStatus('telefono') === 'error' && (
                                    <span style={styles.errorIcon}>✕</span>
                                )}
                            </div>
                            {fieldErrors.telefono && touched.telefono && (
                                <span style={styles.fieldError}>{fieldErrors.telefono}</span>
                            )}
                            <small style={styles.hint}>Opcional - Solo números</small>
                        </label>
                    </div>

                    {/* CONFIGURACIÓN DE ACCESO */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Configuración de Acceso</h3>

                        <label style={styles.label}>
                            Cargo *
                            <div style={styles.inputWrapper}>
                                <input
                                    type="text"
                                    name="cargo"
                                    value={formData.cargo}
                                    onChange={handleChange}
                                    onBlur={() => handleBlur('cargo')}
                                    style={{
                                        ...styles.input,
                                        ...(getFieldStatus('cargo') === 'error' ? styles.inputError : {}),
                                        ...(getFieldStatus('cargo') === 'success' ? styles.inputSuccess : {})
                                    }}
                                    placeholder="Ej: Analista de sistemas"
                                    required
                                />
                                {getFieldStatus('cargo') === 'success' && (
                                    <span style={styles.checkIcon}>✓</span>
                                )}
                                {getFieldStatus('cargo') === 'error' && (
                                    <span style={styles.errorIcon}>✕</span>
                                )}
                            </div>
                            {fieldErrors.cargo && touched.cargo && (
                                <span style={styles.fieldError}>{fieldErrors.cargo}</span>
                            )}
                        </label>



                        <label style={styles.label}>
                            Contraseña temporal *
                            <div style={styles.passwordContainer}>
                                <div style={styles.inputWrapper}>
                                    <input
                                        type="text"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('password')}
                                        style={{
                                            ...styles.passwordInput,
                                            ...(getFieldStatus('password') === 'error' ? styles.inputError : {}),
                                            ...(getFieldStatus('password') === 'success' ? styles.inputSuccess : {})
                                        }}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                    />
                                    {getFieldStatus('password') === 'success' && (
                                        <span style={styles.checkIcon}>✓</span>
                                    )}
                                    {getFieldStatus('password') === 'error' && (
                                        <span style={styles.errorIcon}>✕</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={generarPassword}
                                    style={styles.generateBtn}
                                >
                                    Generar
                                </button>
                            </div>
                            {fieldErrors.password && touched.password && (
                                <span style={styles.fieldError}>{fieldErrors.password}</span>
                            )}
                            <small style={styles.hintInfo}>
                                El usuario deberá cambiarla en el primer acceso
                            </small>
                        </label>
                    </div>

                    {/* ERROR */}
                    {error && <div style={styles.error}>{error}</div>}

                    {/* BOTONES */}
                    <div style={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.cancelBtn}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? "Creando..." : "Crear Usuario"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ESTILOS */
const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },

    modal: {
        background: "#fff",
        borderRadius: "12px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px",
        borderBottom: "1px solid #e5e7eb",
        background: '#110a53ff'
    },

    title: {
        margin: 0,
        fontSize: 22,
        color: "#ffffffff",
        fontWeight: "600",
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

    section: {
        padding: "24px",
        borderBottom: "1px solid #f1f5f9",
    },

    sectionTitle: {
        margin: "0 0 16px 0",
        fontSize: 16,
        color: "#334155",
        fontWeight: "600",
    },

    label: {
        display: "block",
        marginBottom: "16px",
        fontSize: 14,
        color: "#475569",
        fontWeight: "500",
    },

    inputWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },

    input: {
        width: "100%",
        padding: "10px 12px",
        paddingRight: "40px", // Espacio para el icono
        marginTop: "6px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: 14,
        boxSizing: "border-box",
        color: "#000f",
        background: "#fff",
        transition: "all 0.2s",
    },

    inputError: {
        borderColor: "#dc2626",
        backgroundColor: "#fef2f2",
    },

    inputSuccess: {
        borderColor: "#10b981",
        backgroundColor: "#f0fdf4",
    },

    checkIcon: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#10b981",
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "3px",
    },

    errorIcon: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#dc2626",
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "3px",
    },

    fieldError: {
        display: "block",
        marginTop: "4px",
        fontSize: "12px",
        color: "#dc2626",
        fontWeight: "500",
    },

    select: {
        width: "100%",
        padding: "10px 12px",
        marginTop: "6px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: 14,
        boxSizing: "border-box",
        background: "#fff",
    },

    passwordContainer: {
        display: "flex",
        gap: "8px",
        marginTop: "6px",
        alignItems: "flex-start",
    },

    passwordInput: {
        flex: 1,
        padding: "10px 12px",
        paddingRight: "40px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: 14,
        boxSizing: "border-box",
        color: "#000f",
        background: "#fff",
        transition: "all 0.2s",
    },

    generateBtn: {
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #2563eb",
        background: "#eff6ff",
        color: "#2563eb",
        fontSize: 13,
        cursor: "pointer",
        fontWeight: "500",
        whiteSpace: "nowrap",
        marginTop: "0px",
    },

    hint: {
        display: "block",
        marginTop: "6px",
        fontSize: 12,
        color: "#6b7280",
    },

    hintInfo: {
        display: "block",
        marginTop: "6px",
        fontSize: 12,
        color: "#d97706",
    },

    error: {
        margin: "0 24px 16px 24px",
        padding: "12px 16px",
        borderRadius: "8px",
        background: "#fee2e2",
        color: "#991b1b",
        fontSize: 14,
        border: "1px solid #fca5a5",
    },

    actions: {
        display: "flex",
        gap: "12px",
        padding: "24px",
        justifyContent: "flex-end",
    },

    cancelBtn: {
        padding: '10px 24px',
        backgroundColor: '#e5e7eb',
        color: '#111827',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },

    submitBtn: {
        padding: "10px 24px",
        borderRadius: "8px",
        border: "none",
        background: "#2563eb",
        color: "#fff",
        fontSize: 14,
        cursor: "pointer",
        fontWeight: "600",
    },
};
