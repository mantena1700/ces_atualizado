'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    TrendingUp, TrendingDown, Clock, Target, GraduationCap,
    Send, CheckCircle, XCircle, AlertTriangle, Award,
    BarChart3, LineChart, Lightbulb, ArrowUpRight, Minus
} from 'lucide-react';
import {
    getEmployeeEvaluationHistory,
    getEmployeeInsights,
    sendResultToEmployee
} from '@/app/actions/performance';

interface Props {
    evaluationId: string;
    employeeId: string;
    employeeName: string;
    finalScore: number | null;
    status: string;
}

export function EvaluationInsightsPanel({ evaluationId, employeeId, employeeName, finalScore, status }: Props) {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [evolution, setEvolution] = useState(0);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        loadData();
    }, [evaluationId, employeeId]);

    const loadData = async () => {
        setLoading(true);

        // Carregar insights
        const insightsResult = await getEmployeeInsights(evaluationId);
        if (insightsResult.success) {
            setInsights(insightsResult.insights);
        }

        // Carregar histórico
        const historyResult = await getEmployeeEvaluationHistory(employeeId);
        if (historyResult.success) {
            setHistory(historyResult.history);
            setEvolution(historyResult.evolution);
        }

        setLoading(false);
    };

    const handleSendToEmployee = async () => {
        setSending(true);
        const result = await sendResultToEmployee(evaluationId);
        if (result.success) {
            setSent(true);
        }
        setSending(false);
    };

    const getEvolutionIcon = () => {
        if (evolution > 0) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
        if (evolution < 0) return <TrendingDown className="w-5 h-5 text-rose-500" />;
        return <Minus className="w-5 h-5 text-slate-400" />;
    };

    const getRetentionRiskColor = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'bg-emerald-100 text-emerald-700';
            case 'MEDIUM': return 'bg-amber-100 text-amber-700';
            case 'HIGH': return 'bg-orange-100 text-orange-700';
            case 'CRITICAL': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getRetentionRiskLabel = (risk: string) => {
        switch (risk) {
            case 'LOW': return 'Baixo';
            case 'MEDIUM': return 'Médio';
            case 'HIGH': return 'Alto';
            case 'CRITICAL': return 'Crítico';
            default: return 'N/A';
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Gráfico de Evolução */}
            {history.length > 0 && (
                <Card className="p-6 bg-white border-0 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <LineChart className="w-5 h-5 text-blue-600" />
                            Histórico de Avaliações
                        </h3>
                        <div className="flex items-center gap-2">
                            {getEvolutionIcon()}
                            <span className={`text-sm font-semibold ${evolution > 0 ? 'text-emerald-600' :
                                    evolution < 0 ? 'text-rose-600' : 'text-slate-500'
                                }`}>
                                {evolution > 0 ? '+' : ''}{evolution.toFixed(1)}
                            </span>
                        </div>
                    </div>

                    {/* Mini gráfico de barras */}
                    <div className="flex items-end gap-2 h-24 mb-4">
                        {history.map((h, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
                                    style={{ height: `${((h.finalScore || 0) / 5) * 100}%` }}
                                ></div>
                                <span className="text-xs text-slate-500 mt-2 truncate w-full text-center">
                                    {h.cycleName.split(' ')[0]}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="text-xs text-slate-500 text-center">
                        {history.length} avaliação(ões) no histórico
                    </div>
                </Card>
            )}

            {/* Insights Principais */}
            {insights && (
                <>
                    {/* Tempo para Promoção */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-purple-600" />
                            Tempo Estimado para Promoção
                        </h3>

                        <div className="flex items-center gap-4">
                            <div className="text-4xl font-bold text-purple-700">
                                {insights.timeToPromotion}
                            </div>
                            <div className="text-slate-600">
                                <span className="text-sm">meses</span>
                                <p className="text-xs text-slate-500 mt-1">
                                    {insights.promotionReady
                                        ? '✅ Pronto para promoção!'
                                        : 'Baseado no desempenho atual'}
                                </p>
                            </div>
                        </div>

                        {insights.promotionReady && (
                            <div className="mt-4 p-3 bg-emerald-100 rounded-lg text-sm text-emerald-800 flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Colaborador atende todos os requisitos para promoção
                            </div>
                        )}
                    </Card>

                    {/* Gaps e Pontos Fortes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Gaps */}
                        <Card className="p-6 bg-white border-0 shadow-lg">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Pontos a Desenvolver
                            </h3>

                            {insights.gaps.length > 0 ? (
                                <div className="space-y-3">
                                    {insights.gaps.slice(0, 3).map((gap: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-700">{gap.competency}</span>
                                            <Badge variant="outline" className="text-amber-600 border-amber-200">
                                                Gap: {gap.gap} pts
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Sem gaps identificados. Excelente desempenho!
                                </p>
                            )}
                        </Card>

                        {/* Pontos Fortes */}
                        <Card className="p-6 bg-white border-0 shadow-lg">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-emerald-500" />
                                Pontos Fortes
                            </h3>

                            {insights.strengths.length > 0 ? (
                                <div className="space-y-3">
                                    {insights.strengths.slice(0, 3).map((s: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-700">{s.competency}</span>
                                            <Badge className="bg-emerald-100 text-emerald-700">
                                                {s.score.toFixed(1)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    Nenhum ponto forte destacado ainda.
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* Sugestões de Treinamento */}
                    {insights.trainingSuggestions.length > 0 && (
                        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <GraduationCap className="w-5 h-5 text-amber-600" />
                                Recomendações de Capacitação
                            </h3>

                            <div className="space-y-3">
                                {insights.trainingSuggestions.map((t: any, idx: number) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                                        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{t.area}</p>
                                            <p className="text-xs text-slate-500">{t.suggestion}</p>
                                        </div>
                                        <Badge
                                            className={t.priority === 'Alta'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-amber-100 text-amber-700'
                                            }
                                        >
                                            {t.priority}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Próximos Cargos */}
                    {insights.nextRoles.length > 0 && (
                        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Próximos Passos de Carreira
                            </h3>

                            <div className="space-y-4">
                                {insights.nextRoles.map((role: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-white/70 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-800">{role.roleName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${role.readiness >= 80 ? 'text-emerald-600' :
                                                        role.readiness >= 60 ? 'text-blue-600' :
                                                            role.readiness >= 40 ? 'text-amber-600' : 'text-slate-500'
                                                    }`}>
                                                    {role.readiness}%
                                                </span>
                                                <span className="text-xs text-slate-500">pronto</span>
                                            </div>
                                        </div>
                                        <Progress value={role.readiness} className="h-2" />
                                        {role.requirements && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                {role.requirements}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Risco de Retenção */}
                    <Card className="p-6 bg-white border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-slate-600" />
                            Indicadores de Gestão
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-xs text-slate-500 mb-1">Risco de Retenção</p>
                                <Badge className={getRetentionRiskColor(insights.retentionRisk)}>
                                    {getRetentionRiskLabel(insights.retentionRisk)}
                                </Badge>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-xs text-slate-500 mb-1">Nota Final</p>
                                <span className="text-2xl font-bold text-slate-800">
                                    {insights.finalScore?.toFixed(1) || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {/* Enviar Resultado ao Colaborador */}
            {status === 'DONE' && (
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 border-0 shadow-lg">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Send className="w-5 h-5 text-emerald-600" />
                        Enviar Resultado ao Colaborador
                    </h3>

                    {sent ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm text-emerald-800">
                                Resultado enviado para {employeeName}!
                            </span>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-slate-600 mb-4">
                                Ao enviar, {employeeName} receberá acesso ao resultado da avaliação
                                incluindo notas, feedback e recomendações.
                            </p>
                            <Button
                                onClick={handleSendToEmployee}
                                disabled={sending}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {sending ? (
                                    <span className="animate-pulse">Enviando...</span>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar Resultado
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </Card>
            )}
        </div>
    );
}
