# Mix Chicken Gestão Pro

Sistema de gestão operacional para o Mix Chicken, desenvolvido para ser executado localmente no navegador (armazenamento via `localStorage`). Interface responsiva, com suporte a desktop e mobile.

## 📦 Módulos

- **Dashboard** – Indicadores financeiros, gráficos de faturamento/custos, estrutura de custos, mais vendidos e vendas por produto (últimos 30 dias).
- **Vendas** – Registro de vendas com baixa automática de estoque, histórico e ticket médio.
- **Financeiro** – Lançamentos de entradas/saídas, fluxo de caixa e resultado.
- **Compras** – Registro de compras de insumos, atualização de preço e estoque.
- **Insumos** – Cadastro de ingredientes com fornecedor, estoque mínimo e **preços de mercado** (até 3 fornecedores com valores).
- **Estoque** – Posição atual, valorização e movimentações (entrada, saída, perda).
- **Fichas técnicas** – Produtos com receita, custo, CMV, markup e **imagem (PNG/JPG até 500×500)** com controles de **zoom** (+ / − / reset).
- **Produtos** – Catálogo com preço, custo, margem e vendidos.
- **Relatórios** – Rentabilidade por produto e indicadores gerenciais.
- **Vendas por produto** – Gráfico e tabela com quantidade e valor vendido nos últimos 30 dias.
- **Configurações** – Custos fixos, alvo de faturamento, backup/restauração e reset de dados.

## ✨ Novidades (versão atual)

- **Upload de imagem por produto** – Envie imagens PNG ou JPEG (redimensionadas automaticamente para no máximo 500×500 pixels) e visualize nos cards das fichas técnicas.
- **Zoom nas imagens** – Botões para ampliar, reduzir ou resetar o zoom (estado persistente por produto).
- **Filtro de período personalizado** – No seletor de período do Dashboard, opção "Personalizado" com dois campos de data (calendário) para filtrar transações.
- **Preços de mercado em insumos** – Cada insumo pode armazenar até 3 pares (fornecedor + preço), exibidos na tabela de insumos para comparação.
- **Vendas por produto (últimos 30 dias)** – Novo menu "Vendas mês" com gráfico e tabela detalhada; o mesmo gráfico também aparece no Dashboard.

## 🚀 Como usar

1. Clone o repositório ou baixe os arquivos.
2. Abra o arquivo `index.html` em qualquer navegador moderno (não é necessário servidor).
3. Todos os dados ficam salvos no `localStorage` do navegador.
4. Use os botões de **Backup** e **Restaurar** para exportar/importar dados em JSON.

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript (ES6+)
- [Chart.js](https://www.chart.js/) para gráficos
- `localStorage` para persistência
- Canvas para redimensionamento de imagens

## 📁 Estrutura de dados

Os dados são armazenados no objeto `S` com as seguintes chaves:

- `config` – `{ labor, fixed, target }`
- `ingredients` – array com `id, name, unit, price, supplier, stock, min, marketPrices[]`
- `products` – array com `id, name, price, recipe[{i, q}], sold, image` (base64)
- `sales` – array com `{ id, date, product, qty }`
- `transactions` – array com `{ id, date, type, cat, desc, value }`
- `purchases` – array com `{ id, date, i, q, unit, supplier }`

## 🔄 Próximos passos (para produção)

- Migrar para banco de dados com autenticação (multi-usuário).
- Separar CMV teórico do contábil (estoque inicial + compras − estoque final).
- Adicionar níveis de permissão e auditoria.
- Integração com APIs de fornecedores para atualização automática de preços.

---

**Desenvolvido para gestão do Mix Chicken.**  
Qualquer dúvida ou sugestão, entre em contato.
