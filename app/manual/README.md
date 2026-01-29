# 📖 Manual de Cargos e Salários

Módulo de documentação oficial do Plano de Cargos, Carreira e Salários (PCCS).

---

## 📋 Visão Geral

O **Manual de Cargos e Salários** é um documento completo e estruturado que consolida todas as políticas, procedimentos e tabelas do PCCS em formato navegável e imprimível.

---

## 📂 Estrutura

| Capítulo | Título | Tipo |
|----------|--------|------|
| Capa | Página de rosto oficial | Visual |
| Índice | Navegação interativa | Dinâmico |
| 1 | Introdução e Objetivos | Texto |
| 2 | Metodologia de Avaliação de Cargos | Texto + Tabela |
| 3 | Estrutura de Cargos | Texto + Diagrama |
| 4 | Tabela Salarial | Dinâmico (dados reais) |
| 5 | Política de Progressão | Texto |
| 6 | Benefícios | Tabela |
| 7 | Avaliação de Desempenho | Texto + Escala |
| 8 | Disposições Finais | Texto + Assinaturas |

---

## ⚙️ Funcionalidades

### Navegação
- 📑 Sidebar com índice de capítulos
- ⬅️➡️ Botões Anterior/Próximo
- 🔢 Indicador de página atual

### Conteúdo
- 📊 Tabela salarial com valores reais
- 📈 Diagrama visual de hierarquia
- ✍️ Área de assinaturas para aprovação

### Ações
- 🖨️ Exportar para PDF (preparado)
- ✏️ Edição de conteúdo (em desenvolvimento)
- 📤 Publicação de versões oficiais

---

## 🎨 Design

O manual segue um design premium tipo "documento oficial":

- **Capa** com gradiente escuro e branding
- **Tipografia** profissional para leitura
- **Tabelas** estilizadas com hover effects
- **Cores** consistentes com o sistema
- **Responsivo** para visualização em diferentes dispositivos

---

## 📁 Arquivos Relacionados

| Arquivo | Descrição |
|---------|-----------|
| `/app/manual/page.tsx` | Página principal do manual |
| `/components/manual/manual-viewer.tsx` | Renderizador de conteúdo |
| `/components/manual/manual-editor.tsx` | Editor de seções |
| `/app/actions/manual.ts` | Server Actions (CRUD) |
| `/app/globals.css` | Estilos específicos (`.manual-table`, `.hierarchy-box`, etc.) |

---

## 🗄️ Banco de Dados

### ManualVersion
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| title | String | Nome da versão |
| status | String | DRAFT / REVIEW / PUBLISHED / ARCHIVED |
| effectiveDate | DateTime? | Data de vigência |
| publishedAt | DateTime? | Data de publicação |
| publishedBy | String? | Responsável |

### ManualSection
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| manualVersionId | String | FK para versão |
| title | String | Título do capítulo |
| content | String | Conteúdo HTML |
| order | Int | Ordem de exibição |
| type | String | TEXT / DYNAMIC_JOBLIST / DYNAMIC_SALARY_TABLE |
| parentId | String? | Para subseções hierárquicas |

---

## 🔄 Última Atualização

**2026-01-29** - Versão inicial completa com 8 capítulos
