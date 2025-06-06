// Função para verificar se o usuário é superusuário
async function isAdmin() {
    // Supondo que há uma API para obter dados do usuário logado
    const response = await fetch('/api/users/me');
    if (!response.ok) return false;
    const user = await response.json();
    return user.isAdmin === true;
}

// Função para mostrar botão de relatório se for admin
async function showReportButton() {
    const admin = await isAdmin();
    if (admin) {
        const btn = document.getElementById('btnReportStock');
        if (btn) btn.style.display = 'block';
    }
}

// Função para buscar produtos e exibir em tabela
async function loadProducts() {
    const response = await fetch('/products');
    if (!response.ok) {
        alert('Erro ao carregar produtos');
        return;
    }
    const products = await response.json();
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    products.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${p.imageUrl || 'placeholder.png'}" alt="${p.name}" style="max-width: 100px; max-height: 100px;"></td>
            <td>${p.name}</td>
            <td>${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para validar estoque antes da venda
async function validateStock(productId, quantity) {
    const response = await fetch('/products/validate-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
    });
    if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Erro ao validar estoque');
        return false;
    }
    return true;
}

// Função para gerar relatório de estoque
async function generateStockReport() {
    const response = await fetch('/products/report');
    if (!response.ok) {
        alert('Erro ao gerar relatório');
        return;
    }
    const report = await response.json();
    let reportText = 'Relatório de Estoque:\n\n';
    report.forEach(p => {
        reportText += `Produto: ${p.name} | Preço: R$${p.price.toFixed(2)} | Estoque: ${p.stock}\n`;
    });
    alert(reportText);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    showReportButton();
    const btnReport = document.getElementById('btnReportStock');
    if (btnReport) {
        btnReport.addEventListener('click', generateStockReport);
    }
});
