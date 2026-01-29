# 📊 Avaliação de Desempenho

Módulo de gestão de ciclos avaliativos e avaliação de colaboradores.

---

## 📋 Visão Geral

Este módulo gerencia todo o processo de **Avaliação de Desempenho**, desde a criação de ciclos avaliativos até o registro de notas e feedback para cada colaborador.

---

## ⚙️ Funcionalidades

### Ciclos de Avaliação
- ➕ Criação de ciclos (Anual, Semestral, etc.)
- 📅 Definição de período (início/fim)
- 🔄 Status: Planejamento → Aberto → Em Revisão → Fechado
- 👥 Vínculo automático de funcionários elegíveis

### Avaliação Individual
- 📝 Formulário estruturado
- 🎯 Avaliação por competências
- 📈 Avaliação por metas/resultados
- 💬 Campos de feedback (pontos fortes, melhorias)
- ⭐ Nota final calculada (1-5)

### Dashboard
- 📊 Progresso do ciclo atual
- 📈 Distribuição de notas
- 👥 Pendências por avaliador
- 📋 Histórico de avaliações

---

## 📐 Escala de Avaliação

| Nota | Descrição | Significado |
|------|-----------|-------------|
| 5 | Excepcional | Supera consistentemente as expectativas |
| 4 | Acima do Esperado | Frequentemente supera as expectativas |
| 3 | Atende às Expectativas | Entrega conforme esperado |
| 2 | Parcialmente Atende | Necessita desenvolvimento |
| 1 | Não Atende | Desempenho insatisfatório |

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/avaliacao/page.tsx` | Lista de ciclos e dashboard |
| `/app/avaliacao/[id]/page.tsx` | Detalhes de avaliação |
| `/components/evaluation-wizard.tsx` | Wizard de avaliação |
| `/components/performance/performance-dashboard.tsx` | Dashboard |
| `/components/performance/evaluation-form.tsx` | Formulário |
| `/components/performance/cycle-manager.tsx` | Gerenciador de ciclos |
| `/app/actions/performance.ts` | Server Actions |

---

## 🗄️ Banco de Dados

### PerformanceCycle
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome do ciclo |
| startDate | DateTime | Início do período |
| endDate | DateTime | Fim do período |
| description | String? | Descrição |
| active | Boolean | Se é o ciclo ativo |
| status | String | PLANNING / OPEN / REVIEW / CLOSED |

### PerformanceEvaluation
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| employeeId | String | FK para funcionário |
| cycleId | String | FK para ciclo |
| jobRoleId | String | Cargo no momento (snapshot) |
| status | String | PENDING / IN_PROGRESS / SUBMITTED / REVIEWED / DONE |
| finalScore | Float? | Nota final (0-5) |
| feedback | String? | Feedback geral |
| strengths | String? | Pontos fortes |
| improvements | String? | Pontos a melhorar |

### EvaluationItem
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| evaluationId | String | FK para avaliação |
| type | String | COMPETENCY / GOAL / VALUES |
| competencyId | String? | FK para competência |
| weight | Int | Peso do item |
| score | Float? | Nota (1-5) |
| comments | String? | Comentários |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação completa do módulo
