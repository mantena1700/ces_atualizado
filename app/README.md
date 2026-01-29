# 📁 App Router (Next.js 15)

Este diretório contém todas as rotas e páginas da aplicação, seguindo a arquitetura do **Next.js App Router**.

---

## 📂 Estrutura de Rotas

### 🏠 Dashboard
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `page.tsx` | Dashboard principal com KPIs, gráficos e visão geral |

### 🏢 Estrutura Organizacional
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/organograma` | `page.tsx` | Organograma interativo (React Flow) |
| `/colaboradores` | `page.tsx` | Gestão de funcionários |
| `/importar` | `page.tsx` | Importação de dados via JSON |

### 💼 Gestão de Cargos
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/cargos` | `page.tsx` | Avaliação de cargos por fatores |
| `/avaliacao` | `page.tsx` | Ciclos de avaliação de desempenho |
| `/avaliacao/[id]` | `page.tsx` | Detalhes de avaliação específica |
| `/descricoes` | `page.tsx` | Lista de descrições de cargos |
| `/descricoes/[id]` | `page.tsx` | Editor de descrição individual |
| `/competencias` | `page.tsx` | Matriz de competências organizacionais |
| `/competencias/[id]` | `page.tsx` | Detalhes de competência |
| `/competencias/cargo/[id]` | `page.tsx` | Competências de um cargo específico |
| `/carreira` | `page.tsx` | Grafo visual de trilhas de carreira |

### 💰 Remuneração & Folha
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/matriz` | `page.tsx` | Configuração da matriz salarial |
| `/tabela` | `page.tsx` | Tabela salarial oficial |
| `/orcamento` | `page.tsx` | Gestão orçamentária |
| `/orcamento/plano/[id]` | `page.tsx` | Detalhes de plano orçamentário |
| `/simulacoes` | `page.tsx` | Simulações de cenários |

### 📋 Políticas & Documentação
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/manual` | `page.tsx` | **Manual de Cargos e Salários** (documento completo) |
| `/politica` | `page.tsx` | Anexos da política PCCS |
| `/cronograma` | `page.tsx` | Cronograma de implementação |

### ⚙️ Sistema
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/configuracoes` | `page.tsx` | Configurações do sistema |

---

## 📁 Subpasta: `/actions`

Contém todas as **Server Actions** do sistema (CRUD com Prisma):

| Arquivo | Responsabilidade |
|---------|------------------|
| `benefits.ts` | Gestão de benefícios |
| `budget.ts` | Planos orçamentários |
| `career.ts` | Trilhas de carreira |
| `competencies.ts` | Competências |
| `employees.ts` | Funcionários (CRUD completo) |
| `factors.ts` | Fatores de avaliação |
| `import-actions.ts` | Importação de dados |
| `job-descriptions.ts` | Descrições de cargos |
| `jobs.ts` | Cargos e pontuações |
| `manual.ts` | Manual de Cargos e Salários |
| `organization.ts` | Organograma |
| `performance.ts` | Avaliação de desempenho |
| `salary.ts` | Tabela salarial |
| `settings.ts` | Configurações (impostos, parâmetros) |
| `steps.ts` | Steps salariais |

---

## 📄 Arquivos Globais

| Arquivo | Descrição |
|---------|-----------|
| `layout.tsx` | Shell da aplicação (Sidebar + Área de conteúdo) |
| `globals.css` | Estilos globais, variáveis CSS e classes do Manual |
| `favicon.ico` | Ícone do navegador |

---

## ⚡ Convenções

### Server Components vs Client Components

```typescript
// ✅ Server Component (padrão)
// Acesso direto ao banco via Server Actions
export default async function Page() {
    const data = await getData();
    return <div>{/* ... */}</div>;
}

// ✅ Client Component (interatividade)
'use client';
export function InteractiveComponent() {
    const [state, setState] = useState();
    return <button onClick={() => setState(true)}>Click</button>;
}
```

### Regras
1. Páginas (`page.tsx`) são **Server Components** por padrão
2. Interatividade (`useState`, `onClick`) deve usar `'use client'`
3. Server Actions devem estar em `/app/actions/`
4. Componentes reutilizáveis vão para `/components/`

---

## 🔄 Última Atualização

**2026-01-29** - Adicionado módulo Manual de Cargos e Salários completo
