# 💰 Matriz Salarial

Módulo de configuração e gestão da estrutura de remuneração (Grades e Steps).

---

## 📋 Visão Geral

Este módulo permite configurar a **Matriz Salarial** da organização, definindo as faixas de remuneração (Grades) e os degraus de progressão horizontal (Steps).

---

## 📊 Conceitos

### Grade (Faixa Vertical)
- Representa um **nível de complexidade** na estrutura
- Determinado pela **pontuação** do cargo
- Cada grade tem um intervalo mínimo e máximo de pontos
- Exemplo: Grade 5 = Analista Pleno

### Step (Faixa Horizontal)
- Representa a **progressão por mérito** dentro da grade
- Geralmente calculado com percentual incremental (ex: +5%)
- Exemplo: Step A, B, C, D, E

### Célula da Matriz (Grid)
- Interseção Grade × Step = Valor do salário
- Exemplo: Grade 5 + Step C = R$ 5.250,00

---

## ⚙️ Funcionalidades

### Configuração de Grades
- ➕ Criar novas grades
- ✏️ Definir faixa de pontuação
- 🎨 Nomear (ex: "Operacional", "Tático", "Estratégico")

### Configuração de Steps
- ➕ Criar steps (A, B, C ou 1, 2, 3)
- 📈 Definir progressão percentual
- ⚡ "Varinha Mágica": Gera steps automaticamente

### Tabela Visual
- 📊 Grid completo Grade × Step
- 💰 Valores editáveis
- 🎨 Destaque de midpoint (ponto médio)

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/matriz/page.tsx` | Página principal |
| `/components/matrix-table.tsx` | Tabela da matriz |
| `/components/matrix-toolbar.tsx` | Barra de ferramentas |
| `/components/grades-config-modal.tsx` | Modal de configuração |
| `/app/actions/steps.ts` | Server Actions de steps |
| `/app/actions/salary.ts` | Server Actions de grades |

---

## 🗄️ Banco de Dados

### SalaryGrade
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome da grade |
| minPoints | Int | Pontuação mínima |
| maxPoints | Int | Pontuação máxima |

### SalaryStep
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome do step (A, B, C...) |
| percentage | Float? | Percentual de incremento |

### SalaryGrid
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| gradeId | String | FK para grade |
| stepId | String | FK para step |
| amount | Decimal | Valor do salário |

---

## 📐 Exemplo de Matriz

| Grade | Step A | Step B (+5%) | Step C (+10%) | Step D (+15%) | Step E (+20%) |
|-------|--------|--------------|---------------|---------------|---------------|
| 1 | R$ 2.000 | R$ 2.100 | R$ 2.200 | R$ 2.300 | R$ 2.400 |
| 2 | R$ 2.800 | R$ 2.940 | R$ 3.080 | R$ 3.220 | R$ 3.360 |
| 3 | R$ 3.800 | R$ 3.990 | R$ 4.180 | R$ 4.370 | R$ 4.560 |
| 4 | R$ 5.000 | R$ 5.250 | R$ 5.500 | R$ 5.750 | R$ 6.000 |
| 5 | R$ 6.500 | R$ 6.825 | R$ 7.150 | R$ 7.475 | R$ 7.800 |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação completa do módulo
