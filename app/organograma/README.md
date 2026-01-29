# 🌿 Organograma

Visualização hierárquica e funcional da estrutura organizacional.

---

## 📋 Visão Geral

O organograma interativo permite navegar pela estrutura da empresa, compreendendo as linhas de subordinação, departamentos e a distribuição de cargos e pessoas.

---

## ⚙️ Funcionalidades

- 🎯 **Navegação Dinâmica**: Grafo interativo utilizando React Flow.
- 👥 **Métricas de Nós**: Visualização de quantos colaboradores ocupam cada posição.
- 📂 **Visão por Departamentos**: Agrupamento visual por áreas de negócio.
- 🔍 **Busca de Cargos**: Localização instantânea de posições na hierarquia.

---

## 🎨 Visualização

- **Nós de Departamento**: Representam as áreas (ex: Tecnologia, RH).
- **Nós de Cargo**: Representam as posições dentro das áreas.
- **Cores**: Identificação visual rápida por macro-área.

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/organograma/page.tsx` | Página de visualização do grafo organizacional |
| `/components/org-chart.tsx` | Componente principal do grafo |
| `/components/org-node.tsx` | Estilização individual dos nós do organograma |
| `/app/actions/organization.ts` | Server Actions para fetch de estrutura |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação do módulo de organograma.
