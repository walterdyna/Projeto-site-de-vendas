document.addEventListener('DOMContentLoaded', () => {
    console.log('Página inicial carregada!');

    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const username = localStorage.getItem('username');

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

    function sendWhatsAppMessage() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('O carrinho está vazio.');
            return;
        }
        const phoneNumber = '5527998615111'; // Número fixo para envio (exemplo)
        let message = 'Resumo do pedido:%0A';
        cart.forEach(item => {
            message += `${item.name} - R$ ${item.price.toFixed(2).replace('.', ',')} x ${item.quantity}%0A`;
        });
        message += `Total: R$ ${calculateTotal(cart).toFixed(2).replace('.', ',')}`;
        const url = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(url, '_blank');
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item._id !== productId);
        saveCart(cart);
        renderCart();
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

            // Renderiza inicialmente todos os produtos
            renderFilteredProducts();

            // Adiciona event listeners aos botões de filtro
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const origin = button.getAttribute('data-origin');
                    if (origin === 'Todos') {
                        filteredProducts = products;
                    } else {
                        filteredProducts = products.filter(p => (p.origem || '').trim().toLowerCase() === origin.trim().toLowerCase());
                    }
                    renderFilteredProducts();
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

    sendWhatsAppBtn.addEventListener('click', () => {
        sendWhatsAppMessage();
    });
});
