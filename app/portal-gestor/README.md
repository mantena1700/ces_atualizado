# 🌐 Portal do Gestor

Portal de acesso externo para gestores realizarem avaliações de desempenho.

---

## 📋 Visão Geral

Este portal permite que gestores externos (que não têm acesso ao sistema interno) preencham avaliações de desempenho de seus subordinados através de um link exclusivo com token de acesso.

---

## ⚙️ Funcionalidades

- 🔐 **Acesso por Token**: Link único e seguro para cada avaliação.
- ⏰ **Validade**: Token expira automaticamente após o ciclo + 7 dias.
- 📱 **Mobile-First**: Interface otimizada para dispositivos móveis.
- ⭐ **Avaliação por Estrelas**: Notas de 1 a 5 para cada competência.
- 💬 **Comentários**: Espaço para feedback detalhado.
- 📊 **Indicadores de Gestão**: Tempo para promoção, risco de retenção, etc.

---

## 🔄 Fluxo de Uso

1. **RH/Admin** atribui um gestor a uma avaliação no sistema interno.
2. **Sistema** gera um link exclusivo com token de acesso.
3. **Gestor** recebe o link (por email ou manualmente).
4. **Gestor** acessa o portal e preenche a avaliação.
5. **Sistema** registra as notas e feedback automaticamente.
6. **RH/Admin** visualiza o resultado no sistema interno.

---

## 📁 Estrutura

```
app/portal-gestor/
└── [token]/
    └── page.tsx    # Página do portal com formulário de avaliação
```

---

## 🎨 Características da Interface

- **Header Informativo**: Nome do colaborador, cargo, ciclo.
- **Cards de Competência**: Avaliação visual com estrelas.
- **Seção de Feedback**: Campos para pontos fortes, melhorias, próximos passos.
- **Indicadores de Gestão**: Checkboxes e selects para métricas de RH.
- **Validação**: Campos obrigatórios claramente indicados.
- **Confirmação Visual**: Feedback de sucesso ao enviar.

---

## 🔒 Segurança

- Token UUID único e não previsível.
- Verificação de expiração a cada acesso.
- Nenhuma informação sensível exposta na URL.
- Sem necessidade de login ou senha.

---

## 🔄 Última Atualização

**2026-01-29** - Criação do Portal do Gestor.
