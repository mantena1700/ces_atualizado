# Módulo de Tabela Salarial Oficial

Enquanto a Matriz Salarial foca no cálculo técnico da engenharia de cargos, a **Tabela Salarial** é o documento de saída destinado à consulta de gestores e diretoria.

## Propósito
Exibir as faixas remuneratórias reais para cada cargo oficial da empresa, vinculando a complexidade (pontos) ao valor monetário (R$).

## Elementos de Análise
- **Cargo e Departamento**: Identificação clara da função.
- **Pontuação (Pontos Hay)**: Justificativa técnica do posicionamento do cargo na estrutura.
- **Grade Salarial**: Nível hierárquico vinculado à Matriz Salarial.
- **Piso (Step A)**: Salário inicial de entrada.
- **Midpoint (Alvo)**: Referência de mercado (valor "alvo" para um colaborador maduro no cargo).
- **Teto (Step Final)**: Valor máximo possível para aquela função dentro do plano.
- **Amplitude (Spread)**: Percentagem de evolução possível dentro do mesmo cargo.

## Integração
- Este módulo consome dados da **Matriz Salarial** e da **Avaliação de Cargos**. Qualquer alteração na pontuação do cargo ou nos valores das grades é refletida instantaneamente nesta tabela.
