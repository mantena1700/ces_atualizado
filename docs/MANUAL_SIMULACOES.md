# Manual de Simulações e Enquadramento

Este módulo é responsável por comparar a realidade atual da empresa com o plano de PCCS desenhado.

## Regras de Cálculo de Enquadramento

1. **Abaixo da Tabela (Prioridade 1)**
   - Condição: `Salário Atual < Valor Step A`.
   - Ação: Proposta automática para Step A.
   - Impacto: Diferença entre Step A e Salário Atual.

2. **Em Enquadramento**
   - Condição: `Valor Step A <= Salário Atual < Valor Step B`.
   - Ação: Mantém salário atual. Vincula ao Step A.
   - Impacto: R$ 0,00 (Aumento futuro via cronograma).

3. **Excedente (Red Circle)**
   - Condição: `Salário Atual > Último Step da Grade`.
   - Ação: Alerta visual. Travamento de progressões automáticas.
   - Status: "Fora da Curva".

## Indicadores (KPIs)

- **Custo Mensal de Implementação:** Soma de todos os ajustes para o Step A.
- **Percentual de Impacto na Folha:** (Novo Custo / Custo Atual) - 1.
- **Índice de Conformidade:** % de colaboradores que já estão dentro ou acima da tabela.

## Funcionalidades Internas
- Botão "Efetivar Enquadramento": Migra os colaboradores para seus novos steps no banco de dados.
- Filtro por Departamento para análise segmentada.
