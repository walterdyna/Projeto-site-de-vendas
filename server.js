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

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express e configs
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Geral' },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

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

// --- ROTAS ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Senha incorreta' });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, username: user.username, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
});

import usersRouter from './routes/users.js';

// --- ROTAS ---

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuário não encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Senha incorreta' });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin
        }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, username: user.username, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
});

// Usar o router de usuários
app.use('/api/users', usersRouter);

// CRUD Produtos
app.post('/api/products', authenticateToken, isAdmin, upload.single('productImage'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });

        const { productName, productDescription, productPrice, productCategory } = req.body;
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const newProduct = new Product({
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice),
            category: productCategory || 'Geral',
            imageUrl
        });

        await newProduct.save();
        res.status(201).json({ message: 'Produto cadastrado com sucesso!', product: newProduct });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao cadastrar produto', error: error.message });
    }
});

app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'Produto não encontrado' });
        res.json({ message: 'Produto deletado com sucesso', product: deletedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar produto', error: error.message });
    }
});

app.put('/api/products/:id', authenticateToken, isAdmin, upload.single('productImage'), async (req, res) => {
    try {
        const { productName, productDescription, productPrice, productCategory } = req.body;
        const updateData = {
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice),
            category: productCategory || 'Geral'
        };

        if (req.file) {
            updateData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'Produto não encontrado' });

        res.json({ message: 'Produto atualizado com sucesso', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
});

// Arquivos estáticos do Frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
