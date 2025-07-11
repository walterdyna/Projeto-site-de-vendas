/*
Script para inicializar o banco de dados MongoDB com coleções e dados básicos
para o projeto de gerenciamento de produtos, usuários e estoque.

Execute este script no mongo shell ou MongoDB Compass.
*/

db = connect("mongodb://localhost:27017/devclub_project");

// Criar coleção de usuários
db.createCollection("users");

// Inserir usuários de exemplo
db.users.insertMany([
  {
    username: "alexdyna",
    passwordHash: "hash_da_senha", // Substitua pelo hash real
    isAdmin: true,
    email: "alexdyna@example.com",
    createdAt: new Date()
  },
  {
    username: "queziacastelo",
    passwordHash: "hash_da_senha",
    isAdmin: true,
    email: "queziacastelo@example.com",
    createdAt: new Date()
  }
]);

// Criar coleção de produtos
db.createCollection("products");

// Inserir produtos de exemplo
db.products.insertMany([
  {
    name: "Produto A",
    price: 10.99,
    stock: 100,
    description: "Descrição do Produto A",
    category: "Categoria 1",
    origem: "Brasil",
    imageUrl: "",
    createdAt: new Date()
  },
  {
    name: "Produto B",
    price: 20.50,
    stock: 50,
    description: "Descrição do Produto B",
    category: "Categoria 2",
    origem: "Argentina",
    imageUrl: "",
    createdAt: new Date()
  }
]);

// Criar coleção de pedidos (opcional)
db.createCollection("orders");

// Exemplo de inserção de pedido
db.orders.insertOne({
  userId: ObjectId(), // Substituir pelo ObjectId do usuário
  products: [
    { productId: ObjectId(), quantity: 2 },
    { productId: ObjectId(), quantity: 1 }
  ],
  totalPrice: 42.48,
  status: "pending",
  createdAt: new Date()
});

print("Banco de dados inicializado com sucesso.");
