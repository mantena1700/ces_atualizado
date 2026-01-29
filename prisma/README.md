# 📁 Prisma (ORM & Database)

Configuração do banco de dados e ORM Prisma para o sistema PCCS DOM Seven.

---

## 📂 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `schema.prisma` | Definição de todos os modelos (tabelas) do sistema |
| `dev.db` | Banco SQLite de desenvolvimento (não versionado) |

---

## 📊 Modelos do Schema

### Módulo 1: Avaliação de Cargos (Point Factor Method)

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `Factor` | Fatores de avaliação | name, description, weight |
| `FactorLevel` | Níveis de cada fator | level, description, points |

### Módulo 2: Cargos e Carreira

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `JobRole` | Cargos da organização | title, department, area, cbo, totalPoints |
| `JobDescription` | Descrição detalhada | summary, education, experience, responsibilities |
| `JobScore` | Pontuação cargo x fator | jobRoleId, factorLevelId |
| `CareerPath` | Trilhas de carreira | fromRoleId, toRoleId, requirements |

### Módulo 2.5: Matriz de Competências

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `Competency` | Competências organizacionais | name, category, critical |
| `CompetencyLevel` | Níveis de proficiência | level, name, indicators |
| `JobCompetency` | Matriz cargo x competência | required, weight |

### Módulo 3: Estrutura Salarial

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `SalaryGrade` | Grades (faixas verticais) | name, minPoints, maxPoints |
| `SalaryStep` | Steps (faixas horizontais) | name, percentage |
| `SalaryGrid` | Matriz Grade x Step = Valor | gradeId, stepId, amount |

### Módulo 4: Funcionários e Benefícios

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `Employee` | Funcionários | name, email, salary, hiringType, jobRoleId |
| `Benefit` | Benefícios disponíveis | name, type, value |
| `EmployeeBenefit` | Vínculo funcionário x benefício | employeeId, benefitId |

### Módulo 5: Avaliação de Desempenho

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `PerformanceCycle` | Ciclos de avaliação | name, startDate, endDate, status |
| `PerformanceEvaluation` | Avaliação individual | employeeId, cycleId, finalScore |
| `EvaluationItem` | Itens avaliados | type, competencyId, score |

### Módulo 6: Gestão Orçamentária

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `DepartmentBudget` | Orçamento por departamento | department, year, monthlyBudget |
| `BudgetPlan` | Planos orçamentários | name, periodType, status |
| `BudgetPlanItem` | Itens do plano | department, plannedBudget, plannedHeadcount |

### Módulo 7: Manual de Cargos e Salários

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `ManualVersion` | Versões do manual | title, status, effectiveDate |
| `ManualSection` | Seções/Capítulos | title, content, order, type |

### Sistema

| Modelo | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `SystemConfig` | Configurações do sistema | key, value, category |
| `ImplementationPhase` | Fases de implementação | name, targetDate |

---

## 🔧 Comandos Úteis

```bash
# Sincronizar schema com o banco (dev)
npx prisma db push

# Gerar cliente Prisma
npx prisma generate

# Visualizar banco no navegador
npx prisma studio

# Criar migration (produção)
npx prisma migrate dev --name nome_da_migration

# Reset do banco (CUIDADO: apaga dados)
npx prisma db push --force-reset
```

---

## ⚙️ Configuração

O arquivo `.env` deve conter:

```env
DATABASE_URL="file:./dev.db"
```

Para PostgreSQL (produção):
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

---

## 📋 Relacionamentos Principais

```
Factor ──1:N──> FactorLevel ──1:N──> JobScore <──N:1── JobRole
                                                         │
                                                         ├──1:1── JobDescription
                                                         ├──N:M── Competency (via JobCompetency)
                                                         ├──1:N── Employee
                                                         └──1:N── CareerPath (origin/target)

SalaryGrade ──1:N──> SalaryGrid <──N:1── SalaryStep

Employee ──N:M──> Benefit (via EmployeeBenefit)
         ──1:N──> PerformanceEvaluation

ManualVersion ──1:N──> ManualSection ──self-ref──> ManualSection (parent/children)
```

---

## 🔄 Última Atualização

**2026-01-29** - Adicionados modelos ManualVersion e ManualSection
