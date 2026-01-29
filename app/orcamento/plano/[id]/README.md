# 📁 app/orcamento/plano/[id]

## Descrição
Página dinâmica para exibir os **detalhes de um Plano Orçamentário específico**.

## Rota
```
/orcamento/plano/:id
```

O parâmetro `[id]` é o UUID do plano no banco de dados.

## Funcionalidades

### Visualização
- **KPIs Gerais**: Orçamento Planejado, Executado, Variância, Headcount
- **Tabela Comparativa**: Por departamento, mostrando Planejado vs Realizado
- **Barras de Progresso**: Indicador visual de consumo do orçamento
- **Status por Departamento**: Regular (verde), Atenção (amarelo), Estourado (vermelho)

### Ações
- **Adicionar Departamento**: Modal para inserir novo item no plano
- **Editar Departamento**: Alterar verba/headcount planejado
- **Remover Departamento**: Excluir item do plano
- **Mudar Status do Plano**:
  - Rascunho → Aprovado
  - Aprovado → Encerrado
  - Aprovado → Voltar para Rascunho

## APIs Consumidas
- `getBudgetPlanDetails(id)` - Carrega plano com comparativo
- `getAvailableDepartments()` - Lista departamentos para dropdown
- `upsertBudgetPlanItem()` - Salvar item
- `deleteBudgetPlanItem()` - Remover item
- `updateBudgetPlan()` - Alterar status

## Componente Principal
- `BudgetPlanDetail` (de `@/components/budget/budget-plan-detail.tsx`)

---

## Última Atualização
**2026-01-28** - Criação da página de detalhes do plano
