    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const username = localStorage.getItem('username');

    document.addEventListener('DOMContentLoaded', () => {
        console.log('Página inicial carregada!');

        // Show logged-in user info and logout button
        const userInfoDiv = document.getElementById('user-info');
        const loginLink = document.getElementById('login-link');
        const usersLink = document.getElementById('users-link');
        if (username) {
            userInfoDiv.innerHTML = `Logado como: <strong>${username}</strong> <button id="logout-btn">Sair</button>`;
            if (loginLink) loginLink.style.display = 'none';

            // Mostrar link Gerenciar Usuários apenas para supremo
            if (usersLink) {
                if (username === 'alexdyna' || username === 'queziacastelo') {
                    usersLink.style.display = 'inline';
                } else {
                    usersLink.style.display = 'none';
                }
            }

        // Show "Gerar Relatório de Estoque" button only for user "alexdyna"
        const btnReportStock = document.getElementById('btnReportStock');
        if (btnReportStock) {
            if (username === 'alexdyna' || username === 'queziacastelo') {
                btnReportStock.style.display = 'inline-block';
            } else {
                btnReportStock.style.display = 'none';
            }

            btnReportStock.addEventListener('click', async () => {
                if (!token) {
                    alert('Você precisa estar logado para acessar o relatório.');
                    return;
                }
                try {
                    const response = await fetch('/api/products/report', {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        alert('Erro ao obter relatório: ' + (errorData.message || response.statusText));
                        return;
                    }
                    const report = await response.json();
                    showStockReportModal(report);
                } catch (error) {
                    alert('Erro na requisição: ' + error.message);
                }
            });
        }

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            window.location.reload();
        });
    } else {
        if (loginLink) loginLink.style.display = 'inline';
        if (usersLink) usersLink.style.display = 'none';
        userInfoDiv.innerHTML = '';
    }

    // Funções para gerenciar o carrinho no localStorage
    function getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }

    // Function to show the stock report modal with data
    function showStockReportModal(report) {
        const modal = document.getElementById('stock-report-modal');
        const tbody = modal.querySelector('tbody');
        const grandTotalElem = document.getElementById('stock-report-grand-total');

        tbody.innerHTML = '';
        let grandTotal = 0;

        report.forEach(item => {
            const totalValue = item.price * item.stock;
            grandTotal += totalValue;

            const tr = document.createElement('tr');

            const tdName = document.createElement('td');
            tdName.textContent = item.name;
            tdName.style.textAlign = 'left';
            tdName.style.padding = '8px';
            tr.appendChild(tdName);

            const tdStock = document.createElement('td');
            tdStock.textContent = item.stock;
            tdStock.style.textAlign = 'right';
            tdStock.style.padding = '8px';
            tr.appendChild(tdStock);

            const tdPrice = document.createElement('td');
            tdPrice.textContent = item.price.toFixed(2).replace('.', ',');
            tdPrice.style.textAlign = 'right';
            tdPrice.style.padding = '8px';
            tr.appendChild(tdPrice);

            const tdTotal = document.createElement('td');
            tdTotal.textContent = totalValue.toFixed(2).replace('.', ',');
            tdTotal.style.textAlign = 'right';
            tdTotal.style.padding = '8px';
            tr.appendChild(tdTotal);

            tbody.appendChild(tr);
        });

        grandTotalElem.textContent = grandTotal.toFixed(2).replace('.', ',');

        modal.style.display = 'block';

        // Close button event
        const closeBtn = document.getElementById('close-stock-report-btn');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item._id === product._id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    saveCart(cart);
    alert(`Produto "${product.name}" adicionado ao carrinho.`);
}

    function calculateTotal(cart) {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    function renderCart() {
        const cart = getCart();
        const cartItemsUl = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        cartItemsUl.innerHTML = '';
        cart.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.quantity}`;
            // Adiciona botão para remover item
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remover';
            removeBtn.style.marginLeft = '10px';
            removeBtn.style.backgroundColor = '#dc3545';
            removeBtn.style.color = 'white';
            removeBtn.style.border = 'none';
            removeBtn.style.borderRadius = '3px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.padding = '2px 6px';
            removeBtn.addEventListener('click', () => {
                removeFromCart(item._id);
            });
            li.appendChild(removeBtn);
            cartItemsUl.appendChild(li);
        });
        cartTotalSpan.textContent = calculateTotal(cart).toFixed(2).replace('.', ',');
    }

    async function sendWhatsAppMessage() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('O carrinho está vazio.');
            return;
        }
        const phoneNumber = '5527998615111'; // Número fixo para envio (exemplo)
        let message = 'Resumo do pedido:%0A';

        // Atualizar estoque e montar mensagem
        for (const item of cart) {
            try {
                // Buscar produto atualizado para verificar estoque
                const response = await fetch(`/api/products/${item._id}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                if (!response.ok) {
                    alert(`Erro ao buscar produto ${item.name}: ${response.statusText}`);
                    return;
                }
                const product = await response.json();

                if (product.stock === 0) {
                    message += `${item.name} (fazer pedido) - R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.quantity}%0A`;
                } else {
                    message += `${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.quantity}%0A`;

                    // Atualizar estoque no backend
                    const newStock = product.stock - item.quantity;
                    if (newStock < 0) {
                        alert(`Estoque insuficiente para o produto ${item.name}.`);
                        return;
                    }
                    const updateResponse = await fetch(`/api/products/${item._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ stock: newStock })
                    });
                    if (!updateResponse.ok) {
                        alert(`Erro ao atualizar estoque do produto ${item.name}: ${updateResponse.statusText}`);
                        return;
                    }
                }
            } catch (error) {
                alert(`Erro na requisição para o produto ${item.name}: ${error.message}`);
                return;
            }
        }

        message += `Total: R$ ${calculateTotal(cart).toFixed(2).replace('.', ',')}`;
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank');

        // Limpar carrinho após envio
        saveCart([]);
        renderCart();
    }

async function removeFromCart(productId) {
    let cart = getCart();
    const itemToRemove = cart.find(item => item._id === productId);
    if (!itemToRemove) return;

    try {
        // Remover do carrinho e atualizar UI
        cart = cart.filter(item => item._id !== productId);
        saveCart(cart);
        renderCart();
        console.log(`Produto ${productId} removido do carrinho com sucesso.`);
    } catch (error) {
        alert(`Erro na requisição para remoção do produto: ${error.message}`);
        console.error(`Erro na remoção do produto ${productId}:`, error);
    }
}

    fetch('/api/products')
        .then(response => response.json())
        .then(products => {
            const productGrid = document.querySelector('.product-grid');
            if (!products.length) {
                productGrid.innerHTML = '<p>Nenhum produto cadastrado ainda. <a href="cadastro.html">Cadastre o primeiro!</a></p>';
                return;
            }
            productGrid.innerHTML = ''; // Limpa o placeholder

            // Variável para armazenar os produtos filtrados
            let filteredProducts = products;

            // Captura elementos da busca e filtro
            const searchInput = document.getElementById('search-input');
            const categorySelect = document.getElementById('category-select');
            const searchBtn = document.getElementById('search-btn');

            // Função para filtrar produtos por nome e categoria
            function filterProducts() {
                const searchTerm = searchInput.value.trim().toLowerCase();
                const selectedCategory = categorySelect.value;

                filteredProducts = products.filter(product => {
                    const matchesCategory = selectedCategory === 'Todos' || (product.origem || '').trim().toLowerCase() === selectedCategory.trim().toLowerCase();
                    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
                    return matchesCategory && matchesSearch;
                });
            }

            // Função para renderizar os produtos filtrados
            function renderFilteredProducts() {
                productGrid.innerHTML = '';
                filteredProducts.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');

                    let buttonsHtml = `<button class="view-details-btn" data-id="${product._id}">Ver Detalhes</button>`;
                    buttonsHtml += `<button class="add-to-cart-btn" data-id="${product._id}">Adicionar ao Carrinho</button>`;

                    if (isAdmin && token) {
                        buttonsHtml += `
                            <button class="edit-btn" data-id="${product._id}">Editar</button>
                            <button class="delete-btn" data-id="${product._id}">Apagar</button>
                        `;
                    }

                    productCard.innerHTML = `
                        <img src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                        ${buttonsHtml}
                    `;
                    productGrid.appendChild(productCard);
                });

                // Reaplicar event listeners para os botões após renderizar
                document.querySelectorAll('.view-details-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const productId = event.target.getAttribute('data-id');
                        const product = filteredProducts.find(p => p._id === productId);
                        if (product) {
                            const modal = document.getElementById('product-details-modal');
                            const modalImage = document.getElementById('product-details-image');
                            const modalName = document.getElementById('product-details-name');
                            const modalDescription = document.getElementById('product-details-description');

                            modalImage.src = product.imageUrl || 'https://via.placeholder.com/400';
                            modalImage.alt = product.name;
                            modalName.textContent = product.name;
                            modalDescription.textContent = product.description || 'Sem descrição disponível.';

                            modal.style.display = 'block';
                        }
                    });
                });

                document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const productId = event.target.getAttribute('data-id');
                        const product = filteredProducts.find(p => p._id === productId);
                        if (product) {
                            addToCart(product);
                        }
                    });
                });

                if (isAdmin && token) {
                    document.querySelectorAll('.delete-btn').forEach(button => {
                        button.addEventListener('click', async (event) => {
                            const productId = event.target.getAttribute('data-id');
                            if (confirm('Tem certeza que deseja apagar este produto?')) {
                                try {
                                    const response = await fetch(`/api/products/${productId}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': 'Bearer ' + token
                                        }
                                    });
                                    if (response.ok) {
                                        alert('Produto apagado com sucesso!');
                                        location.reload();
                                    } else {
                                        const errorData = await response.json();
                                        alert('Erro ao apagar produto: ' + (errorData.message || response.statusText));
                                    }
                                } catch (error) {
                                    alert('Erro na requisição: ' + error.message);
                                }
                            }
                        });
                    });

                    document.querySelectorAll('.edit-btn').forEach(button => {
                        button.addEventListener('click', (event) => {
                            const productId = event.target.getAttribute('data-id');
                            window.location.href = `editar.html?id=${productId}`;
                        });
                    });
                }
            }

            // Função para atualizar a lista de produtos filtrados e renderizar
            function updateProductList() {
                filterProducts();
                renderFilteredProducts();
            }

            // Renderiza inicialmente todos os produtos
            updateProductList();

            // Adiciona event listener ao botão de busca
            searchBtn.addEventListener('click', () => {
                updateProductList();
            });

            // Adiciona event listeners aos botões de filtro para atualizar o seletor e disparar a busca
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const origin = button.getAttribute('data-origin');
                    categorySelect.value = origin;
                    updateProductList();
                });
            });

            // Adiciona evento para fechar modal de detalhes ao clicar no botão "X"
            const closeDetailsBtn = document.getElementById('close-product-details');
            const productDetailsModal = document.getElementById('product-details-modal');

            closeDetailsBtn.addEventListener('click', () => {
                productDetailsModal.style.display = 'none';
            });

            // Adiciona evento para fechar modal de detalhes ao clicar fora da área do modal
            window.addEventListener('click', (event) => {
                if (event.target === productDetailsModal) {
                    productDetailsModal.style.display = 'none';
                }
            });
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));

    // Botões do carrinho
    const viewCartBtn = document.getElementById('view-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartBtn = document.getElementById('close-cart-btn');

    viewCartBtn.addEventListener('click', () => {
        renderCart();
        cartModal.style.display = 'block';
    });

    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    const sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');
    if (sendWhatsAppBtn) {
        sendWhatsAppBtn.addEventListener('click', () => {
            sendWhatsAppMessage();
        });
    }
});
