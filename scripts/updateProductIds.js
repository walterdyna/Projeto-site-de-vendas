import mongoose from 'mongoose';
import Product from '../models/Product.js';

async function updateProductIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seu_banco_de_dados', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const products = await Product.find().sort({ _id: 1 });
    let idCounter = 1;

    for (const product of products) {
      product.id = idCounter++;
      await product.save();
      console.log(`Produto ${product.name} atualizado com id: ${product.id}`);
    }

    console.log('Atualização dos ids concluída.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao atualizar ids dos produtos:', error);
  }
}

updateProductIds();
