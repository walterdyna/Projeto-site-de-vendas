import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String },
    category: { type: String },
    imageUrl: { type: String },
    origem: { type: String }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
