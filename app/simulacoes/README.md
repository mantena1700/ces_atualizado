# Módulo de Simulações Financeiras & Diagnóstico Executive

Este módulo é o "Centro de Inteligência" do PCCS DOM Seven, onde a teoria da Matriz Salarial encontra a realidade financeira da folha de pagamento atual.

## Novas Funcionalidades (Versão DOM Seven)

### 1. Dashboard de Aderência (Executive Dashboard)
- **Gráfico de Dispersão (Scatter Plot)**: Visualização em tempo real de como os colaboradores estão posicionados em relação à curva ideal da empresa (Pontos x Salário).
- **Análise por Departamento**: Identificação granular de onde o orçamento será mais impactado (ex: TI, RH, Operacional).

### 2. Diagnóstico Individual Premium (Ficha de Enquadramento)
Refatorado para oferecer uma experiência de análise executiva superior:
- **Clareza Financeira**: Separação visual explícita entre **Salário Base** (comparativo de mercado) e **Custo Total** (impacto no caixa).
- **Grid de Custos**: Exibição detalhada e categorizada: `Custo Total | Encargos | Benefícios`.
- **Régua Salarial Visual**: Gráfico de barra interativo mostrando onde o colaborador se situa dentro da faixa (Piso vs Teto), com indicação de Midpoint.
- **Plano de Ação Inteligente**: O sistema sugere ações baseadas no status:
    - *Excedente*: Congelamento/Promoção.
    - *Abaixo*: Valor exato de ajuste necessário para atingir o piso.
    - *Enquadrado*: Manutenção.

### 3. Relatórios Executivos
- **Exportação para PDF**: Layout otimizado para diretoria, removendo elementos de interface e focando nos números de decisão.

## Metodologia de Cálculo
- **Custo de Implementação**: Soma das diferenças (GAPs) necessárias para trazer todos que estão "Abaixo da Tabela" para o Step A da sua respectiva Grade.
- **Red Circles (Excedentes)**: Identificação de salários acima do teto de mercado para vigilância e plano de sucessão ou promoção.
