import { EmployeeDetailedData } from '@/app/actions/ninebox-details';

/**
 * Gera insights de IA baseado nos dados da avaliação
 * Função utilitária pura (não é server action)
 */
export function generateAIInsights(data: EmployeeDetailedData): {
    summary: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    riskAnalysis: string;
    evolutionTrend: 'UP' | 'DOWN' | 'STABLE';
} {
    const { competencies, history, finalScore, potentialScore, retentionRisk } = data;

    // Calcular evolução
    let evolutionTrend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (history.length > 0) {
        const lastScore = history[0]?.finalScore || 0;
        if (finalScore > lastScore + 0.3) evolutionTrend = 'UP';
        else if (finalScore < lastScore - 0.3) evolutionTrend = 'DOWN';
    }

    // Identificar competências fortes e fracas
    const strongCompetencies = competencies
        .filter(c => c.score >= c.expected)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const weakCompetencies = competencies
        .filter(c => c.score < c.expected)
        .sort((a, b) => (a.score - a.expected) - (b.score - b.expected))
        .slice(0, 3);

    // Gerar resumo baseado na classificação Nine Box
    const pot = potentialScore || 0;
    let summary = '';

    if (pot >= 66 && finalScore >= 4) {
        summary = `${data.employeeName} é um Top Talent da organização. Demonstra alto desempenho consistente (${finalScore.toFixed(1)}/5.0) combinado com alto potencial de crescimento. Este perfil requer atenção prioritária para retenção e desenvolvimento acelerado.`;
    } else if (pot >= 66 && finalScore >= 2.5) {
        summary = `${data.employeeName} apresenta alto potencial de liderança com desempenho sólido. É candidato natural para programas de desenvolvimento de líderes e exposição a projetos estratégicos.`;
    } else if (pot >= 66 && finalScore < 2.5) {
        summary = `${data.employeeName} possui alto potencial identificado, mas o desempenho atual está abaixo do esperado. Recomenda-se investigar possíveis barreiras e oferecer coaching intensivo.`;
    } else if (pot >= 33 && finalScore >= 4) {
        summary = `${data.employeeName} é um pilar da equipe com alto desempenho consistente. Deve ser valorizado como especialista técnico e potencial mentor.`;
    } else if (pot >= 33 && finalScore >= 2.5) {
        summary = `${data.employeeName} entrega resultados conforme esperado, sendo parte essencial da base estável da equipe. Manter engajamento contínuo é fundamental.`;
    } else if (pot >= 33 && finalScore < 2.5) {
        summary = `${data.employeeName} apresenta desempenho abaixo do esperado. Avaliar fit cultural e considerar realocação ou plano de melhoria estruturado.`;
    } else if (pot < 33 && finalScore >= 4) {
        summary = `${data.employeeName} é expert na função atual com entrega excepcional. Valorizar através de trilha de carreira técnica (carreira em Y) e reconhecimento como SME.`;
    } else if (pot < 33 && finalScore >= 2.5) {
        summary = `${data.employeeName} executa bem as funções operacionais. Manter na função atual com reconhecimento adequado e ajustes salariais periódicos.`;
    } else {
        summary = `${data.employeeName} está em situação crítica com baixo desempenho e potencial limitado. Ação imediata é necessária: avaliar PIP rigoroso ou transição.`;
    }

    // Gerar pontos fortes
    const strengths: string[] = [];
    if (strongCompetencies.length > 0) {
        strengths.push(`Destaque em ${strongCompetencies.map(c => c.competency).join(', ')}`);
    }
    if (finalScore >= 4) strengths.push('Alto desempenho consistente');
    if (evolutionTrend === 'UP') strengths.push('Evolução positiva em relação ao ciclo anterior');
    if (data.strengths) strengths.push(data.strengths);

    // Gerar pontos de melhoria
    const improvements: string[] = [];
    if (weakCompetencies.length > 0) {
        improvements.push(`Desenvolver ${weakCompetencies.map(c => c.competency).join(', ')}`);
    }
    if (evolutionTrend === 'DOWN') improvements.push('Investigar causas da queda de desempenho');
    if (data.improvements) improvements.push(data.improvements);

    // Recomendações
    const recommendations: string[] = [];
    if (data.trainingNeeds) recommendations.push(`Treinamentos: ${data.trainingNeeds}`);
    if (data.nextSteps) recommendations.push(data.nextSteps);
    if (data.promotionReady) recommendations.push('Considerar para próximo ciclo de promoções');
    if (weakCompetencies.length > 0) {
        recommendations.push(`PDI focado em: ${weakCompetencies.map(c => c.competency).join(', ')}`);
    }

    // Análise de risco
    let riskAnalysis = '';
    if (retentionRisk === 'CRITICAL' || retentionRisk === 'HIGH') {
        riskAnalysis = `⚠️ ALTO RISCO DE PERDA: Ação imediata de retenção recomendada. Colaborador pode estar considerando oportunidades externas.`;
    } else if (retentionRisk === 'MEDIUM') {
        riskAnalysis = `⚡ ATENÇÃO: Risco moderado de perda. Monitorar engajamento e satisfação. Considerar ajustes de carreira ou reconhecimento.`;
    } else {
        riskAnalysis = `✅ Baixo risco de perda. Manter acompanhamento regular e garantir desafios alinhados com expectativas.`;
    }

    return {
        summary,
        strengths,
        improvements,
        recommendations,
        riskAnalysis,
        evolutionTrend
    };
}
