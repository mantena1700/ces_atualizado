# 🧪 Roteiro de Testes - Módulo de Avaliação de Desempenho

Siga este roteiro para validar todas as novas funcionalidades implementadas.

## 1. Configuração Inicial

1.  Acesse o sistema.
2.  Vá para a seção **Avaliação de Desempenho** no menu lateral.
3.  Se não houver nenhum ciclo ativo, clique em "Novo Ciclo" e crie um (ex: "Avaliação 2026.1").
4.  Clique em "Iniciar Avaliações" se a lista estiver vazia. O sistema irá gerar avaliações para todos os funcionários com cargo.

## 2. Atribuição de Gestor (Portal Externo)

1.  Na lista de avaliações, clique em um card de funcionário para abrir os detalhes.
2.  Na barra lateral direita, localize o card "Detalhes da Avaliação".
3.  Clique no botão **"Atribuir Gestor"**.
4.  No diálogo que abrir:
    *   Tente buscar um gestor existente na lista.
    *   Ou clique em "Informar manualmente" e digite um nome (ex: "Gestor Teste") e email.
5.  Clique em **"Gerar Link de Acesso"**.
6.  O sistema irá gerar um link exclusivo. **Copie este link**.
7.  Feche o diálogo. Verifique se o nome do gestor aparece na barra lateral.

## 3. Preenchimento pelo Gestor (Simulação)

1.  Abra uma nova aba anônima (ou outro navegador) para simular o gestor externo.
2.  Cole o link copiado no passo anterior.
3.  Verifique se o **Portal do Gestor** carrega corretamente.
4.  Preencha a avaliação:
    *   Dê notas para as competências (clique nas estrelas).
    *   Adicione comentários opcionais.
    *   Preencha o feedback geral, pontos fortes e melhorias.
    *   Preencha os indicadores de gestão (Tempo p/ Promoção, Risco de Retenção).
5.  Clique em **"Enviar Avaliação"**.
6.  Verifique a mensagem de sucesso.

## 4. Visualização de Resultados e Insights

1.  Volte para a aba do sistema (admin/RH).
2.  Atualize a página de detalhes da avaliação (F5).
3.  Verifique se:
    *   As notas preenchidas pelo gestor aparecem nas competências.
    *   O feedback escrito aparece nos campos correspondentes.
    *   A nota final foi calculada.
4.  Na barra lateral, procure pelo novo painel **"Análise e Insights"**.
5.  Valide os dados apresentados:
    *   Tempo estimado para promoção (deve bater com o preenchido ou calculado).
    *   Gaps e Pontos Fortes destacados.
    *   Recomendações de treinamento.
    *   Próximos passos de carreira (se houver trilha definida).

## 5. Finalização e Envio

1.  Na barra lateral, localize o card "Revisão do Gestor".
2.  Clique em **"Finalizar Avaliação"**. O status deve mudar para "Finalizada" (Verde).
3.  Após finalizar, verifique se aparece a opção **"Enviar Resultado ao Colaborador"** no painel de insights.
4.  Clique em "Enviar Resultado".
5.  Verifique a mensagem de confirmação de envio.

## 6. Dashboard Principal

1.  Volte para a lista de avaliações (`/avaliacao`).
2.  Verifique os cards de topo (KPIs):
    *   Concluídas / Pendentes devem ter atualizado.
    *   Insights Inteligentes (Top Performers, Promoção) devem refletir os dados recém-inseridos.
3.  Na lista de cards, verifique se a avaliação que você acabou de fazer mostra:
    *   Nota final correta.
    *   Status "Finalizada".
    *   Nome do gestor responsável.

---

## 🐞 Solução de Problemas Comuns

*   **Erro ao atribuir gestor**: Verifique se a action `assignManagerToEvaluation` está funcionando e se o banco de dados tem a tabela `EvaluationAssignment`. Tente rodar `npx prisma db push` se necessário.
*   **Link inválido no portal**: Verifique se copiou o link inteiro e se a data de expiração não passou.
*   **Gráficos vazios**: Os gráficos de histórico precisam de pelo menos uma avaliação anterior (fechada) para mostrar evolução. Crie um ciclo passado manualmente no banco se precisar testar isso.
