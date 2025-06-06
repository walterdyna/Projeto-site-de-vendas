document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userInfoDiv = document.getElementById('user-info');
    const loginLink = document.getElementById('login-link');
    const usersLink = document.getElementById('users-link');
    const messageDiv = document.getElementById('message');
    const userForm = document.getElementById('userForm');
    const usersTableBody = document.querySelector('#usersTable tbody');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return;
    }

    // Restringir acesso à página para usuários supremos "alexdyna" e "queziacastelo"
    if (username !== 'alexdyna' && username !== 'queziacastelo') {
        alert('Acesso negado: Apenas usuários supremos podem acessar esta página.');
        window.location.href = 'index.html';
        return;
    }

    // Show logged-in user info and logout button
    if (username) {
        userInfoDiv.innerHTML = `Logado como: <strong>${username}</strong> <button id="logout-btn">Sair</button>`;
        if (loginLink) loginLink.style.display = 'none';
        if (usersLink) usersLink.style.display = 'inline';

        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            window.location.href = 'login.html';
        });
    } else {
        if (loginLink) loginLink.style.display = 'inline';
        if (usersLink) usersLink.style.display = 'none';
        userInfoDiv.innerHTML = '';
    }

    // Fetch and display users
    async function loadUsers() {
        try {
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            if (!response.ok) {
                throw new Error('Erro ao carregar usuários');
            }
            const users = await response.json();
            usersTableBody.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.isAdmin ? 'Sim' : 'Não'}</td>
            <td><button class="delete-user-btn" data-id="${user._id}">Apagar</button></td>
        `;
        usersTableBody.appendChild(tr);
    });
        } catch (error) {
            console.error(error);
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Erro ao carregar usuários.';
        }
    }

    loadUsers();

    // Handle user creation form submit
    userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        messageDiv.className = 'message';
        messageDiv.textContent = '';

        const formData = new FormData(userForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password'),
            isAdmin: formData.get('isAdmin') === 'on'
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Usuário criado com sucesso!';
                userForm.reset();
                loadUsers();
            } else {
                const errorData = await response.json();
                messageDiv.className = 'message error';
                messageDiv.textContent = errorData.message || 'Erro ao criar usuário.';
            }
        } catch (error) {
            console.error(error);
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Erro na conexão. Tente novamente.';
        }
    });

    // Handle user delete button click
    usersTableBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-user-btn')) {
            const userId = event.target.getAttribute('data-id');
            if (confirm('Tem certeza que deseja apagar este usuário?')) {
                try {
                    const response = await fetch(`/api/users/${userId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    });
                    if (response.ok) {
                        messageDiv.className = 'message success';
                        messageDiv.textContent = 'Usuário apagado com sucesso!';
                        loadUsers();
                    } else {
                        const errorData = await response.json();
                        messageDiv.className = 'message error';
                        messageDiv.textContent = errorData.message || 'Erro ao apagar usuário.';
                    }
                } catch (error) {
                    console.error(error);
                    messageDiv.className = 'message error';
                    messageDiv.textContent = 'Erro na conexão. Tente novamente.';
                }
            }
        }
    });
});
