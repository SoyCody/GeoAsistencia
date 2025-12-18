
-- =============================================
-- 1. TABLAS DE ESTRUCTURA Y UBICACIÓN
-- =============================================

-- Sede: El edificio físico administrativo
CREATE TABLE sede (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Columna añadida
);

-- Geocerca: La zona virtual de validación (PostGIS)
CREATE TABLE geocerca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sede_id UUID REFERENCES sede(id) ON DELETE CASCADE,
    nombre_zona VARCHAR(50) NOT NULL, 
    radio_metros INT DEFAULT 50,      
    punto_central GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Columna añadida
);

-- =============================================
-- 2. TABLAS DE USUARIOS (PRIVACIDAD LOPDP)
-- =============================================

-- Persona: DATOS SENSIBLES (LOPDP - Identidad Legal)
CREATE TABLE persona (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(150) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Columna añadida
);

-- Perfil: DATOS OPERATIVOS (Rol de Colaborador/Administrador)
-- Relación 1:1 con Persona
CREATE TABLE perfil (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    persona_id UUID UNIQUE REFERENCES persona(id) ON DELETE CASCADE, 
    codigo_empleado VARCHAR(20) UNIQUE NOT NULL, 
    cargo VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL, 
    es_admin BOOLEAN DEFAULT FALSE,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Columna añadida
);

-- =============================================
-- 3. TABLA DE ASIGNACIÓN (RELACIÓN N:M)
-- =============================================

-- Asignacion Laboral: Un Perfil (N) puede estar asignado a muchas Geocercas (M)
CREATE TABLE asignacion_laboral (
    perfil_id UUID REFERENCES perfil(id) ON DELETE CASCADE,
    geocerca_id UUID REFERENCES geocerca(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, geocerca_id), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Columna añadida
);

-- =============================================
-- 4. TABLAS TRANSACCIONALES Y DE AUDITORÍA
-- =============================================

-- RegistroAsistencia: Histórico/Transaccional (NO necesita updated_at)
CREATE TABLE registro_asistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perfil_id UUID REFERENCES perfil(id),
    geocerca_validada_id UUID REFERENCES geocerca(id), 
    fecha_hora_servidor TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
    tipo_evento VARCHAR(10) CHECK (tipo_evento IN ('ENTRADA', 'SALIDA')) NOT NULL,
    
    latitud_movil DECIMAL(10, 8) NOT NULL,
    longitud_movil DECIMAL(11, 8) NOT NULL,
    ubicacion_movil GEOGRAPHY(POINT, 4326), 
    
    es_valido BOOLEAN DEFAULT FALSE,
    nota_auditoria VARCHAR(255) 
);

-- Auditoria: Histórico/Transaccional (NO necesita updated_at)
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_perfil_id UUID REFERENCES perfil(id), 
    tabla_afectada VARCHAR(50),
    accion VARCHAR(50), 
    detalle_cambio JSONB, 
    fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);