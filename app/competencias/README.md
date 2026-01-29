# 🧠 Matriz de Competências

Módulo de gestão de competências organizacionais e mapeamento por cargo.

---

## 📋 Visão Geral

Este módulo permite definir as **competências** que a organização valoriza e mapear o **nível esperado** de cada competência para cada cargo, possibilitando análises de gap e desenvolvimento.

---

## ⚙️ Funcionalidades

### Gestão de Competências
- ➕ Cadastro de competências
- 📂 Categorização: Técnicas, Comportamentais, Organizacionais
- ⭐ Marcação de competências críticas
- 📊 Definição de níveis de proficiência

### Níveis de Proficiência
| Nível | Nome | Descrição |
|-------|------|-----------|
| 1 | Básico | Conhecimento introdutório |
| 2 | Intermediário | Aplica com supervisão |
| 3 | Avançado | Aplica de forma autônoma |
| 4 | Especialista | Referência na organização |
| 5 | Expert | Capacidade de ensinar e inovar |

### Matriz Cargo x Competência
- 📊 Grid visual de requisitos por cargo
- 🎯 Peso de cada competência para o cargo
- ✅ Indicação de obrigatória/desejável

### Análise de Gap
- 📈 Comparativo nível esperado vs atual
- 📉 Identificação de gaps de desenvolvimento
- 🎯 Priorização de treinamentos

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/competencias/page.tsx` | Lista de competências |
| `/app/competencias/[id]/page.tsx` | Detalhes de competência |
| `/app/competencias/cargo/[id]/page.tsx` | Competências de um cargo |
| `/components/competencies/competency-form.tsx` | Formulário |
| `/components/competencies/competency-list.tsx` | Lista |
| `/components/competencies/competency-levels.tsx` | Níveis |
| `/components/competencies/job-competency-matrix.tsx` | Matriz |
| `/components/competencies/competency-gap-analysis.tsx` | Análise de gap |
| `/components/competencies/competency-radar.tsx` | Gráfico radar |
| `/app/actions/competencies.ts` | Server Actions |

---

## 🗄️ Banco de Dados

### Competency
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome da competência |
| description | String? | Descrição detalhada |
| category | String | TECHNICAL / BEHAVIORAL / ORGANIZATIONAL |
| critical | Boolean | Se é competência crítica |

### CompetencyLevel
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| competencyId | String | FK para competência |
| level | Int | Ordem (1-5) |
| name | String | Nome do nível |
| description | String? | Descrição |
| indicators | String? | Indicadores observáveis |

### JobCompetency
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| jobRoleId | String | FK para cargo |
| competencyId | String | FK para competência |
| competencyLevelId | String | Nível esperado |
| required | Boolean | Obrigatória ou desejável |
| weight | Int | Peso na avaliação (1-5) |

---

## 📊 Exemplo de Matriz

| Cargo | Comunicação | Liderança | Excel | Python |
|-------|-------------|-----------|-------|--------|
| Auxiliar | Básico | - | Básico | - |
| Analista Jr | Intermediário | - | Intermediário | Básico |
| Analista Pl | Avançado | Básico | Avançado | Intermediário |
| Analista Sr | Avançado | Intermediário | Especialista | Avançado |
| Coordenador | Especialista | Avançado | Avançado | Intermediário |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação completa do módulo
