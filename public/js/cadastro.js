document.addEventListener('DOMContentLoaded', () => {
    console.log('Página de cadastro carregada!');

    const productForm = document.getElementById('productForm');
    const productImageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('image-preview');
    const messageDiv = document.getElementById('message');

    // Show logged-in user info and logout button
    const userInfoDiv = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');
    const username = localStorage.getItem('username');
    if (username) {
        userInfoDiv.innerHTML = `Logado como: <strong>${username}</strong> <button id="logout-btn">Sair</button>`;
        if (loginLink) loginLink.style.display = 'none';

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            window.location.reload();
        });
    } else {
        if (loginLink) loginLink.style.display = 'inline';
        userInfoDiv.innerHTML = '';
    }

    // Função para pré-visualizar a imagem selecionada
    productImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Pega o primeiro arquivo selecionado

        if (file) {
            const reader = new FileReader(); // Objeto para ler o conteúdo do arquivo

            reader.onload = (e) => {
                // Quando o arquivo for lido, cria um elemento <img>
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização da imagem">`;
            };

            reader.readAsDataURL(file); // Lê o arquivo como uma URL de dados (base64)
        } else {
            imagePreview.innerHTML = '<p>Pré-visualização da imagem</p>'; // Volta ao texto original se nenhum arquivo for selecionado
        }
    });

    // Função para lidar com o envio do formulário
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o comportamento padrão de recarregar a página

        messageDiv.innerHTML = ''; // Limpa mensagens anteriores
        messageDiv.className = 'message'; // Reseta as classes

        const formData = new FormData(productForm); // Coleta todos os dados do formulário, incluindo o arquivo

        // Adiciona o campo productStock ao FormData
        const productStock = document.getElementById('productStock').value;
        formData.append('productStock', productStock);

        // Exemplo: mostrar os dados no console antes de enviar para o backend
        // for (let pair of formData.entries()) {
        //     console.log(pair[0] + ': ' + pair[1]);
        // }

        // Futuramente, aqui será o código para enviar os dados para o backend (Node.js)
        try {
        // Este `fetch` é o que vai enviar os dados para o seu servidor Node.js
        // A URL '/api/products' é um exemplo e será configurada no seu backend
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        const response = await fetch('/api/products', {
            method: 'POST',
            headers,
            body: formData, // FormData é ideal para enviar arquivos
        });

        if (response.ok) { // Verifica se a resposta foi bem-sucedida (status 200-299)
            const result = await response.json();
            messageDiv.classList.add('success');
            messageDiv.textContent = 'Produto cadastrado com sucesso!';
            productForm.reset(); // Limpa o formulário
            imagePreview.innerHTML = '<p>Pré-visualização da imagem</p>'; // Limpa o preview
            console.log('Produto cadastrado:', result);
        } else {
            const errorData = await response.json();
            messageDiv.classList.add('error');
            messageDiv.textContent = `Erro ao cadastrar produto: ${errorData.message || response.statusText}`;
            console.error('Erro no cadastro:', errorData);
        }
        } catch (error) {
            messageDiv.classList.add('error');
            messageDiv.textContent = 'Ocorreu um erro na conexão. Tente novamente.';
            console.error('Erro na requisição fetch:', error);
        }
    });
});
