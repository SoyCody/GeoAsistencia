import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { verificarConexionBD } from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(morgan('dev'));

app.use(cors({origin:'*', credentials:true}));
const PORT = 3000;

// Parseo de cuerpos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

app.listen(PORT, async ()=>{
    console.log('Servidor corriendo en puerto', PORT),
    console.log(await verificarConexionBD());
})
