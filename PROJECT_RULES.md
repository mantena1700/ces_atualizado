# Regras de Documentação e Desenvolvimento (PCCS NextGen)

Este projeto segue uma política estrita de **Documentação Fractal**. O objetivo é garantir que tanto humanos quanto IAs possam navegar e entender o contexto de qualquer parte do sistema instantaneamente.

## 1. Regra do README.md por Diretório
**TODO diretório significativo** deve conter um arquivo `README.md`.
Este arquivo deve conter obrigatoriamente:

1.  **Propósito:** O que esta pasta faz? (Ex: "Contém componentes visuais reutilizáveis").
2.  **Conteúdo:** Lista dos principais arquivos e uma breve descrição de cada um.
3.  **APIs & Actions:** Se a pasta contiver lógica de Backend (Server Actions), documentar as funções públicas, entradas e saídas.
4.  **Dependências:** O que essa pasta consome? (Ex: "Usa definições do Prisma Schema").

## 2. Regra de Atualização Contínua
Sempre que uma tarefa de modificação ou criação for finalizada em um diretório:
*   O Agente **DEVE** verificar o `README.md` daquela pasta.
*   O Agente **DEVE** atualizar a documentação com as novas funcionalidades, APIs ou arquivos criados.
*   **Exemplo:** Adicionou `novo-componente.tsx`? Adicione uma linha no README explicando o que ele faz.

## 3. Padrão de Stack
*   **Frontend:** Next.js (App Router), Tailwind CSS, Lucide Icons, Shadcn/UI.
*   **Backend:** Next.js Server Actions.
*   **Database:** Prisma ORM + SQLite (Dev) / PostgreSQL (Prod).
*   **Linguagem:** TypeScript (Strict Mode).

---
*Este arquivo é a Lei do Repositório. Mantenha-o atualizado.*
