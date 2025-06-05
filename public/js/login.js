document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginMessage.textContent = '';
        loginMessage.className = 'message';

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('isAdmin', data.isAdmin);
                loginMessage.classList.add('success');
                loginMessage.textContent = 'Login realizado com sucesso! Redirecionando...';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                const errorData = await response.json();
                loginMessage.classList.add('error');
                loginMessage.textContent = errorData.message || 'Erro no login';
            }
        } catch (error) {
            loginMessage.classList.add('error');
            loginMessage.textContent = 'Erro na conexão. Tente novamente.';
            console.error('Erro no login:', error);
        }
    });
});
