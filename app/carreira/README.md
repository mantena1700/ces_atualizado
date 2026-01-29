# 📈 Carreira (Grafo de Trilhas)

Módulo de visualização e gestão de trilhas de carreira e progressão.

---

## 📋 Visão Geral

Este módulo apresenta um **grafo visual interativo** que mostra as possíveis trilhas de carreira dentro da organização, permitindo identificar caminhos de progressão, requisitos e gaps de desenvolvimento.

---

## ⚙️ Funcionalidades

### Grafo Interativo (React Flow)
- 🎯 **Nós**: Representam cargos
- ➡️ **Arestas**: Representam caminhos de progressão
- 🔍 **Zoom**: Controle de aproximação
- 🖱️ **Drag**: Movimentação livre
- 📍 **Minimap**: Visão geral da estrutura

### Informações por Cargo
- 📊 Pontuação do cargo
- 👥 Número de ocupantes
- 🎨 Cor por departamento
- 📋 Requisitos para progressão

### Ações
- ➕ Criar nova trilha de carreira
- ✏️ Editar requisitos de progressão
- 🗑️ Remover conexões

---

## 🎨 Visual

### Cores por Departamento
| Departamento | Cor |
|--------------|-----|
| Tecnologia | Azul |
| Comercial | Verde |
| Financeiro | Roxo |
| RH | Rosa |
| Operações | Laranja |

### Tipos de Conexão
- **Sólida**: Progressão direta (promoção padrão)
- **Tracejada**: Movimento lateral (mudança de área)

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/carreira/page.tsx` | Página principal |
| `/components/career-map.tsx` | Mapa visual completo |
| `/components/career-node.tsx` | Nó individual do grafo |
| `/components/career-flow.tsx` | Wrapper do React Flow |
| `/components/career/career-dashboard.tsx` | Dashboard de carreira |
| `/app/actions/career.ts` | Server Actions |

---

## 🗄️ Banco de Dados (CareerPath)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| fromRoleId | String | Cargo de origem |
| toRoleId | String | Cargo de destino |
| requirements | String? | Requisitos para progressão |

---

## 📐 Estrutura do Grafo

```
Auxiliar ──→ Assistente ──→ Analista Jr
                              │
                              ├──→ Analista Pl ──→ Analista Sr
                              │                        │
                              │                        ├──→ Especialista
                              │                        │
                              │                        └──→ Coordenador ──→ Gerente
                              │
                              └──→ Técnico ──→ Técnico Sr
```

---

## 🔄 Última Atualização

**2026-01-29** - Nós coloridos por departamento e métricas de ocupantes
