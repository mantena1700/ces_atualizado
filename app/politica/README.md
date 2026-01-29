# 📁 app/politica

## Descrição
Página de **Política de Cargos e Salários** do sistema PCCS. Documento "vivo" que agrega todos os dados do sistema.

## Estrutura

```
/politica
└── page.tsx           # Página principal com o documento da política
```

## Funcionalidades

### Documento Dinâmico
- **Capa Premium**: Visual de documento oficial com estatísticas gerais
- **Seções Colapsáveis**: Organização por capítulos

### Seções do Documento

1. **Introdução e Objetivos**
   - Propósito da política
   - Pilares: Equidade, Competitividade, Meritocracia

2. **Estrutura Organizacional**
   - Lista de departamentos com headcount
   - Hierarquia de cargos (tabela)

3. **Sistema de Avaliação de Cargos**
   - Fatores de avaliação
   - Níveis e pontuações

4. **Matriz Salarial**
   - Faixas de salário (min/média/max)
   - Tabela Grades × Steps
   - Grades com faixas de pontuação

5. **Encargos e Benefícios**
   - Encargos CLT (INSS, FGTS, etc.)
   - Encargos PJ
   - Benefícios oferecidos

6. **Regras de Progressão**
   - Progressão Horizontal (Steps)
   - Progressão Vertical (Promoção)

## APIs Consumidas
- `getPolicyOverview()` - Agrega todos os dados do sistema

## Componentes Utilizados
- `PolicyDocument` (de `@/components/policy/policy-document.tsx`)

---

## Última Atualização
**2026-01-28** - Criação da página de Política PCCS
