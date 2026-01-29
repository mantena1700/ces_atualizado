# 📁 app/orcamento

## Descrição
Módulo de **Gestão Orçamentária** do sistema PCCS. Permite criar, gerenciar e acompanhar planos orçamentários de pessoal.

## Estrutura

```
/orcamento
├── page.tsx           # Página principal com Tabs (Planos | Tempo Real)
└── /plano
    └── /[id]
        └── page.tsx   # Página de detalhes de um plano específico
```

## Funcionalidades

### Aba "Planos Orçamentários"
- **Criar Plano**: Novo plano (Anual, Semestral, Trimestral ou Mensal)
- **Visualizar**: Cards com resumo de cada plano (orçamento total, headcount)
- **Duplicar**: Copiar plano para próximo período
- **Excluir**: Remover plano

### Aba "Visão em Tempo Real"
- Dashboard com custo real por departamento (baseado na folha ativa)
- Barras de progresso de utilização

### Página de Detalhes (`/plano/[id]`)
- **Comparativo**: Planejado vs Realizado por departamento
- **KPIs**: Orçamento, Executado, Variância, Headcount
- **Adicionar/Editar**: Departamentos ao plano
- **Status**: Rascunho → Aprovado → Encerrado

## APIs Consumidas
- `getBudgetPlans()` - Lista planos
- `getBudgetPlanDetails(id)` - Detalhes com comparativo
- `createBudgetPlan()` - Criar plano
- `upsertBudgetPlanItem()` - Adicionar/editar item
- `deleteBudgetPlan()` - Excluir plano
- `duplicateBudgetPlan()` - Duplicar plano
- `getBudgetOverview()` - Visão tempo real

## Componentes Utilizados
- `BudgetPlanList` - Lista de planos em cards
- `BudgetPlanDetail` - Detalhes do plano com tabela comparativa
- `BudgetView` - Dashboard de tempo real

## Última Atualização
**2026-01-28** - Criação do módulo completo de planejamento orçamentário
