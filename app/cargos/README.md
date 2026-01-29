# 💼 Cargos e Avaliação

Módulo de gestão e avaliação de cargos por método de pontos (Point Factor Method).

---

## 📋 Visão Geral

Este módulo implementa o sistema de **Avaliação de Cargos por Fatores**, onde cada cargo é pontuado em diferentes dimensões (escolaridade, experiência, complexidade, etc.) para determinar seu posicionamento na estrutura salarial.

---

## ⚙️ Funcionalidades

### Gestão de Cargos
- ➕ Cadastro de novos cargos
- ✏️ Edição de informações (título, departamento, área, CBO)
- 🗑️ Exclusão segura

### Avaliação por Fatores
- 📊 Grid de fatores x níveis
- 🎯 Seleção de nível para cada fator
- 📈 Cálculo automático de pontuação total
- 🏆 Classificação automática em Grade

### Visualização
- 📋 Tabela de cargos com pontuação
- 🎨 Indicadores visuais de grade
- 🔍 Filtros por departamento/área

---

## 📐 Sistema de Pontos

### Fatores de Avaliação (Exemplo)

| Fator | Peso | Níveis |
|-------|------|--------|
| Escolaridade | 25% | Fundamental → Pós-Graduação |
| Experiência | 20% | 0-1 ano → 10+ anos |
| Complexidade | 20% | Rotineira → Estratégica |
| Responsabilidade | 20% | Individual → Organizacional |
| Autonomia | 15% | Supervisionada → Total |

### Fórmula de Cálculo
```
Pontuação Total = Σ (Pontos do Nível × Peso do Fator)
```

### Classificação em Grades
| Pontuação | Grade |
|-----------|-------|
| 0 - 100 | Grade 1 (Auxiliar) |
| 101 - 200 | Grade 2 (Assistente) |
| 201 - 350 | Grade 3 (Analista Jr) |
| 351 - 500 | Grade 4 (Analista Pl) |
| 501+ | Grade 5+ |

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/cargos/page.tsx` | Página principal do módulo |
| `/components/job-form.tsx` | Formulário de cargo |
| `/components/evaluation-grid.tsx` | Grid de avaliação por fatores |
| `/components/factors-manager.tsx` | Gerenciador de fatores |
| `/app/actions/jobs.ts` | Server Actions de cargos |
| `/app/actions/factors.ts` | Server Actions de fatores |

---

## 🗄️ Banco de Dados

### JobRole
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| title | String | Título do cargo |
| department | String? | Departamento |
| area | String? | Área específica |
| cbo | String? | Código CBO |
| totalPoints | Int | Pontuação calculada |
| gradeId | String? | FK para Grade salarial |
| reportsToId | String? | FK para cargo superior |

### Factor
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome do fator |
| description | String? | Descrição |
| weight | Float | Peso (0.0 - 1.0) |

### FactorLevel
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| factorId | String | FK para fator |
| level | Int | Ordem (1, 2, 3...) |
| description | String | Descrição do nível |
| points | Int | Pontos do nível |

### JobScore
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| jobRoleId | String | FK para cargo |
| factorLevelId | String | FK para nível selecionado |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação atualizada
