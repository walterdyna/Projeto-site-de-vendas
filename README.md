Projeto Site da Quezia
1. Visão Geral do Projeto
Este projeto é um sistema completo de catálogo online com funcionalidades integradas de e-commerce e gerenciamento administrativo. Foi desenvolvido para atender a pequenos e médios empreendedores que desejam digitalizar suas vendas com uma plataforma moderna, intuitiva e segura. O sistema permite o cadastro, edição, visualização e exclusão de produtos, controle de usuários com diferentes níveis de permissão e processos simplificados de compra, tudo com foco na usabilidade e performance.

A aplicação é construída com as seguintes tecnologias:

Backend:

Node.js

Express

MongoDB

Mongoose

Autenticação e Segurança:

JWT (JSON Web Tokens)

bcrypt para hash de senhas

Upload de Imagens:

Multer para tratamento de arquivos

Cloudinary para armazenamento em nuvem

Frontend:

HTML5, CSS3 e JavaScript puro (sem frameworks)

Outros:

Middleware de tratamento global de erros

Sistema de permissões e controle de acesso por níveis

2. Funcionalidades Detalhadas
✅ Gerenciamento de Produtos
CRUD completo de produtos (Create, Read, Update, Delete).

Upload de imagens com armazenamento em nuvem via Cloudinary.

Visualização completa dos dados do produto: nome, preço, descrição, categoria, estoque e imagem.

Validação automática do estoque antes da finalização de uma compra para evitar inconsistências.

👥 Gerenciamento de Usuários
Cadastro e login de usuários com senhas armazenadas com segurança (hash com bcrypt).

Controle de acesso baseado em níveis de permissão:

Usuários comuns: apenas navegam e compram.

Administradores: podem gerenciar produtos.

Usuários Supremos: usuários especiais identificados por nome (ex: alexdyna, queziacastelo) com acesso irrestrito, inclusive ao gerenciamento de usuários e relatórios.

🔐 Autenticação e Segurança
Sistema de autenticação robusto utilizando JWT com validade de 24 horas.

Proteção de rotas sensíveis com middleware de verificação de token.

Middleware de controle de permissões administrativas e supremas.

Tratamento global de erros: padroniza respostas de falhas e facilita debugging.

🛒 Carrinho de Compras
Interface intuitiva para adicionar/remover produtos do carrinho.

Persistência do estado do carrinho utilizando localStorage no navegador.

Opção de enviar o resumo do carrinho via WhatsApp com link direto e mensagem pré-formatada, otimizando o processo de compra para o cliente e o vendedor.

📊 Relatórios
Geração de relatório simplificado com base no estoque atual.

Acesso restrito exclusivamente aos usuários supremos para garantir segurança e confidencialidade dos dados.

3. Instalação e Configuração
⚙️ Pré-requisitos
Node.js (versão 16 ou superior)

MongoDB (pode ser local ou hospedado, como no MongoDB Atlas)

Conta no Cloudinary (opcional, mas essencial para upload de imagens)

📁 Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto com as seguintes chaves:
MONGODB_URI=seu_uri_mongodb
JWT_SECRET=sua_chave_secreta_jwt
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret
PORT=3000

⚠️ Importante: Nunca compartilhe seu .env publicamente. Para deploy, use variáveis seguras no ambiente da hospedagem (como no Vercel, Heroku, etc).

🧪 Passos para Instalação
Clone o repositório:
git clone <https://github.com/walterdyna/Projeto-site-de-vendas>
cd <site-de-vendas>

Instale as dependências:

npm install

Execute o servidor local:

npm start ou node server.js

Acesse no navegador:

http://localhost:3000


🛠️ Dicas de Solução de Problemas
Verifique se o MongoDB está ativo e se a URI está correta no .env.

Certifique-se de que as credenciais do Cloudinary estão corretas para upload.

Use logs no terminal para detectar erros ao iniciar o servidor.

4. Uso da Aplicação
🔑 Acesso e Autenticação
Qualquer usuário pode se cadastrar ou fazer login via formulário.

Usuários supremos (alexdyna e queziacastelo) são reconhecidos automaticamente ao fazer login e têm acesso exclusivo a funções administrativas sensíveis.

🧭 Funcionalidades Principais
Visualização dos produtos por qualquer usuário.

Adição de produtos ao carrinho e envio do pedido via WhatsApp.

Área administrativa para:

Gerenciar produtos (criar, editar, excluir).

Acessar relatório de estoque.

Gerenciar usuários (restrito a supremos).

5. Arquitetura do Backend
🌐 Configuração do Servidor
Configuração básica do Express para:

Servir APIs RESTful

Servir arquivos estáticos (HTML/CSS/JS)

Utilização de middlewares: cors, express.json, express.urlencoded

🔁 Rotas da API
POST /api/auth/login — Login de usuários.

GET|POST|PUT|DELETE /api/products — CRUD de produtos (acesso controlado por nível de permissão).

POST /api/products/validate-stock — Validação de estoque antes da venda.

GET /api/products/report — Relatório de estoque (exclusivo para supremos).

GET|POST|DELETE /api/users — Gerenciamento de usuários (exclusivo para supremos).

🔒 Autenticação e Autorização
Tokens JWT gerados no login e enviados nas requisições protegidas.

Middleware de autorização que:

Valida token JWT

Confirma permissões de administrador

Confirma se o usuário é um "usuário supremo"

6. Modelos de Dados
🧍 Usuário (User)

{
  username: String, // obrigatório e único
  password: String, // armazenado com hash bcrypt
  isAdmin: Boolean  // define permissões administrativas
}

📦 Produto (Product)
{
  name: String,      // obrigatório e único
  price: Number,     // obrigatório
  stock: Number,     // obrigatório, não pode ser negativo
  description: String, // opcional
  category: String,  // opcional
  imageUrl: String   // URL da imagem armazenada na nuvem
}

Visão Geral do Frontend
Estrutura em HTML puro com rotas simuladas (navegação baseada em templates).

JavaScript nativo para:

Chamada às APIs com fetch

Manipulação do DOM

Controle de sessão (login/logout)

Validações e interações com o carrinho

Estilo visual limpo e responsivo com CSS customizado.

Modal para visualização de produto detalhado.

Elementos visuais são renderizados dinamicamente de acordo com o tipo de usuário (usuário comum, admin ou supremo).

8. Testes e Validações
Validações no backend para:

Evitar duplicidade de nomes de produtos e usuários

Garantir dados consistentes no banco

Proteções contra acesso não autorizado com validação de token e permissões.

Testes manuais realizados em:

Cadastro e login de usuários

Fluxo completo de gerenciamento de produtos

Envio de pedido via WhatsApp

Acesso restrito a relatórios e rotas protegidas

Interface projetada para funcionar corretamente em diferentes tamanhos de tela e dispositivos.

9. Contribuição e Contato
Contribuições são bem-vindas!

Para sugerir melhorias, reportar bugs ou contribuir com código, abra uma issue ou envie um pull request.

Para dúvidas, sugestões ou colaborações, entre em contato com o autor:

👤 Alex Dyna
https://github.com/walterdyna
E-mail: wdyna@hotmail.com


