# 👥 Colaboradores

Módulo de gestão completa de funcionários do sistema PCCS DOM Seven.

---

## 📋 Visão Geral

Este módulo permite o cadastro, visualização e gerenciamento de todos os colaboradores da organização, incluindo dados pessoais, contratuais, financeiros e de carreira.

---

## ⚙️ Funcionalidades

### Lista de Colaboradores
- 📊 **Métricas rápidas**: Total, CLT, PJ, ativos
- 🔍 **Busca** por nome
- 📋 **Visualização**: Grid ou Lista
- ➕ **Novo Colaborador**: Modal de cadastro

### Cadastro (Formulário Completo)
| Aba | Campos |
|-----|--------|
| **Dados Pessoais** | Nome, CPF, RG, PIS, Data Nascimento, Email, Telefone |
| **Endereço** | CEP, Logradouro, Número, Complemento, Bairro, Cidade, Estado |
| **Contrato** | Tipo (CLT/PJ), Cargo, Salário, Data Admissão, Benefícios, Dados Bancários |
| **Acadêmico** | Escolaridade, Curso, Ano de Conclusão |

### Detalhes do Colaborador (Prontuário Digital)
- 🎯 **Header Premium**: Avatar, nome, cargo, departamento
- 📊 **Quick Stats**: Salário, Custo Total, Regime, Grade
- 💼 **Informações Profissionais**: Cargo, Pontuação, Admissão, Tempo de Empresa
- 💰 **Composição de Custos**: Gráfico donut com Salário, Encargos, Benefícios
- 📋 **Detalhamento de Encargos**: INSS, FGTS, 13º, Férias, etc.
- ✅ **Benefícios Ativos**: Lista com valores calculados
- 📝 **Dados Pessoais**: CPF, Email, Telefone, Endereço
- ⚡ **Ações Rápidas**: Ver Descrição, Avaliar, Trilha de Carreira, Exportar PDF

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/colaboradores/page.tsx` | Página principal (lista) |
| `/components/employee-form.tsx` | Formulário de cadastro/edição |
| `/components/employee-details.tsx` | Prontuário digital detalhado |
| `/app/actions/employees.ts` | Server Actions (CRUD) |

---

## 🗄️ Banco de Dados (Employee)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome completo |
| email | String? | Email corporativo |
| cpf | String? | CPF |
| birthDate | DateTime? | Data de nascimento |
| phone | String? | Telefone |
| admissionDate | DateTime? | Data de admissão |
| hiringType | String | CLT ou PJ |
| salary | Decimal | Salário nominal |
| jobRoleId | String? | FK para cargo |
| gradeId | String? | Grade salarial |
| stepId | String? | Step salarial |
| zipCode, address, number, complement, neighborhood, city, state | String? | Endereço |

---

## 💡 Cálculos Automáticos

### Custo Total (CLT)
```
Custo = Salário + INSS Patronal (20%) + FGTS (8%) + 13º (8.33%) + Férias+1/3 (11.11%) + Benefícios
```

### Custo Total (PJ)
```
Custo = Salário + Benefícios (se houver)
```

### Tempo de Empresa
```
Calcula anos e meses desde a data de admissão
Exemplo: "2 anos e 5 meses"
```

---

## 🔄 Última Atualização

**2026-01-29** - Prontuário digital com composição de custos e ações rápidas
