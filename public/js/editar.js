document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const editProductForm = document.getElementById('editProductForm');
    const messageDiv = document.getElementById('message');
    const imagePreview = document.getElementById('image-preview');
    const productImageInput = document.getElementById('productImage');

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para editar produtos.');
        window.location.href = 'login.html';
        return;
    }

    // Fetch product data to fill the form
    fetch(`/api/products`)
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p._id === productId);
            if (!product) {
                alert('Produto não encontrado.');
                window.location.href = 'index.html';
                return;
            }
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productOrigin').value = product.origem || '';
            imagePreview.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}">`;
        })
        .catch(err => {
            console.error('Erro ao carregar produto:', err);
            alert('Erro ao carregar produto.');
            window.location.href = 'index.html';
        });

    // Preview image on file select
    productImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização da imagem">`;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.innerHTML = '<p>Pré-visualização da imagem</p>';
        }
    });

    // Handle form submit
    editProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.textContent = '';
        messageDiv.className = 'message';

        const formData = new FormData(editProductForm);

        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                messageDiv.classList.add('success');
                messageDiv.textContent = 'Produto atualizado com sucesso!';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                const errorData = await response.json();
                messageDiv.classList.add('error');
                messageDiv.textContent = `Erro ao atualizar produto: ${errorData.message || response.statusText}`;
            }
        } catch (error) {
            messageDiv.classList.add('error');
            messageDiv.textContent = 'Erro na conexão. Tente novamente.';
            console.error('Erro na requisição fetch:', error);
        }
    });
});
