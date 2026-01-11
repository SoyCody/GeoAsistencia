import { useEffect, useState } from "react";
import { sedeService } from "./api/sedeService";

export default function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     LISTAR SEDES AL CARGAR
  ========================= */
  useEffect(() => {
    cargarSedes();
  }, []);

  const cargarSedes = async () => {
    try {
      setLoading(true);
      const data = await sedeService.listar();
      setSedes(data);
    } catch (err) {
      setError("Error al cargar sedes");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CREAR SEDE
  ========================= */
  const crearSede = async () => {
    if (!nombre.trim()) return;

    try {
      await sedeService.crear({ nombre });
      setNombre("");
      cargarSedes(); // refresca lista
    } catch (err) {
      setError("No se pudo crear la sede");
    }
  };

  /* =========================
     ELIMINAR SEDE
  ========================= */
  const eliminarSede = async (id) => {
    if (!confirm("¿Eliminar sede?")) return;

    try {
      await sedeService.eliminar(id);
      cargarSedes();
    } catch (err) {
      setError("No se pudo eliminar la sede");
    }
  };

  return (
    <div>
      {/* MENSAJE DE ERROR */}
      {error && <p>{error}</p>}

      {/* CREAR SEDE */}
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre de la sede"
      />
      <button onClick={crearSede}>Crear sede</button>

      {/* LISTADO */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {sedes.map((sede) => (
            <li key={sede.id}>
              {sede.nombre}
              <button onClick={() => eliminarSede(sede.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


/* ===================== */
/* ESTILOS */
/* ===================== */

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "#e5e7eb",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  link: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    marginRight: 8,
  },
  linkDanger: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
  },
  formContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    width: "100%",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  map: {
    width: "100%",
    minHeight: 300,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
};
