'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, BarChart, Bar
} from 'recharts';
import {
    Target, BarChart3, TrendingUp, TrendingDown, Minus,
    Lightbulb, CheckCircle2, AlertTriangle, BookOpen, Clock,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
    getEvaluationHistoryData,
    EvaluationHistoryData
} from '@/app/actions/evaluation-analytics';

interface Props {
    evaluationId: string;
    employeeId: string;
    currentItems: any[];
    currentScore: number;
}

const categoryLabels: Record<string, string> = {
    TECHNICAL: 'Técnica',
    BEHAVIORAL: 'Comportamental',
    ORGANIZATIONAL: 'Organizacional'
};

export function EvaluationAnalyticsPanel({ evaluationId, employeeId, currentItems, currentScore }: Props) {
    const [historyData, setHistoryData] = useState<EvaluationHistoryData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            const result = await getEvaluationHistoryData(employeeId, evaluationId);
            if (result.success && result.data) {
                setHistoryData(result.data);
            }
            setLoading(false);
        }
        loadHistory();
    }, [employeeId, evaluationId]);

    // Preparar dados para o gráfico radar das competências atuais
    const radarData = currentItems
        .filter((item: any) => item.score)
        .map((item: any) => ({
            subject: (item.competencyName || 'Item').length > 12
                ? (item.competencyName || 'Item').substring(0, 12) + '...'
                : (item.competencyName || 'Item'),
            fullName: item.competencyName || 'Item',
            score: item.score || 0,
            expected: item.expectedLevel || 3,
            category: item.competencyCategory
        }));

    // Calcular médias por categoria
    const categoryData = currentItems.reduce((acc, item) => {
        const cat = item.competencyCategory || 'OUTROS';
        if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
        if (item.score) {
            acc[cat].total += item.score;
            acc[cat].count += 1;
        }
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const categoryAverages = Object.keys(categoryData).map((category) => {
        const d = categoryData[category];
        return {
            category: categoryLabels[category] || category,
            average: d.count > 0 ? d.total / d.count : 0
        };
    });

    // Calcular evolução
    const getEvolutionTrend = () => {
        if (!historyData?.previousEvaluations?.length) return 'FIRST';
        const lastScore = historyData.previousEvaluations[0]?.finalScore || 0;
        if (currentScore > lastScore + 0.3) return 'UP';
        if (currentScore < lastScore - 0.3) return 'DOWN';
        return 'STABLE';
    };

    const evolutionTrend = getEvolutionTrend();

    // Gerar insights baseados nos dados
    const generateInsights = () => {
        const strengths: string[] = [];
        const improvements: string[] = [];
        const recommendations: string[] = [];

        // Análise de competências
        currentItems.forEach((item: any) => {
            if (item.score >= 4) {
                strengths.push(`Excelente desempenho em ${item.competencyName}`);
            } else if (item.score && item.score < 3) {
                improvements.push(`Desenvolver ${item.competencyName}`);
            }
        });

        // Análise de evolução
        if (evolutionTrend === 'UP') {
            strengths.push('Tendência de evolução positiva em relação ao ciclo anterior');
        } else if (evolutionTrend === 'DOWN') {
            improvements.push('Atenção: queda de desempenho em relação ao ciclo anterior');
        }

        // Recomendações baseadas nos gaps
        const gaps = currentItems.filter((item: any) => item.score && item.expectedLevel && item.score < item.expectedLevel);
        gaps.forEach((gap: any) => {
            recommendations.push(`Capacitação em ${gap.competencyName} para atingir nível esperado`);
        });

        if (recommendations.length === 0 && currentScore >= 4) {
            recommendations.push('Considerar para projetos de maior complexidade');
            recommendations.push('Avaliar potencial para mentoria de novos colaboradores');
        }

        return { strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 3), recommendations: recommendations.slice(0, 3) };
    };

    const insights = generateInsights();

    // Preparar dados históricos para o gráfico
    const historyChartData = historyData?.previousEvaluations?.length
        ? [
            { name: 'Atual', score: currentScore },
            ...historyData.previousEvaluations.map(e => ({
                name: e.cycleName.length > 10 ? e.cycleName.substring(0, 10) + '...' : e.cycleName,
                score: e.finalScore
            }))
        ].reverse()
        : [];

    if (loading) {
        return (
            <Card className="p-6 bg-white border-0 shadow-lg animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-32 bg-slate-100 rounded"></div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Gráfico Radar de Competências */}
            {radarData.length > 2 && (
                <Card className="p-6 bg-white border-0 shadow-lg">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="w-5 h-5 text-indigo-600" />
                            Mapa de Competências
                        </CardTitle>
                        <CardDescription>Visualização comparativa entre notas obtidas e níveis esperados</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                                <PolarGrid strokeDasharray="3 3" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 5]}
                                    tick={{ fontSize: 9 }}
                                />
                                <Radar
                                    name="Esperado"
                                    dataKey="expected"
                                    stroke="#94a3b8"
                                    fill="#94a3b8"
                                    fillOpacity={0.2}
                                    strokeDasharray="5 5"
                                />
                                <Radar
                                    name="Obtido"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.5}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <RechartsTooltip
                                    content={({ payload }) => {
                                        if (!payload?.length) return null;
                                        const item = payload[0].payload;
                                        return (
                                            <div className="bg-white p-2 rounded-lg shadow-lg border text-xs">
                                                <p className="font-bold text-slate-800">{item.fullName}</p>
                                                <p className="text-indigo-600">Obtido: {item.score.toFixed(1)}</p>
                                                <p className="text-slate-500">Esperado: {item.expected}</p>
                                            </div>
                                        );
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Desempenho por Categoria */}
            {categoryAverages.length > 0 && (
                <Card className="p-6 bg-white border-0 shadow-lg">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                            Média por Categoria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={categoryAverages} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                                <YAxis
                                    type="category"
                                    dataKey="category"
                                    width={90}
                                    tick={{ fontSize: 11 }}
                                />
                                <RechartsTooltip
                                    formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                                />
                                <Bar
                                    dataKey="average"
                                    name="Média"
                                    radius={[0, 4, 4, 0]}
                                    fill="#6366f1"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Evolução Histórica */}
            {historyChartData.length > 1 && (
                <Card className="p-6 bg-white border-0 shadow-lg">
                    <CardHeader className="p-0 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Evolução Histórica
                            </CardTitle>
                            <Badge className={`
                                ${evolutionTrend === 'UP' ? 'bg-emerald-100 text-emerald-700' : ''}
                                ${evolutionTrend === 'DOWN' ? 'bg-red-100 text-red-700' : ''}
                                ${evolutionTrend === 'STABLE' ? 'bg-slate-100 text-slate-700' : ''}
                                ${evolutionTrend === 'FIRST' ? 'bg-blue-100 text-blue-700' : ''}
                            `}>
                                {evolutionTrend === 'UP' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                                {evolutionTrend === 'DOWN' && <ArrowDownRight className="w-3 h-3 mr-1" />}
                                {evolutionTrend === 'STABLE' && <Minus className="w-3 h-3 mr-1" />}
                                {evolutionTrend === 'FIRST' && <Clock className="w-3 h-3 mr-1" />}
                                {evolutionTrend === 'UP' ? 'Crescendo' :
                                    evolutionTrend === 'DOWN' ? 'Caindo' :
                                        evolutionTrend === 'STABLE' ? 'Estável' : 'Primeira'}
                            </Badge>
                        </div>
                        <CardDescription>Comparativo de desempenho nos últimos ciclos</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={historyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <YAxis
                                    domain={[0, 5]}
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                />
                                <RechartsTooltip />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    name="Desempenho"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: '#6366f1' }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Primeira Avaliação - Mensagem */}
            {historyChartData.length <= 1 && (
                <Card className="p-6 bg-blue-50 border-blue-100 shadow-lg">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-blue-500" />
                        <div>
                            <h4 className="font-bold text-blue-800">Primeira Avaliação</h4>
                            <p className="text-sm text-blue-600">
                                Este é o primeiro ciclo de avaliação do colaborador. O histórico aparecerá nos próximos ciclos.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Insights de IA */}
            {(insights.strengths.length > 0 || insights.improvements.length > 0) && (
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 shadow-lg">
                    <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-amber-500" />
                            Análise Inteligente
                        </CardTitle>
                        <CardDescription>Insights baseados nos dados da avaliação</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                        {/* Pontos Fortes */}
                        {insights.strengths.length > 0 && (
                            <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100">
                                <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Pontos Fortes
                                </h4>
                                <ul className="space-y-1">
                                    {insights.strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Pontos de Melhoria */}
                        {insights.improvements.length > 0 && (
                            <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-100">
                                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    Pontos de Melhoria
                                </h4>
                                <ul className="space-y-1">
                                    {insights.improvements.map((s, i) => (
                                        <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Recomendações */}
                        {insights.recommendations.length > 0 && (
                            <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                                    <BookOpen className="w-4 h-4" />
                                    Recomendações
                                </h4>
                                <ul className="space-y-1">
                                    {insights.recommendations.map((r, i) => (
                                        <li key={i} className="text-xs text-blue-700 flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5">→</span>
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
