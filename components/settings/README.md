# Componentes de Configuração

Componentes dedicados às telas de configuração do sistema.

## `tax-manager.tsx` (Gerenciador de Encargos)
Interface moderna para gestão de alíquotas e custos fixos incidentes sobre a folha.

### Funcionalidades:
- **Edição Inline**: Permite alterar o nome (Label), descrição e valor percentual/absoluto diretamente na tabela, sem necessidade de abrir formulários de edição.
- **Autosave**: Ações de salvar são disparadas automaticamente `onBlur`, proporcionando uma experiência fluida.
- **Taxas Customizadas**: Permite adicionar novos itens de custo além dos padrões legais (FGTS, INSS, etc.), tanto para regimes CLT quanto PJ.
- **Feedback Visual**: Indicadores de carga e sucesso durante o salvamento.
