# 📁 components/budget

## Descrição
Componentes React para o módulo de **Gestão Orçamentária**. Inclui visualizações de planos, comparativos e dashboards.

## Componentes

### `budget-view.tsx`
**Dashboard de Tempo Real**
- Cards de resumo (Orçamento, Executado, Headcount)
- Tabela de departamentos com barras de progresso
- Status visual (Regular, Atenção, Estourado)
- Modal de edição de metas por departamento

**Props:**
```typescript
interface BudgetViewProps {
    initialData: BudgetOverviewItem[];
    year: number;
}
```

---

### `budget-plan-list.tsx`
**Lista de Planos Orçamentários**
- Cards com KPIs (Orçamento Total, Headcount)
- Modal de criação de novo plano
- Modal de duplicação de plano
- Ações: Abrir, Duplicar, Excluir

**Props:**
```typescript
interface BudgetPlanListProps {
    plans: BudgetPlanDTO[];
}
```

---

### `budget-plan-detail.tsx`
**Detalhes do Plano (Comparativo)**
- Cards de resumo (Planejado, Executado, Variância, Headcount)
- Tabela comparativa por departamento
- Barras de progresso de utilização
- Status por linha (Regular, Atenção, Estourado)
- Modal de adicionar/editar departamento
- Controle de status do plano (Rascunho → Aprovado → Encerrado)

**Props:**
```typescript
interface BudgetPlanDetailProps {
    plan: BudgetPlanDetailDTO;
    availableDepartments: string[];
}
```

## Design
- **Cores**: Gradientes blue/indigo para destaque, slate para neutros
- **Status**: Emerald (OK), Amber (Atenção), Rose (Estourado)
- **Tipografia**: Font-black para números, uppercase para labels

## Última Atualização
**2026-01-28** - Criação dos componentes de orçamento
