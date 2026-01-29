# 📘 PCCS DOM SEVEN - NextGen

<div align="center">

![Version](https://img.shields.io/badge/version-2026.1-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![License](https://img.shields.io/badge/license-Proprietary-red?style=for-the-badge)

**Sistema Avançado de Gestão Estratégica de Cargos e Salários**

*Plataforma completa para estruturação, avaliação e gestão de políticas de remuneração*

</div>

---

## 🎯 Visão Geral

O **PCCS DOM Seven** é uma plataforma enterprise desenvolvida para modernizar a engenharia de RH, permitindo que organizações definam, avaliem e gerenciem sua estrutura salarial baseada em dados, complexidade e equidade interna.

### Principais Benefícios

- ✅ **Transparência** - Regras claras de progressão e remuneração
- ✅ **Equidade Interna** - Cargos de mesma complexidade = mesma faixa salarial
- ✅ **Competitividade** - Salários alinhados ao mercado
- ✅ **Meritocracia** - Valorização do desempenho e competências
- ✅ **Compliance** - Aderência à legislação trabalhista brasileira

---

## 🛠 Módulos do Sistema

### 📊 Estrutura Organizacional
| Módulo | Descrição |
|--------|-----------|
| **Organograma** | Visualização hierárquica interativa (React Flow) |
| **Colaboradores** | Gestão completa de funcionários com dados pessoais, contratuais e financeiros |
| **Importação** | Upload em massa de dados de funcionários via JSON |

### 💼 Gestão de Cargos
| Módulo | Descrição |
|--------|-----------|
| **Cargos e Avaliação** | Avaliação por fatores (Point Factor Method) |
| **Descrições de Cargos** | Documentação detalhada de cada posição |
| **Matriz de Competências** | Mapeamento de competências por cargo |
| **Grafo de Carreira** | Trilhas de sucessão e progressão visual |
| **Avaliação de Desempenho** | Ciclos avaliativos com escala 1-5 |

### 💰 Remuneração & Folha
| Módulo | Descrição |
|--------|-----------|
| **Matriz Salarial** | Configuração de Grades e Steps |
| **Tabela Salarial** | Consulta oficial de faixas salariais |
| **Gestão de Orçamento** | Planejamento e controle orçamentário |
| **Simulações** | Análise de cenários e impacto financeiro |

### 📋 Planejamento & Políticas
| Módulo | Descrição |
|--------|-----------|
| **Manual Completo** | Documento oficial com todos os capítulos do PCCS |
| **Política PCCS** | Anexos e regras específicas |
| **Cronograma** | Fases de implementação do plano |

### ⚙️ Sistema
| Módulo | Descrição |
|--------|-----------|
| **Configurações** | Parâmetros fiscais, benefícios e ajustes gerais |

---

## 💻 Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15      │  React 19        │  TypeScript 5         │
│  Tailwind CSS    │  Lucide Icons    │  React Flow           │
│  Shadcn/UI       │  Radix UI        │  CSS Modules          │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│  Server Actions  │  API Routes      │  Prisma ORM           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
├─────────────────────────────────────────────────────────────┤
│  SQLite (Dev)    │  PostgreSQL (Prod - Opcional)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
pccs-nextgen/
├── app/                    # Rotas e páginas (Next.js App Router)
│   ├── actions/            # Server Actions (CRUD)
│   ├── avaliacao/          # Avaliação de Desempenho
│   ├── cargos/             # Gestão de Cargos
│   ├── carreira/           # Grafo de Carreira
│   ├── colaboradores/      # Gestão de Funcionários
│   ├── competencias/       # Matriz de Competências
│   ├── configuracoes/      # Configurações do Sistema
│   ├── cronograma/         # Cronograma de Implementação
│   ├── descricoes/         # Descrições de Cargos
│   ├── importar/           # Importação de Dados
│   ├── manual/             # Manual de Cargos e Salários
│   ├── matriz/             # Matriz Salarial
│   ├── orcamento/          # Gestão Orçamentária
│   ├── organograma/        # Organograma
│   ├── politica/           # Política PCCS
│   ├── simulacoes/         # Simulações Financeiras
│   └── tabela/             # Tabela Salarial
├── components/             # Componentes React reutilizáveis
│   ├── ui/                 # Componentes base (Shadcn)
│   ├── budget/             # Componentes de Orçamento
│   ├── career/             # Componentes de Carreira
│   ├── competencies/       # Componentes de Competências
│   ├── job-descriptions/   # Componentes de Descrições
│   ├── manual/             # Componentes do Manual
│   ├── performance/        # Componentes de Avaliação
│   ├── policy/             # Componentes de Política
│   └── settings/           # Componentes de Configurações
├── lib/                    # Utilitários e configurações
├── prisma/                 # Schema e migrações do banco
└── public/                 # Assets estáticos
```

---

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/mantena1700/ces_atualizado.git
cd pccs-nextgen

# 2. Instale as dependências
npm install

# 3. Configure o banco de dados
npx prisma db push
npx prisma generate

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Acesso
Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📖 Documentação

Cada módulo possui seu próprio README.md com detalhes específicos:

- [📁 /app/README.md](./app/README.md) - Estrutura de rotas
- [📁 /components/README.md](./components/README.md) - Componentes React
- [📁 /lib/README.md](./lib/README.md) - Utilitários
- [📁 /prisma/README.md](./prisma/README.md) - Schema do banco

---

## 📊 Schema do Banco de Dados

### Modelos Principais

| Modelo | Descrição |
|--------|-----------|
| `Factor` / `FactorLevel` | Fatores de avaliação de cargos |
| `JobRole` | Cargos da organização |
| `JobDescription` | Descrições detalhadas de cargos |
| `JobScore` | Pontuação de cargos por fator |
| `CareerPath` | Trilhas de carreira |
| `Competency` / `CompetencyLevel` | Competências organizacionais |
| `JobCompetency` | Matriz cargo x competência |
| `SalaryGrade` / `SalaryStep` / `SalaryGrid` | Tabela salarial |
| `Employee` | Funcionários |
| `Benefit` / `EmployeeBenefit` | Benefícios |
| `PerformanceCycle` / `PerformanceEvaluation` | Avaliação de desempenho |
| `BudgetPlan` / `BudgetPlanItem` | Planejamento orçamentário |
| `ManualVersion` / `ManualSection` | Manual de Cargos e Salários |

---

## 🔒 Segurança

- Autenticação e autorização devem ser implementadas antes do deploy em produção
- Dados sensíveis (CPF, salários) devem ser protegidos
- Recomenda-se HTTPS em ambiente de produção

---

## 📝 Changelog

### Versão 2026.1 (Janeiro 2026)
- ✨ **Manual de Cargos e Salários** - Documento completo e estruturado
- ✨ **Detalhes do Colaborador** - Prontuário digital premium
- ✨ **Composição de Custos** - Visualização detalhada de encargos
- ✨ **Organograma Interativo** - Nós coloridos por departamento
- 🐛 Correções de bugs e melhorias de performance

---

## 👥 Equipe

Desenvolvido por **DOM Seven** - Eficiência e Estratégia em Gestão de Pessoas.

---

## 📄 Licença

Este software é proprietário e de uso exclusivo do cliente contratante.
Todos os direitos reservados © 2026 DOM Seven.
