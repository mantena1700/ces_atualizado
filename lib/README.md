# 📁 Lib (Utilitários)

Funções utilitárias e configurações compartilhadas do sistema PCCS DOM Seven.

---

## 📂 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `utils.ts` | Funções utilitárias gerais |
| `prisma.ts` | Instância singleton do Prisma Client |

---

## 🔧 Funções Disponíveis

### `cn(...inputs)` - Class Name Merger

Combina classes CSS condicionalmente usando `clsx` + `tailwind-merge`:

```typescript
import { cn } from '@/lib/utils';

// Uso básico
cn('text-red-500', 'bg-white') // => 'text-red-500 bg-white'

// Condicional
cn('base-class', isActive && 'active-class', className)

// Resolve conflitos Tailwind
cn('text-red-500', 'text-blue-500') // => 'text-blue-500'
```

### `formatCurrency(value)` - Formatador de Moeda

Formata valores numéricos para Real Brasileiro (BRL):

```typescript
import { formatCurrency } from '@/lib/utils';

formatCurrency(5000)      // => 'R$ 5.000,00'
formatCurrency('3500.50') // => 'R$ 3.500,50'
formatCurrency(NaN)       // => 'R$ 0,00'
```

---

## 🗄️ Prisma Client

### Uso

```typescript
import { prisma } from '@/lib/prisma';

// Em Server Actions ou API Routes
const employees = await prisma.employee.findMany();
```

### Implementação (Singleton)

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ['query'], // Opcional: log de queries
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
```

---

## ➕ Adicionar Novas Funções

Quando criar funções utilitárias novas:

1. Adicione em `lib/utils.ts`
2. Exporte com `export function`
3. Documente aqui

### Exemplo

```typescript
// lib/utils.ts
export function formatDate(date: Date | string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function calculateTenure(admissionDate: Date) {
    const now = new Date();
    const diff = now.getTime() - admissionDate.getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return { years, months };
}
```

---

## 🔄 Última Atualização

**2026-01-29** - Adicionada função formatCurrency
