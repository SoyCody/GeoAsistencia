import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const auth = async (req, res, next) => {
  let token;

  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      error: "No autenticado"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      `
        SELECT 
          id,
          es_admin,
          estado
        FROM perfil
        WHERE id = $1
          AND estado = 'ACTIVO'
        LIMIT 1
      `,
      [decoded.sub]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Usuario no válido o inactivo"
      });
    }

    req.user = {
      id: result.rows[0].id,
      esAdmin: result.rows[0].es_admin
    };

    next();

  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado"
    });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user?.esAdmin) {
    return res.status(403).json({
      error: "Acceso solo para administradores"
    });
  }
  next();
};
