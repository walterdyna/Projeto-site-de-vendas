import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalogo_db';

async function updateProductOrigins() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const result = await Product.updateMany(
      { $or: [ { origem: { $exists: false } }, { origem: '' } ] },
      { $set: { origem: 'Avon' } }
    );

    console.log(`Produtos atualizados: ${result.modifiedCount}`);

    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  } catch (error) {
    console.error('Erro ao atualizar produtos:', error);
    process.exit(1);
  }
}

updateProductOrigins();
