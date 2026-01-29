# Actions de Servidor (Backend)

Este diretório contém a lógica de negócio e interações com o banco de dados via Prisma.

## Arquivos

### `settings.ts` (Configuração de Sistema e Encargos)
- **getTaxSettings**: Recupera configurações de taxas, mesclando padrões do sistema com customizações salvas no banco.
- **saveTax / deleteTax**: Gerenciamento granular de encargos, permitindo adição de novas linhas de custo (tanto para CLT quanto PJ).
- **Estratégia de Dados**: Utiliza o campo `description` do banco para armazenar metadados compostos (`Label|Description`), permitindo renomeação flexível de taxas.

### `career.ts` (Trilha de Carreira)
- **getCareerGraph**: Recupera cargos, conexões e coordenadas (X/Y) para o mapa.
- **updateNodePosition**: Salva permanentemente a posição dos cards no mapa.
- **createConnection / updateConnection / deleteConnection**: Gerencia os caminhos de promoção e seus requisitos.

### `simulations.ts` (Simulações Financeiras)
- **calculateEnquadramento**: O "coração" financeiro do sistema. Cruza a folha de pagamento atual com a Matriz Salarial.
- **Cálculo de Encargos Dinâmico**: Integração com `SystemConfig` para aplicar as taxas reais (CLT/PJ) configuradas pelo usuário, garantindo precisão e consistência entre dashboards e relatórios.
- **Cruzamento Automático**: Caso um cargo não esteja vinculado a uma Grade, o sistema utiliza a **Pontuação da Avaliação** para encontrar a Grade correspondente (baseado nos pontos Min/Max da Matriz).
- Regras aplicadas: Step A como piso, identificação de Red Circles e cálculo de Gap (impacto financeiro).

### `matrix-config.ts` (Configuração da Matriz)
- Gerencia a criação e edição de Grades (linhas) e Steps (colunas).

### `budget.ts` (Orçamento em Tempo Real) ✨ NOVO
- **getBudgetOverview(year)**: Retorna custo real por departamento vs metas definidas
- **saveDepartmentBudget()**: Salva meta de orçamento e headcount por departamento
- **Cálculo de Custos**: Soma salário + encargos dinâmicos + benefícios por funcionário

### `budget-plan.ts` (Planejamento Orçamentário) ✨ NOVO
- **getBudgetPlans()**: Lista todos os planos orçamentários
- **getBudgetPlanDetails(id)**: Detalhes com comparativo Planejado vs Realizado
- **createBudgetPlan()**: Criar novo plano (Anual, Semestral, Trimestral, Mensal)
- **upsertBudgetPlanItem()**: Adicionar/editar departamento no plano
- **deleteBudgetPlan() / deleteBudgetPlanItem()**: Exclusões
- **duplicateBudgetPlan()**: Copia plano para novo período
- **updateBudgetPlan()**: Altera status (Rascunho → Aprovado → Encerrado)

### `organization.ts` (Organograma) ✨ NOVO
- **getOrgChartData()**: Monta estrutura de nós e arestas para React Flow
- **updateOrgHierarchy(childId, parentId)**: Atualiza relação de reporte entre cargos
- **Algoritmo de Layout**: DFS para posicionamento automático da árvore

### `policy.ts` (Política PCCS) ✨ NOVO
- **getPolicyOverview()**: Agrega TODOS os dados do sistema
  - Totais: Funcionários, Cargos, Departamentos, Grades, Steps
  - Faixas salariais (min/média/max)
  - Encargos CLT e PJ com totais
  - Benefícios com contagem de beneficiários
  - Matriz salarial completa
  - Fatores de avaliação com níveis
  - Hierarquia de cargos
  - Estatísticas por departamento

### `job-descriptions.ts` (Descrições de Cargos)
- **getJobDescriptionsList()**: Lista todos os cargos com status das descrições
- **getJobDescriptionsStats()**: Estatísticas gerais (total, por status)
- **getJobDescription(jobRoleId)**: Obtém descrição completa de um cargo
- **saveJobDescription(jobRoleId, data)**: Salva/atualiza descrição
- **updateDescriptionStatus(jobRoleId, status)**: Workflow de aprovação
- **generateDescriptionTemplate(jobRoleId)**: Gera template automático baseado nos dados do cargo

### `competencies.ts` (Matriz de Competências) ✨ NOVO
- **getCompetenciesList()**: Lista todas as competências
- **getCompetency(id)**: Obtém competência completa com níveis
- **createCompetency(data)**: Cria competência com níveis padrão
- **updateCompetency(id, data)**: Atualiza competência
- **deleteCompetency(id)**: Exclui competência
- **getCompetencyMatrix()**: Matriz completa cargo x competência
- **getCompetencyMatrixStats()**: Estatísticas gerais
- **getJobCompetencies(jobRoleId)**: Competências de um cargo
- **addCompetencyToJob(...)**: Adiciona competência a cargo
- **updateJobCompetency(id, data)**: Atualiza nível/peso
- **removeCompetencyFromJob(id)**: Remove de cargo
- **generateDefaultCompetencies()**: Gera 12 competências padrão

---

## Última Atualização
**2026-01-28** - Adicionado módulo de Matriz de Competências
