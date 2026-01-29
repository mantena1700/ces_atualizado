# 📝 Descrições de Cargos

Módulo de gestão das fhas descritivas de cada cargo da organização.

---

## 📋 Visão Geral

A descrição de cargos é o documento fundamental que detalha as responsabilidades, requisitos e competências de cada posição, servindo como base para recrutamento, treinamento e avaliação.

---

## ⚙️ Funcionalidades

- 📋 **Lista de Descrições**: Visualização centralizada de todos os cargos com status de descrição.
- ✏️ **Editor Rico**: Interface para redigir missão, responsabilidades e requisitos.
- 📄 **Templates**: Padronização visual para todas as descrições.
- 🔍 **Busca e Filtros**: Localização rápida por departamento ou nível.

---

## 🧱 Estrutura da Descrição

| Campo | Descrição |
|-------|-----------|
| **Missão do Cargo** | O propósito fundamental da existência da posição. |
| **Responsabilidades** | Lista de atividades e deveres principais. |
| **Requisitos Técnicos** | Formação acadêmica, cursos e conhecimentos específicos. |
| **Experiência** | Tempo e vivência profissional necessários. |
| **Competências** | Atitudes e comportamentos esperados (soft skills). |

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/descricoes/page.tsx` | Lista geral de descrições |
| `/app/descricoes/[id]/page.tsx` | Editor/Visualizador de uma descrição específica |
| `/app/actions/job-descriptions.ts` | Server Actions para CRUD de descrições |
| `/components/job-descriptions/` | Componentes de editor e listagem |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação do módulo de descrições.
