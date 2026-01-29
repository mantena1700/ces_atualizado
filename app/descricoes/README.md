# 📁 app/descricoes

## Descrição
Módulo de **Descrições de Cargos** do sistema PCCS. Permite gerenciar documentos detalhados de cada cargo.

## Estrutura

```
/descricoes
├── page.tsx              # Lista de todos os cargos com status das descrições
└── [id]/
    └── page.tsx          # Visualização/Edição da descrição de um cargo
```

## Funcionalidades

### Lista de Cargos (`/descricoes`)
- **Cards de estatísticas**: Total, Aprovados, Em Revisão, Sem Descrição
- **Filtros**: Busca por título/departamento, Filtro por status
- **Agrupamento**: Por departamento
- **Indicadores**: Barra de completude (%), Status visual
- **Ações**: 
  - "Gerar Descrição" (cria template automático)
  - "Visualizar" (abre editor)

### Editor de Descrição (`/descricoes/[id]`)
- **Cabeçalho Premium**: Gradiente escuro, info do cargo, status
- **Seções Colapsáveis**:
  1. Sumário e Objetivo
  2. Requisitos e Competências
  3. Responsabilidades e Atividades
  4. Contexto Organizacional
  5. Condições de Trabalho
- **Workflow de Aprovação**: DRAFT → REVIEW → APPROVED
- **Versioning**: Controle de versão automático
- **Impressão**: Suporte a print CSS

## Status das Descrições

| Status | Descrição |
|--------|-----------|
| EMPTY | Cargo sem descrição cadastrada |
| DRAFT | Rascunho em edição |
| REVIEW | Enviado para revisão |
| APPROVED | Aprovado oficialmente |

## APIs Consumidas
- `getJobDescriptionsList()` - Lista resumida
- `getJobDescriptionsStats()` - Estatísticas gerais
- `getJobDescription(jobRoleId)` - Descrição completa
- `saveJobDescription(jobRoleId, data)` - Salvar/atualizar
- `updateDescriptionStatus(jobRoleId, status)` - Workflow
- `generateDescriptionTemplate(jobRoleId)` - Template automático

---

## Última Atualização
**2026-01-28** - Criação do módulo de Descrições de Cargos
