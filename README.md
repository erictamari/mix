# Mix Chicken — Gestão Profissional

Aplicação web estática para gestão operacional de restaurante, preparada para GitHub Pages.

## Arquivos

- `index.html` — estrutura das telas.
- `style.css` — visual responsivo para computador e celular.
- `app.js` — regras de negócio, cálculos, gráficos e persistência.
- `README.md` — documentação.

## Funcionalidades desta versão

### Financeiro
- Entradas/receitas: Dinheiro, Cartão, Pix, Goomer, iFood, WhatsApp e Outros.
- Despesas: Mercado, Boletos, Park Container, Freelancer, Juros, Coolt, Taon, Contabilidade, Copel, Internet e Outros.
- Cadastro livre de novas categorias de receita e despesa.
- Data de lançamento, vencimento, status pago/pendente, descrição e valor.
- Planner semanal com entrada, saída, saldo e valores a vencer por dia.
- Resumo por forma de receita e categoria de despesa.

### Insumos
- Alimentos, embalagens, limpeza, bebidas, administrativo e categorias personalizáveis.
- Unidade de referência: kg, g, L, ml, un, cx, pct e outras extensíveis no código.
- Peso bruto e líquido.
- Valor bruto e líquido.
- Fornecedor principal.
- Comparação de até quatro fornecedores/preços por produto.
- Estoque mínimo e estoque atual.

### Fichas técnicas
- Imagem do produto.
- Zoom da imagem.
- Descrição da receita.
- Ingredientes e quantidades.
- Rendimento.
- CMO por unidade.
- Custo de embalagem.
- Custo dos ingredientes.
- Custo total.
- CMV.
- Markup.
- Margem unitária.

### Vendas por produto
- Registro de quantidade vendida por data.
- Pesquisa por produto.
- Comparação de mês atual com outro mês.
- Identificação de produtos que cresceram, caíram ou ficaram iguais.
- Exportação CSV.

### Dashboard
- Faturamento x custos.
- Estrutura de custos.
- Vendas de produtos x compras de insumos.
- Ranking de produtos mais vendidos.
- Comparativo de um produto específico nos últimos meses.
- Alertas de estoque.

## Persistência e compatibilidade

Os dados são gravados em `localStorage` na chave `mixPro`. A versão nova faz migração automática dos dados da versão anterior, adicionando os novos campos sem apagar os cadastros existentes.

O sistema continua sendo um aplicativo front-end. Portanto, o armazenamento é local ao navegador/dispositivo. Para trabalhar com os mesmos dados automaticamente em vários celulares/computadores será necessário adicionar um banco de dados e autenticação, como Firebase, Supabase ou outro backend.

## Publicação no GitHub Pages

1. Substitua `index.html`, `app.js`, `style.css` e `README.md` pelos arquivos desta versão.
2. Faça Commit Changes.
3. Aguarde a publicação do GitHub Pages.
4. Se o navegador mostrar uma versão antiga, faça recarregamento forçado ou limpe o cache do site.
5. Antes de trocar de versão, use o botão **Backup** dentro do sistema para baixar `mix-chicken-backup.json`.

## Observação importante sobre os dados atuais

O código não redefine automaticamente o `localStorage` existente. Ele preserva os objetos já cadastrados e apenas cria os campos que não existiam. O botão **Restaurar demonstração** é o único fluxo normal que substitui os dados atuais por dados de demonstração.
