# ⚙️ Configurações

Módulo de configurações gerais do sistema PCCS DOM Seven.

---

## 📋 Visão Geral

Este módulo centraliza todas as configurações do sistema, incluindo parâmetros fiscais, benefícios, e ajustes globais.

---

## ⚙️ Funcionalidades

### Encargos e Impostos (CLT)
| Encargo | Alíquota Padrão | Descrição |
|---------|-----------------|-----------|
| INSS Patronal | 20% | Contribuição previdenciária |
| FGTS | 8% | Fundo de Garantia |
| 13º Salário | 8.33% | Provisão mensal |
| Férias + 1/3 | 11.11% | Provisão mensal |
| RAT/SAT | 1-3% | Risco ambiental do trabalho |

### Benefícios
- ➕ Cadastro de benefícios
- 📊 Tipo: Valor Fixo ou Percentual do Salário
- 💰 Definição de valores
- 👥 Vínculo com funcionários

### Parâmetros do Sistema
- 📅 Ano fiscal vigente
- 📈 Percentual de reajuste coletivo
- 🎯 Metas padrão de desempenho

---

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `/app/configuracoes/page.tsx` | Página de configurações |
| `/components/settings/tax-settings.tsx` | Configurações de impostos |
| `/components/benefits-manager.tsx` | Gerenciador de benefícios |
| `/app/actions/settings.ts` | Server Actions |
| `/app/actions/benefits.ts` | Server Actions de benefícios |

---

## 🗄️ Banco de Dados

### SystemConfig
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| key | String | Chave única (ex: TAX_INSS_PATRONAL) |
| value | String | Valor (flexível) |
| description | String? | Descrição |
| category | String | TAXES / GENERAL / etc. |

### Benefit
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | UUID |
| name | String | Nome do benefício |
| type | String | FIXED ou PERCENTAGE |
| value | Decimal | Valor nominal ou percentual |
| description | String? | Descrição |

---

## 📐 Chaves de Configuração

| Chave | Categoria | Valor Exemplo |
|-------|-----------|---------------|
| `TAX_INSS_PATRONAL` | TAXES | 0.20 |
| `TAX_FGTS` | TAXES | 0.08 |
| `TAX_13_PROVISION` | TAXES | 0.0833 |
| `TAX_FERIAS_PROVISION` | TAXES | 0.1111 |
| `TAX_RAT` | TAXES | 0.02 |
| `FISCAL_YEAR` | GENERAL | 2026 |
| `DEFAULT_STEP_INCREMENT` | GENERAL | 0.05 |

---

## 🔄 Última Atualização

**2026-01-29** - Documentação do módulo
