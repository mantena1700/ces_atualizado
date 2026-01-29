# 📁 components/job-descriptions

## Descrição
Componentes para o módulo de **Descrições de Cargos**.

## Componentes

### `job-descriptions-list.tsx`
**Lista Premium de Descrições de Cargos**

Exibe todos os cargos com informações sobre o status das descrições:
- Cards de estatísticas no topo
- Tabela agrupada por departamento
- Barra de completude visual
- Badges de status coloridos
- Botões de ação (Gerar/Visualizar)

**Props:**
```typescript
interface JobDescriptionsListProps {
    items: JobDescriptionListItem[];
    stats: {
        totalRoles: number;
        withDescription: number;
        withoutDescription: number;
        byStatus: { draft: number; review: number; approved: number; };
    };
}
```

### `job-description-editor.tsx`
**Editor/Visualizador de Descrição de Cargo**

Componente completo para editar e visualizar descrições de cargos:
- Header premium com gradiente
- Info cards (Grade, Pontos, Ocupantes, Reporta a)
- Seções colapsáveis
- Modo visualização e edição
- Workflow de aprovação (botões de ação)
- Metadados (versão, datas)
- Lista de ocupantes atuais
- Suporte a impressão (CSS print)

**Props:**
```typescript
interface JobDescriptionEditorProps {
    data: JobDescriptionDTO;
}
```

## Design
- **Cores**: Gradiente slate-900/blue-900/indigo-900 no header
- **Interatividade**: Seções colapsáveis, modo edição toggle
- **Responsivo**: Grid adaptativo para formulários
- **Print-friendly**: Classes `.print:` para impressão

---

## Última Atualização
**2026-01-28** - Criação dos componentes
