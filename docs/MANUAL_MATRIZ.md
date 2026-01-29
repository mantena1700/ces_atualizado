# Manual da Matriz Salarial (PCCS NextGen)

Este módulo é o coração financeiro do sistema. Ele permite definir quanto vale cada cargo na prática.

## Conceitos Chave

1.  **Grades (Níveis Verticais):**
    *   Representam o peso do cargo (pontuação Hay/Mercer).
    *   Ex: G-01 (Operacional), G-05 (Gerência).
    *   Cada grade tem um `minPoints` e `maxPoints` definidos na Avaliação de Cargos.

2.  **Steps (Progressão Horizontal):**
    *   Letras (A, B, C, D, E...) que representam a evolução salarial dentro do MESMO cargo.
    *   Geralmente por mérito ou tempo de casa.
    *   O sistema assume por padrão uma progressão de **5%** entre cada step ao usar a "Varinha Mágica".

3.  **Midpoint (Step A):**
    *   É a âncora salarial. O valor de mercado para aquele nível de complexidade.

## Funcionalidades

### 1. Mapa de Grades e Steps
Acesse `/matriz`. Você verá uma tabela onde:
*   **Linhas:** Grades.
*   **Colunas:** Steps.
*   **Células:** Valor em Reais (R$).
*   **Edição:** Clique em qualquer valor para digitar manualmente. Pressione `Enter` ou clique fora para salvar (salvamento automático).

### 2. Cálculo Automático (Varinha Mágica 🪄)
Ao lado direito de cada linha, há um botão com ícone de varinha.
1.  Defina o valor do **Step A** manualmente.
2.  Clique na Varinha.
3.  O sistema preencherá automaticamente os Steps B até E com juros compostos de 5% (padrão configurado no código).

### 3. Reajuste Geral (Dissídio)
Botão azul "Simular Reajuste Geral" no topo.
*   Permite aplicar uma porcentagem (ex: `4.5`%) em **TODOS** os valores da tabela de uma só vez.
*   Útil para correções inflacionárias anuais.

### 4. Configuração de Grades
Botão "Configurar Grades".
*   Permite renomear grades (Ex: mudar "Grade 01" para "Auxiliar").
*   Ajustar faixas de pontuação.
*   Criar novas grades ou excluir existentes (se não tiverem cargos vinculados).

## Estrutura Técnica (Para Desenvolvedores)

*   **Tabela BD:** `SalaryGrid` (gradeId, stepId, amount).
*   **Server Actions:** `app/actions/matrix.ts` (CRUD célula) e `app/actions/matrix-bulk.ts` (Reajuste em massa).
*   **Front:** `MatrixTable` (Componente visual) e `MatrixToolbar` (Botões de ação).
