# Modelo Padrão de Avaliação de Cargos por Pontos (Point Factor Method)

Este documento descreve a metodologia proposta para a avaliação e classificação dos cargos no sistema **PCCS NextGen**. O modelo baseia-se em 3 grandes fatores universais (semelhante ao Método Hay), subdivididos em elementos mensuráveis.

## Resumo dos Fatores

| Fator Macro | Peso Aprox. | Descrição |
| :--- | :---: | :--- |
| **1. Conhecimento (Know-How)** | 40% | O conjunto de conhecimentos e habilidades técnicas/gestão necessários para o cargo. |
| **2. Resolução de Problemas** | 30% | A complexidade do pensamento exigido para identificar, analisar e solucionar problemas. |
| **3. Responsabilidade (Impacto)** | 30% | O nível de autonomia e o impacto das decisões do cargo nos resultados da empresa. |

---

## Detalhamento da Pontuação

### 1. Fator: Conhecimento (Know-How)
*Mede a exigência técnica, acadêmica e experiência.*

#### 1.1. Escolaridade e Conhecimento Técnico
| Nível | Pontos | Descrição |
| :---: | :---: | :--- |
| 1 | 10 | **Fundamental:** Leitura e escrita básicas, tarefas simples e repetitivas. |
| 2 | 25 | **Médio:** Operações padronizadas, uso de equipamentos simples. |
| 3 | 45 | **Técnico/Médio Completo:** Conhecimento de rotinas administrativas ou operacionais específicas. |
| 4 | 70 | **Superior Incompleto/Cursando:** Noções teóricas aplicadas a tarefas de assistência. |
| 5 | 100 | **Superior Completo:** Domínio de teorias e princípios de uma disciplina específica (Analistas). |
| 6 | 135 | **Pós-Graduação/Especialização:** Conhecimento profundo, referência técnica na área. |
| 7 | 175 | **Mestrado/MBA:** Visão estratégica ampla, gestão de múltiplas disciplinas. |

#### 1.2. Experiência Prévia
| Nível | Pontos | Descrição |
| :---: | :---: | :--- |
| 1 | 5 | **0 - 6 meses:** Posições de entrada, aprendizado rápido. |
| 2 | 15 | **6 meses - 2 anos:** Exige vivência básica para autonomia na rotina. |
| 3 | 30 | **2 - 4 anos:** Pleno domínio das atividades operacionais/táticas. |
| 4 | 50 | **4 - 7 anos:** Senioridade, vivência em ciclos completos da função. |
| 5 | 75 | **8+ anos:** Vasta experiência, capacidade de lidar com cenários inéditos. |

---

### 2. Fator: Resolução de Problemas
*Mede a intensidade mental e o desafio intelectual.*

#### 2.1. Complexidade das Tarefas
| Nível | Pontos | Descrição |
| :---: | :---: | :--- |
| 1 | 10 | **Repetitiva:** Segue regras estritas e rotinas fixas. Pouco ou nenhum julgamento. |
| 2 | 25 | **Padronizada:** Existem manuais, mas exige escolha entre algumas opções pré-definidas. |
| 3 | 45 | **Semi-padronizada:** Problemas variados, exige análise de fatos e adaptação de regras. |
| 4 | 70 | **Adaptativa:** Problemas sem solução óbvia, exige interpretação e melhoria de processos. |
| 5 | 100 | **Criativa/Estratégica:** Desenvolvimento de novos conceitos, políticas ou estratégias corporativas. |

---

### 3. Fator: Responsabilidade (Accountability)
*Mede o "tamanho" da cadeira em termos de impacto e liberdade.*

#### 3.1. Autonomia de Decisão
| Nível | Pontos | Descrição |
| :---: | :---: | :--- |
| 1 | 10 | **Controlada:** Supervisão constante, valida cada passo. |
| 2 | 25 | **Padronizada:** Segue rotinas, reporta exceções. Supervisão periódica. |
| 3 | 50 | **Orientada:** Atua dentro de diretrizes gerais. Supervisão por resultados/metas. |
| 4 | 80 | **Diretiva:** Define o "como" fazer para atingir os objetivos da área. |
| 5 | 120 | **Estratégica:** Define políticas e objetivos de longo prazo da organização. |

#### 3.2. Impacto Financeiro/Erro
| Nível | Pontos | Descrição |
| :---: | :---: | :--- |
| 1 | 10 | **Mínimo:** Erros são facilmente corrigíveis, impacto interno restrito à própria mesa. |
| 2 | 30 | **Pequeno:** Erros causam retrabalho na equipe ou pequenas perdas materiais. |
| 3 | 60 | **Médio:** Erros afetam resultados do departamento ou imagem com clientes táticos. |
| 4 | 100 | **Grande:** Erros afetam o resultado anual da unidade de negócio ou grandes clientes. |
| 5 | 150 | **Crítico:** Erros colocam em risco a operação ou imagem corporativa da empresa. |

---

## Tabela de Conversão Sugerida (Pontos -> Grade/Nível)

Após somar os pontos dos 5 sub-fatores, o cargo é enquadrado em um GRADE (Nível Hierárquico).

| Faixa de Pontos | Grade Sugerido | Cargos Típicos (Exemplos) |
| :--- | :---: | :--- |
| **045 - 080** | G-01 (Operacional I) | Auxiliar, Assistente Jr |
| **081 - 130** | G-02 (Operacional II) | Assistente Pl, Técnico Jr |
| **131 - 190** | G-03 (Tático I) | Analista Jr, Técnico Pl |
| **191 - 260** | G-04 (Tático II) | Analista Pl, Supervisor |
| **261 - 340** | G-05 (Tático III) | Analista Sr, Coordenador |
| **341 - 450** | G-06 (Estratégico I) | Gerente, Especialista |
| **451 - 600+** | G-07 (Estratégico II) | Diretor, Head |

---

## Status de Implementação (PCCS NextGen)
*Última atualização: 28/01/2026*

✅ **1. Cadastro e Fatores**
   - Banco de dados estruturado com todos os fatores acima.
   - Interface "Wizard" passo-a-passo para pontuar cargos.

✅ **2. Matriz Salarial (Grades e Steps)**
   - Tabela de Grades configurável (`G-01`, `G-02`, etc).
   - Edição, criação e exclusão de Grades dinamicamente.
   - Definição manual de valores e cálculo automático de progressão (Varinha Mágica com steps de 5%).
   - Reajuste Geral (Dissídio) para correção inflacionária em massa.

✅ **3. Visualização**
   - Gráfico de curva salarial para análise de consistência.
   - Indicadores visuais de quantos cargos existem em cada grade.

🔜 **Próximos Passos:**
   - [ ] Relatórios de Impacto Financeiro.
   - [ ] Integração com Folha (Importação/Exportação).

