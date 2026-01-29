# 💰 Gestão de Orçamento

Módulo de planejamento e controle orçamentário da folha de pagamento.

---

## 📋 Visão Geral

Este módulo permite simular e gerenciar o impacto financeiro das movimentações salariais, garantindo a saúde financeira da empresa durante a implementação e manutenção do PCCS.

---

## ⚙️ Funcionalidades

- 📈 **Planos Orçamentários**: Criação de múltiplos cenários (Conservador, Moderado, Agressivo).
- 📊 **Análise por Departamento**: Distribuição de custos por centros de custo.
- 📉 **Real vs. Orçado**: Acompanhamento em tempo real da execução orçamentária.
- 🌓 **Headcount**: Gestão do quadro de pessoal planejado vs. atual.

---

## 📁 Estrutura de Dados (BudgetPlan)

| Campo | Descrição |
|-------|-----------|
| **Planned Budget** | Valor total destinado à folha de pagamento. |
| **Planned Headcount** | Número de colaboradores previsto. |
| **Impact Analysis** | Estimativa de custo para progressões previstas. |

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/orcamento/page.tsx` | Dashboard orçamentário e lista de planos |
| `/app/orcamento/plano/[id]/page.tsx` | Detalhamento de um plano específico |
| `/app/actions/budget.ts` | Server Actions de gestão orçamentária |
| `/components/budget/` | Componentes de gráficos e formulários de orçamento |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação do módulo de orçamento.
