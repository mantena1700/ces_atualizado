# 📁 components/competencies

## Descrição
Componentes para o módulo de **Matriz de Competências**.

## Componentes

### `competencies-list.tsx`
**Lista Premium de Competências**

Exibe todas as competências com cards de estatísticas e agrupamento por categoria:
- Cards de estatísticas no topo (Total, por categoria, críticas)
- Barra de cobertura da matriz
- Filtros (busca + categoria)
- Cards por competência com indicadores visuais
- Modal para criar nova competência
- Botão para gerar competências padrão

**Props:**
```typescript
interface CompetenciesListProps {
    items: CompetencyListItem[];
    stats: CompetencyMatrixOverview;
}
```

### `competency-matrix.tsx`
**Matriz Visual de Competências por Cargo**

Visualização das competências atribuídas a cada cargo:
- Agrupamento por departamento (colapsável)
- Tags coloridas por nível e categoria
- Tooltip com detalhes ao hover
- Link para editar competências do cargo

**Props:**
```typescript
interface CompetencyMatrixProps {
    matrix: JobCompetencyMatrixItem[];
    stats: CompetencyMatrixOverview;
}
```

### `job-competencies-editor.tsx`
**Editor de Competências por Cargo**

Componente completo para gerenciar as competências de um cargo:
- Header premium com info do cargo
- Lista de competências atribuídas
- Controles inline: nível, peso, obrigatória
- Modal para adicionar nova competência
- Botão para remover competência

**Props:**
```typescript
interface JobCompetenciesEditorProps {
    data: {
        role: { id, title, department, grade };
        assignedCompetencies: [...];
        allCompetencies: [...];
    };
}
```

## Design
- **Cores por categoria**: Azul (técnica), Roxo (comportamental), Âmbar (organizacional)
- **Cores por nível**: Gradiente do slate ao rose conforme o nível aumenta
- **Interatividade**: Toggle de views, modais, tooltips
- **Responsivo**: Grid adaptativo

---

## Última Atualização
**2026-01-28** - Criação dos componentes
