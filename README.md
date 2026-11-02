## Compra local com o backend Express

Login/cadastro JWT, catálogo, carrinho, endereços, checkout e histórico agora usam
o backend em `http://localhost:3003/api`. Inicie `npm run dev` no backend e neste
frontend e abra `http://localhost:3000/customer/register` para começar.
O pagamento é apenas simulado; nenhum dado de cartão é necessário.

Veja o [guia da compra local](https://github.com/pedrofalcaos/folcstore-backend/blob/main/docs/compra-local.md).
Sessões e cadastros antigos do json-server precisam de novo login/cadastro no Express.
Use `NEXT_PUBLIC_BACKEND_URL` para configurar a URL. Os comandos e endpoints legados
descritos abaixo ainda são referência das funcionalidades não migradas.

Testes: `npm run test:recommendations`, `npm run test:e2e` (Chrome instalado e backend
em pasta irmã) e `npm run build`.

<div align="center">

# 🏺 FolcStore — Marketplace de Artesanato

**Plataforma de comércio eletrônico para valorização e comercialização da produção artesanal regional**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-v3-319795?style=for-the-badge&logo=chakraui&logoColor=white)](https://chakra-ui.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

</div>

---

## 📖 Descrição

O **FolcStore** é um marketplace desenvolvido para conectar mestres e cooperativas de artesanato diretamente a compradores em escala nacional. No comércio tradicional de artesanato, pequenos produtores enfrentam barreiras severas de visibilidade, dispersão de catálogo e perda de margem de lucro para intermediários. 

A aplicação soluciona esses problemas ao estruturar:
* **Vitrine Cultural Especializada:** Descoberta de produtos categorizados por técnicas tradicionais (cerâmica, xilogravura, renda de bilro, marcenaria), matéria-prima e região de produção.
* **Canal Direto do Artesão:** Painel com gestão de catálogo com suporte a obras únicas (estoque único e imutável) e produção em lote (com prazos específicos de fabricação), além do fluxo de fulfillment (declaração de envio e registro de rastreio).
* **Experiência de Compra Integrada:** Carrinho persistente, gestão de múltiplos endereços de entrega, pagamento simulado multimeios (Pix e Cartão de Crédito) e módulo de avaliações pós-entrega com impacto direto na reputação do artesão.

---

## 👥 Integrantes

* **Enzo Amorim** — Full Stack Developer
* **Heitor Jalfim** — Full Stack Developer & Techleader
* **Luiz Xavier** — Full stack Developer & UI/UX
* **Manoel Henrique** — Full Stack Developer & Arquiteto de banco de dados
* **Paulo Nery da Fonseca** — Full Stack Developer
* **Rodrigo Souza** — Full Stack Developer & DevOps
* **Thomaz Barros** — Administrador de banco de dados 
* **

---

## 🛠️ Tecnologias Utilizadas

### Frontend
* **Framework:** Next.js 16 (App Router com Turbopack)
* **Biblioteca Base:** React 19
* **Linguagem:** TypeScript
* **Design System & Componentes:** Chakra UI v3, Emotion e React Icons
* **Gerenciamento de Estado:** Zustand (com middleware `persist` via LocalStorage para sessão e carrinho)
* **Cliente HTTP:** Axios

### Backend & Persistência
* **Fase Atual (Avaliação 1 - Mock API):** Fake REST API estruturada sobre o `json-server` (v0.17.4), utilizando isolamento de dados via `base-db.json` e `running-db.json`, com reescrita de rotas RESTful através de `routes.json`.
* **Arquitetura Alvo (Planejada para Avaliação 2):** Backend desacoplado em **Node.js** com API RESTful estruturada e persistência relacional em **PostgreSQL**.
* **Autenticação:** Simulação client-side com persistência de tokens/sessão por papéis de acesso (*Customer*, *Artesao* e *Admin*).

### Infraestrutura
* **Plataforma de Nuvem:** Render Cloud Services
* **Ambiente de Execução:** Contêineres Node.js independentes para Frontend e API
* **Versionamento e CI/CD:** Git & GitHub

---

## 💻 Como Executar Localmente

### Pré-requisitos
* **Node.js:** Versão 20.x ou superior instalada
* **npm:** Versão 10.x ou superior

### 1. Clonagem e Dependências
bash
git clone [https://github.com/heitorjalfim/FolcStore.git](https://github.com/heitorjalfim/FolcStore.git)
cd FolcStore
npm install


### 2. Inicialização da Base de Dados Local
O script cria uma instância limpa da base de execução (running-db.json) a partir do gabarito inicial (base-db.json):

npm run produzirDB

### 3. Execução Concorrente da Aplicação
O comando inicia simultaneamente o servidor frontend do Next.js (porta 3000) e a API do json-server (porta 3001):

npm run dev:full

A saber:
Frontend Web: http://localhost:3000
Endpoints da API: http://localhost:3001

## Variáveis de Ambiente
A aplicação utiliza uma variável pública para orientar a camada de serviços HTTP (src/services/apiService.ts) quanto ao endereço da API REST, adaptando-se automaticamente entre os ambientes local e de produção.

## ✨ Funcionalidades Implementadas

### 🛍️ Comprador (Cliente)
[x] Vitrine e Catálogo: Listagem dinâmica com filtros por categoria, busca textual com debounce e paginação simulada.   
[x] Detalhes da Peça: Página de produto com galeria de imagens, especificações da técnica regional e cálculo de estoque restante em tempo real.   
[x] Carrinho Drawer: Carrinho de compras lateral persistente no navegador com controle de quantidade e exclusão.   
[x] Checkout em 2 Etapas: Gestão de múltiplos endereços de entrega e simulação de pagamento via Cartão de Crédito e Pix.   
[x] Acompanhamento de Pedidos: Central "Meus Pedidos" com rastreio de envio, confirmação de recebimento e envio de avaliações (nota 0 a 10 com comentário de até 2000 caracteres).   

### 🏺 Artesão (Vendedor)
[x] Autenticação e Perfil: Cadastro e login com vínculo de polo regional de produção.   
[x] Gestão de Vendas (Fulfillment): Listagem de compras recebidas com dados de entrega do cliente e funcionalidade de declarar envio com código de postagem.   
[x] Cadastro Diferenciado de Produtos: Formulários com live-preview para Peça Única (estoque travado em 1) e Produção em Lote (estoque variável e prazo de fabricação).   
[x] Manutenção de Catálogo: Edição rápida de preços e descrições com validações numéricas estritas.   

### 📊 Administrador

[x] Painel de Controle: Métricas agregadas de faturamento bruto, total de transações, peças comercializadas e entregas pendentes.   
[x] Proteção de Rotas: Bloqueio de acesso para usuários não autenticados.

## 📡 Rotas da API (Fake REST API)
A API simula o prefixo /api/v1/ através do roteamento configurado em routes.json:

## Rotas da API

| Método | Endpoint | Descrição | Parâmetros / Corpo |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Lista todos os produtos cadastrados no catálogo | `q` (busca textual), `categoria`, `idArtesao` |
| `GET` | `/products/:id` | Retorna os detalhes de um produto específico | `id` (parâmetro de rota) |
| `POST` | `/products` | Cadastra um novo produto (peça única ou lote) | Objeto JSON com dados completos da peça |
| `PATCH`| `/products/:id` | Atualiza campos parciais do produto (preço, descrição) | Objeto JSON com os campos a modificar |
| `GET` | `/artesaos` | Consulta a listagem de artesãos cadastrados | `email`, `senha` (para autenticação)[cite: 3] |
| `GET` | `/artesaos/:id` | Retorna o perfil completo e biografia de um artesão | `id` (parâmetro de rota) |
| `GET` | `/customers` | Consulta dados de compradores cadastrados | `email`, `senha` (para autenticação)[cite: 3] |
| `GET` | `/orders` | Consulta histórico de pedidos e vendas | `idComprador`, `idArtesao` |
| `POST` | `/orders` | Registra uma nova compra realizada no checkout | Objeto JSON com comprador, endereço, itens e pagamento |
| `PATCH`| `/orders/:id` | Atualiza o status do pedido ou insere código de envio | `situacaoEntrega`, `codigoPostagem`, `avaliado` |
| `GET` | `/avaliacoes` | Lista comentários e notas de avaliação por produto | `idProduto`, `idArtesao` |
| `POST` | `/avaliacoes` | Registra uma nova avaliação de comprador | Objeto JSON com nota (0 a 10) e comentário textual |
| `GET` | `/admins` | Consulta perfis com permissões administrativas | `email`, `senha`[cite: 3] |

## 🌐 Deploy
A publicação da aplicação é realizada no Render Cloud Services, utilizando uma topologia de dois serviços independentes para garantir o desacoplamento arquitetural entre a interface e os dados:

### 1. Serviço de Backend (Fake API)
    Plataforma: Render (Web Service - Node Runtime)

    Comando de Build: npm install

    Comando de Execução: npm run start:api

    URL Pública do Serviço: https://folcstore-api.onrender.com

    Endpoint de Teste Direto: https://folcstore-api.onrender.com/products

### 2. Serviço de Frontend (Aplicação Next.js)
    Plataforma: Render (Web Service - Node Runtime)

    Comando de Build: npm install && npm run build

    Comando de Execução: npm start

    Variável Injetada no Build: NEXT_PUBLIC_API_URL=https://folcstore-api.onrender.com

    URL Pública da Aplicação: https://folcstore-web.onrender.com

### 🎥 Evidências e Demonstração
## 📺 Vídeo Demonstrativo
Assista à demonstração dos fluxos completos de compra, cadastro de produtos e gestão de entregas:

🔗 Vídeo Demonstrativo no YouTube: https://youtu.be/_nkHeusjHcM
