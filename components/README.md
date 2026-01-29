# 📁 Components

Diretório de componentes React reutilizáveis da aplicação PCCS DOM Seven.

---

## 📂 Estrutura

```
components/
├── ui/                     # Componentes base (Shadcn/Radix)
├── budget/                 # Componentes de Orçamento
├── career/                 # Componentes de Carreira
├── competencies/           # Componentes de Competências
├── job-descriptions/       # Componentes de Descrições de Cargos
├── manual/                 # Componentes do Manual PCCS
├── organogram/             # Componentes do Organograma
├── performance/            # Componentes de Avaliação de Desempenho
├── policy/                 # Componentes de Política
├── settings/               # Componentes de Configurações
└── [arquivos raiz]         # Componentes principais compartilhados
```

---

## 🧩 Componentes Principais (Raiz)

| Componente | Descrição |
|------------|-----------|
| `sidebar.tsx` | Menu lateral de navegação com grupos colapsáveis |
| `employee-form.tsx` | Formulário completo de cadastro de funcionário (tabs, validações) |
| `employee-details.tsx` | Prontuário digital do funcionário (custos, benefícios, dados) |
| `org-chart.tsx` | Organograma interativo com React Flow |
| `org-node.tsx` | Nó individual do organograma (departamento/cargo) |
| `career-map.tsx` | Mapa visual de trilhas de carreira |
| `career-node.tsx` | Nó de cargo no grafo de carreira |
| `career-flow.tsx` | Wrapper do React Flow para carreira |
| `matrix-table.tsx` | Tabela de matriz salarial (Grades x Steps) |
| `matrix-toolbar.tsx` | Barra de ferramentas da matriz |
| `factors-manager.tsx` | Gerenciador de fatores de avaliação |
| `job-form.tsx` | Formulário de cadastro de cargo |
| `evaluation-grid.tsx` | Grid de avaliação por fatores |
| `evaluation-wizard.tsx` | Wizard de avaliação de desempenho |
| `benefits-manager.tsx` | Gerenciador de benefícios |
| `grades-config-modal.tsx` | Modal de configuração de grades |

---

## 📁 Subpastas

### `/ui` - Componentes Base
Componentes primitivos do Shadcn/Radix UI:
- `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`
- `dialog.tsx`, `tabs.tsx`, `badge.tsx`, `progress.tsx`
- `select.tsx`, `textarea.tsx`, `tooltip.tsx`

### `/budget` - Orçamento
- `budget-overview.tsx` - Visão geral do orçamento
- `budget-plan-form.tsx` - Formulário de plano
- `department-comparison.tsx` - Comparativo por departamento

### `/career` - Carreira
- `career-dashboard.tsx` - Dashboard de trilhas de carreira

### `/competencies` - Competências
- `competency-form.tsx` - Formulário de competência
- `competency-list.tsx` - Lista de competências
- `competency-levels.tsx` - Níveis de proficiência
- `job-competency-matrix.tsx` - Matriz cargo x competência
- `competency-gap-analysis.tsx` - Análise de gaps
- `competency-radar.tsx` - Gráfico radar de competências

### `/job-descriptions` - Descrições de Cargos
- `job-descriptions-list.tsx` - Lista de descrições
- `job-descriptions-editor.tsx` - Editor de descrição

### `/manual` - Manual PCCS
- `manual-viewer.tsx` - Renderizador de conteúdo do manual
- `manual-editor.tsx` - Editor de seções do manual

### `/performance` - Avaliação de Desempenho
- `performance-dashboard.tsx` - Dashboard de avaliações
- `evaluation-form.tsx` - Formulário de avaliação
- `cycle-manager.tsx` - Gerenciador de ciclos

### `/policy` - Política
- `policy-editor.tsx` - Editor de políticas

### `/settings` - Configurações
- `tax-settings.tsx` - Configurações de impostos/encargos

---

## ⚡ Convenções de Desenvolvimento

### Diretiva 'use client'
```typescript
// Componentes com interatividade DEVEM ter:
'use client';

import { useState } from 'react';
// ...
```

### Nomenclatura
- Arquivos: `kebab-case.tsx`
- Componentes: `PascalCase`
- Props: `ComponentNameProps`

### Exemplo de Estrutura
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MyComponentProps {
    title: string;
    className?: string;
}

export function MyComponent({ title, className }: MyComponentProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className={cn('base-classes', className)}>
            <h2>{title}</h2>
            <Button onClick={() => setIsOpen(!isOpen)}>Toggle</Button>
        </div>
    );
}
```

---

## 🔄 Última Atualização

**2026-01-29** - Adicionados componentes do Manual de Cargos e Salários
