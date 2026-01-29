# 🎯 Avaliação de Desempenho

Módulo completo de avaliação de desempenho com integração ao plano de carreira e competências.

---

## 📋 Visão Geral

Este módulo gerencia todo o ciclo de avaliação de desempenho da organização, desde a criação de ciclos até o feedback final ao colaborador. Integra-se com a Matriz de Competências e o Plano de Carreira para oferecer insights acionáveis.

---

## ⚙️ Funcionalidades Principais

### 🗓️ Gestão de Ciclos
- Criação de ciclos de avaliação (anual, semestral)
- Controle de status: PLANNING, OPEN, REVIEW, CLOSED
- Inicialização automática de avaliações para todos os colaboradores

### 📊 Avaliação de Competências
- Notas de 1 a 5 estrelas por competência
- Peso diferenciado por competência
- Cálculo automático de média ponderada
- Comparativo com nível esperado do cargo

### 🔄 Fluxo de Avaliação
1. **PENDING** - Avaliação criada, aguardando início
2. **IN_PROGRESS** - Em preenchimento
3. **SUBMITTED** - Enviada para revisão
4. **DONE** - Finalizada

### 👨‍💼 Portal do Gestor
- Link exclusivo para gestores externos preencherem avaliações
- Token de acesso seguro com validade
- Interface simplificada e mobile-friendly
- Rota: `/portal-gestor/[token]`

### 📈 Insights e Análises
- **Histórico de Avaliações**: Gráfico de evolução ao longo dos ciclos
- **Tempo para Promoção**: Estimativa baseada no desempenho
- **Gaps Identificados**: Competências abaixo do esperado
- **Pontos Fortes**: Competências destacadas
- **Sugestões de Treinamento**: Recomendações automáticas
- **Risco de Retenção**: Indicador de atenção

### 📨 Envio de Resultados
- Notificação ao colaborador sobre resultado disponível
- Controle de visualização pelo colaborador

---

## 📁 Estrutura de Arquivos

```
app/avaliacao/
├── page.tsx                    # Lista de ciclos e avaliações
├── [id]/
│   └── page.tsx                # Detalhe de avaliação individual
└── README.md                   # Esta documentação

app/portal-gestor/
└── [token]/
    └── page.tsx                # Portal externo para gestores

components/performance/
├── evaluation-page.tsx         # Página de avaliação completa
├── evaluation-insights-panel.tsx # Painel de insights e gráficos
└── manager-assignment-dialog.tsx # Dialog de atribuição de gestor

app/actions/
└── performance.ts              # Server Actions do módulo
```

---

## 🔧 Server Actions

| Função | Descrição |
|--------|-----------|
| `getPerformanceCycles()` | Lista todos os ciclos |
| `createPerformanceCycle()` | Cria novo ciclo |
| `getEvaluationsByCycle()` | Lista avaliações de um ciclo |
| `getOrCreateEvaluation()` | Busca ou cria avaliação |
| `saveEvaluationScores()` | Salva notas e calcula média |
| `submitEvaluation()` | Envia avaliação para revisão |
| `finalizeEvaluation()` | Finaliza e fecha avaliação |
| `assignManagerToEvaluation()` | Atribui gestor responsável |
| `getEvaluationByToken()` | Busca avaliação por token (portal) |
| `saveManagerEvaluation()` | Salva avaliação do gestor (portal) |
| `sendResultToEmployee()` | Envia resultado ao colaborador |
| `getEmployeeEvaluationHistory()` | Histórico de avaliações |
| `getEmployeeInsights()` | Insights detalhados |
| `getAvailableManagers()` | Lista gestores disponíveis |
| `getPendingAssignments()` | Lista atribuições pendentes |

---

## 🗄️ Modelos do Banco

### PerformanceCycle
```prisma
model PerformanceCycle {
  id          String
  name        String
  startDate   DateTime
  endDate     DateTime
  status      String    // PLANNING, OPEN, REVIEW, CLOSED
  active      Boolean
  evaluations PerformanceEvaluation[]
  assignments EvaluationAssignment[]
}
```

### PerformanceEvaluation
```prisma
model PerformanceEvaluation {
  id              String
  employeeId      String
  cycleId         String
  jobRoleId       String
  managerId       String?
  managerName     String?
  managerEmail    String?
  status          String    // PENDING, IN_PROGRESS, SUBMITTED, DONE
  finalScore      Float?
  feedback        String?
  strengths       String?
  improvements    String?
  nextSteps       String?
  trainingNeeds   String?
  promotionReady  Boolean
  timeToPromotion Int?
  retentionRisk   String?
  sentToEmployee  Boolean
  items           EvaluationItem[]
}
```

### EvaluationAssignment
```prisma
model EvaluationAssignment {
  id           String
  evaluationId String
  managerName  String
  managerEmail String
  accessToken  String    // Token único para acesso
  tokenExpires DateTime
  status       String    // PENDING, STARTED, COMPLETED
}
```

---

## 🎨 UI/UX

- **Design Premium**: Gradientes, sombras e micro-animações
- **Responsivo**: Funciona em desktop e mobile
- **Feedback Visual**: Estados claros para cada etapa
- **Cores por Status**:
  - 🟢 Finalizada (verde)
  - 🔵 Pronta para envio (azul)
  - 🟡 Em andamento (amarelo)
  - ⚪ Pendente (cinza)

---

## 🔄 Última Atualização

**2026-01-29** - Implementação do Portal do Gestor, Insights avançados e integração completa.
