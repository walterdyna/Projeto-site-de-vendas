import Product from '../models/Product.js';

export const validateStock = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ error: 'productId e quantity são obrigatórios' });
        }
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Estoque insuficiente' });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
