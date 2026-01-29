# 📁 app/organograma

## Descrição
Módulo de **Organograma Integrado** do sistema PCCS. Exibe a hierarquia organizacional de forma visual e interativa.

## Estrutura

```
/organograma
└── page.tsx           # Página principal com visualização do organograma
```

## Funcionalidades

- **Visualização Hierárquica**: Árvore de cargos baseada no campo `reportsToId`
- **Layout Automático**: Algoritmo DFS para posicionar nós automaticamente
- **Interação**: Zoom, pan, minimap
- **Conexão Drag & Drop**: Arraste linhas entre cargos para definir hierarquia
- **Informações por Nó**:
  - Título do cargo
  - Departamento
  - Lista de ocupantes (funcionários)
  - Headcount

## APIs Consumidas
- `getOrgChartData()` - Monta a estrutura de nós e arestas
- `updateOrgHierarchy(childId, parentId)` - Atualiza relação de reporte

## Componentes Utilizados
- `OrgChart` - Container principal com React Flow
- `OrgNode` - Nó customizado (card de cargo)

## Tecnologias
- **React Flow** - Biblioteca de grafos interativos
- **Prisma** - ORM para buscar dados de `JobRole` e `Employee`

## Última Atualização
**2026-01-28** - Criação do módulo de organograma
