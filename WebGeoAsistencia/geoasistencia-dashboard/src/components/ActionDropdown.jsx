import { useState, useEffect, useRef } from 'react';

/**
 * ActionDropdown - Componente de menú desplegable para acciones
 * 
 * @param {Array} items - Array de objetos: { label, onClick, icon, color, divider, disabled }
 * @param {string} position - 'left' o 'right' (default: 'right')
 */
export default function ActionDropdown({ items = [], position = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 'auto' });
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    // Calcular posición del dropdown
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const dropdownWidth = 180; // minWidth del dropdown

            let calculatedPosition = {
                top: rect.bottom + 4, // 4px de margen
            };

            if (position === 'right') {
                // Alinear a la derecha del botón
                calculatedPosition.right = window.innerWidth - rect.right;
                calculatedPosition.left = 'auto';
            } else {
                // Alinear a la izquierda del botón
                calculatedPosition.left = rect.left;
                calculatedPosition.right = 'auto';
            }

            // Verificar si se sale del viewport
            if (calculatedPosition.left !== 'auto' && calculatedPosition.left + dropdownWidth > window.innerWidth) {
                calculatedPosition.right = 8; // 8px del borde
                calculatedPosition.left = 'auto';
            }

            setDropdownPosition(calculatedPosition);
        }
    }, [isOpen, position]);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleItemClick = (item, e) => {
        e.stopPropagation();
        if (item.disabled) return;

        setIsOpen(false);
        if (item.onClick) {
            item.onClick();
        }
    };

    return (
        <div style={styles.container} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={toggleDropdown}
                style={styles.triggerButton}
                aria-label="Abrir menú de acciones"
                type="button"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ display: 'block' }}
                >
                    <circle cx="10" cy="4" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                    <circle cx="10" cy="16" r="1.5" />
                </svg>
            </button>

            {/* Dropdown Menu - Fixed positioned */}
            {isOpen && (
                <div
                    style={{
                        ...styles.dropdown,
                        top: `${dropdownPosition.top}px`,
                        left: dropdownPosition.left !== 'auto' ? `${dropdownPosition.left}px` : 'auto',
                        right: dropdownPosition.right !== 'auto' ? `${dropdownPosition.right}px` : 'auto',
                    }}
                >
                    {items.map((item, index) => {
                        // Renderizar divisor
                        if (item.divider) {
                            return <div key={`divider-${index}`} style={styles.divider} />;
                        }

                        // Renderizar item de menú
                        return (
                            <button
                                key={index}
                                onClick={(e) => handleItemClick(item, e)}
                                style={{
                                    ...styles.menuItem,
                                    ...(item.disabled ? styles.menuItemDisabled : {}),
                                    ...(item.color && !item.disabled ? { color: getColor(item.color) } : {})
                                }}
                                disabled={item.disabled}
                                type="button"
                            >
                                {item.icon && (
                                    <span style={styles.icon}>{item.icon}</span>
                                )}
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Helper para colores
const getColor = (colorName) => {
    const colors = {
        primary: '#2563eb',
        secondary: '#6b7280',
        success: '#10b981',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#0891b2',
        purple: '#9333ea',
    };
    return colors[colorName] || colors.secondary;
};

const styles = {
    container: {
        position: 'relative',
        display: 'inline-block',
    },

    triggerButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        padding: '6px',
        backgroundColor: 'transparent',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        color: '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },

    dropdown: {
        position: 'fixed',
        minWidth: '180px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        padding: '6px',
        animation: 'fadeIn 0.15s ease',
    },

    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.1s ease',
        whiteSpace: 'nowrap',
    },

    menuItemDisabled: {
        color: '#9ca3af',
        cursor: 'not-allowed',
        opacity: 0.5,
    },

    icon: {
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    divider: {
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '6px 0',
    },
};

// Agregar estilos CSS dinámicos para hover
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        button[aria-label="Abrir menú de acciones"]:hover {
            background-color: #f3f4f6 !important;
            border-color: #9ca3af !important;
            color: #374151 !important;
        }

        button[aria-label="Abrir menú de acciones"]:active {
            background-color: #e5e7eb !important;
        }
        
        .action-menu-item:not(:disabled):hover {
            background-color: #f3f4f6 !important;
        }
    `;

    if (!document.head.querySelector('[data-action-dropdown-styles]')) {
        styleElement.setAttribute('data-action-dropdown-styles', 'true');
        document.head.appendChild(styleElement);
    }
}

// Exportar también un wrapper con clase para hover
export function ActionMenuItem(props) {
    return <button {...props} className="action-menu-item" />;
}
