# 📁 components/policy

## Descrição
Componentes para a página de **Política de Cargos e Salários**.

## Componentes

### `policy-document.tsx`
**Documento Premium de Política PCCS**

Exibe toda a política de cargos e salários em formato de documento oficial com:
- Capa premium com gradiente e estatísticas
- Seções colapsáveis com ícones
- Tabelas de dados (departamentos, cargos, matriz)
- Cards de benefícios e encargos
- Regras de progressão

**Props:**
```typescript
interface PolicyDocumentProps {
    data: PolicyOverview;
}
```

**Seções:**
1. Introdução e Objetivos
2. Estrutura Organizacional
3. Sistema de Avaliação de Cargos
4. Matriz Salarial
5. Encargos e Benefícios
6. Regras de Progressão

## Design
- **Cores**: Gradiente slate-900/blue-900/indigo-900 na capa
- **Interatividade**: Seções colapsáveis (clique para expandir/recolher)
- **Tipografia**: Headers em font-bold, números em font-mono
- **Icons**: Lucide React para cada seção

---

## Última Atualização
**2026-01-28** - Criação do componente de documento
