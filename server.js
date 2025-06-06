// server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express e configs
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());

// Simple request logger middleware for debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Headers:`, req.headers);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

import productRoutes from './routes/products.js';

// Register auth routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // Registrando rotas de produtos
app.use('/api/users', usersRoutes); // Registrando rotas de usuários

// Mongoose conexão
async function connectDB() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI não definida no .env');
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado ao MongoDB!');

        const supremeUser = await User.findOne({ username: 'alexdyna' });
        if (!supremeUser) {
            const hashedPassword = await bcrypt.hash('140305ca', 10);
            const newUser = new User({
                username: 'alexdyna',
                password: hashedPassword,
                isAdmin: true
            });
            await newUser.save();
            console.log('Usuário supremo "alexdyna" criado.');
        }
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err.message);
    }
}
connectDB();

// Schema Produto
// Removido para evitar conflito com models/Product.js

// Config Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export { upload };

// Middleware Auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado: Admins apenas' });
    }
    next();
};

// Arquivos estáticos do Frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro global capturado:', err);
    res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

// Inicia servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
