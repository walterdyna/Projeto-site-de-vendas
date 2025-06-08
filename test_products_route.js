const fetch = require('node-fetch');

async function testProductsRoute() {
    try {
        const response = await fetch('http://localhost:3000/products');
        if (!response.ok) {
            console.error('Erro na requisição:', response.status, response.statusText);
            return;
        }
        const products = await response.json();
        console.log('Produtos recebidos:', products);

        // Testar filtro por categoria
        const categories = ['todos', 'avon', 'natura', 'boticario', 'outros'];
        for (const category of categories) {
            const url = category === 'todos' ? 'http://localhost:3000/products' : `http://localhost:3000/products?category=${category}`;
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`Erro ao buscar categoria ${category}:`, res.status, res.statusText);
                continue;
            }
            const filteredProducts = await res.json();
            console.log(`Produtos na categoria ${category}:`, filteredProducts);
        }
    } catch (error) {
        console.error('Erro ao testar rota /products:', error);
    }
}

testProductsRoute();
