import express from 'express';
import Product from '../models/Product.js';
import { authenticateToken } from '../middlewares/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

console.log('Cloudinary env vars:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***set***' : '***not set***'
});

import { config as cloudinaryConfig } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
    cloudinaryConfig({
        secure: true
    });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'products',
        allowed_formats: ['jpg', 'jpeg', 'png']
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const verifyToken = authenticateToken;

const verifyAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado: Admins apenas' });
    }
    next();
};

const router = express.Router();

// Criar novo produto
router.post('/', upload.single('productImage'), verifyToken, verifyAdmin, async (req, res) => {
    try {
        console.log('Recebido corpo:', req.body);
        console.log('Arquivo recebido:', req.file);
        const { productName, productPrice, productStock, productDescription, productCategory, productOrigin, destaque } = req.body;

        // Se destaque for true, gerenciar limite de 6 produtos destacados
        if (destaque === 'true' || destaque === true) {
            const destacadosCount = await Product.countDocuments({ destaque: true });
            if (destacadosCount >= 6) {
                // Não permitir adicionar mais de 6 produtos em destaque
                return res.status(400).json({ error: 'Limite de 6 produtos em destaque atingido.' });
            }
        }

        const newProduct = new Product({
            name: productName,
            price: Number(productPrice),
            stock: Number(Array.isArray(productStock) ? productStock[0] : productStock),
            description: productDescription,
            category: productCategory,
            origem: productOrigin,
            destaque: destaque === 'true' || destaque === true
        });
        if (req.file) {
            console.log('Tentando atribuir imagem:', req.file.path);
            newProduct.imageUrl = req.file.path;
        }
        const savedProduct = await newProduct.save();
        console.log('Produto salvo com sucesso:', savedProduct);
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error('Erro ao salvar produto:', err);
        if (err instanceof Error) {
            res.status(500).json({ error: err.message, stack: err.stack });
        } else {
            try {
                const parsedError = JSON.parse(JSON.stringify(err));
                console.error('Erro parseado:', parsedError);
                res.status(500).json({ error: parsedError });
            } catch (parseErr) {
                console.error('Erro desconhecido:', String(err));
                res.status(500).json({ error: 'Erro desconhecido', details: String(err) });
            }
        }
    }
});

// Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/report', verifyToken, verifyAdmin, async (req, res) => {
    try {
        console.log('Gerando relatório de estoque...');
        const products = await Product.find();
        console.log(`Produtos encontrados: ${products.length}`);
        // Gerar relatório simples em JSON
        const report = products.map(p => ({
            name: p.name,
            price: p.price,
            stock: p.stock
        }));
        res.json(report);
    } catch (err) {
        console.error('Erro ao gerar relatório de estoque:', err);
        res.status(500).json({ error: err.message });
    }
});

// Atualizar produto
router.put('/:id', upload.single('productImage'), verifyToken, verifyAdmin, async (req, res) => {
    try {
        const updatedData = req.body;
        if (req.file) {
            updatedData.imageUrl = req.file.path;
        }
        if (updatedData.productStock !== undefined) {
            updatedData.stock = Number(Array.isArray(updatedData.productStock) ? updatedData.productStock[0] : updatedData.productStock);
            delete updatedData.productStock;
        }
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar produto por id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
