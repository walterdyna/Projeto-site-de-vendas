import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middlewares/auth.js'; // We'll create this middleware file
const router = express.Router();

// Middleware para verificar se o usuário é admin supremo
const isSupremeUser = (req, res, next) => {
    if (req.user.username !== 'alexdyna') {
        return res.status(403).json({ message: 'Acesso negado: Apenas o usuário supremo pode acessar esta rota' });
    }
    next();
};

// Rota para listar usuários (apenas supremo)
router.get('/', authenticateToken, isSupremeUser, async (req, res) => {
    try {
        const users = await User.find({}, 'username isAdmin');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao listar usuários', error: error.message });
    }
});

// Rota para criar novos usuários (apenas supremo)
import bcrypt from 'bcrypt';

router.post('/', authenticateToken, isSupremeUser, async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Usuário já existe' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, isAdmin: isAdmin || false });
        await newUser.save();
        res.status(201).json({ message: 'Usuário criado com sucesso', user: { username: newUser.username, isAdmin: newUser.isAdmin } });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
    }
});

import mongoose from 'mongoose';

// Rota para deletar usuário (apenas supremo)
router.delete('/:id', authenticateToken, isSupremeUser, async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'ID de usuário inválido' });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ message: 'Usuário deletado com sucesso', user: { username: deletedUser.username, isAdmin: deletedUser.isAdmin } });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
    }
});

export default router;
