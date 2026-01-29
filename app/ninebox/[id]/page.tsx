'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, Legend, BarChart, Bar
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft, TrendingUp, TrendingDown, Minus, Target, Star,
    Lightbulb, AlertTriangle, CheckCircle2, Award, User, Briefcase,
    Calendar, Mail, BarChart3, ArrowUpRight, ArrowDownRight,
    Clock, Shield, BookOpen
} from 'lucide-react';
import {
    getEmployeeDetailedData,
    EmployeeDetailedData,
    CompetencyRadarData
} from '@/app/actions/ninebox-details';
import { generateAIInsights } from '@/lib/ninebox-insights';

interface PageProps {
    params: Promise<{ id: string }>;
}

// Mapeamento de cores por categoria
const categoryColors = {
    TECHNICAL: '#3b82f6',
    BEHAVIORAL: '#10b981',
    ORGANIZATIONAL: '#8b5cf6'
};

const categoryLabels = {
    TECHNICAL: 'Técnica',
    BEHAVIORAL: 'Comportamental',
    ORGANIZATIONAL: 'Organizacional'
};

export default function EmployeeDetailPage({ params }: PageProps) {
    const router = useRouter();
    const { id } = React.use(params);
    const [data, setData] = useState<EmployeeDetailedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            const result = await getEmployeeDetailedData(id);
            if (result.success && result.data) {
                setData(result.data);
            } else {
                setError(result.error || 'Erro ao carregar dados');
            }
            setLoading(false);
        }
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 font-medium">Carregando análise...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                        <p className="text-slate-600">{error || 'Dados não encontrados'}</p>
                        <Button onClick={() => router.push('/ninebox')} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar à Matriz
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const insights = generateAIInsights(data);

    // Cores para os ciclos históricos
    const cycleColors = [
        { stroke: '#6366f1', fill: '#6366f1', name: 'Atual' },       // Indigo
        { stroke: '#10b981', fill: '#10b981', name: 'Anterior' },    // Emerald
        { stroke: '#f59e0b', fill: '#f59e0b', name: 'Anterior 2' },  // Amber
        { stroke: '#ef4444', fill: '#ef4444', name: 'Anterior 3' },  // Red
    ];

    // Preparar dados para o gráfico radar com histórico
    const radarData = data.competencies.map(c => {
        const baseData: any = {
            subject: c.competency.length > 12 ? c.competency.substring(0, 12) + '...' : c.competency,
            fullName: c.competency,
            competencyId: c.competencyId,
            expected: c.expected,
            score: c.score,
            selfScore: c.selfScore || 0,
            category: c.category
        };

        // Adicionar scores históricos por ciclo
        data.history.forEach((hist, idx) => {
            const histScore = hist.competencyScores?.find(cs => cs.competencyId === c.competencyId);
            baseData[`history_${idx}`] = histScore?.score || 0;
            baseData[`historyName_${idx}`] = hist.cycleName;
        });

        return baseData;
    });

    // Ciclos históricos disponíveis (para a legenda)
    const historicalCycles = data.history.map((h, idx) => ({
        index: idx,
        name: h.cycleName.length > 15 ? h.cycleName.substring(0, 15) + '...' : h.cycleName,
        fullName: h.cycleName,
        color: cycleColors[idx + 1] || { stroke: '#94a3b8', fill: '#94a3b8', name: `Ciclo ${idx}` }
    }));

    // Preparar dados para o histórico
    const historyData = [
        { name: data.cycleName.substring(0, 15), score: data.finalScore, potential: data.potentialScore || 0 },
        ...data.history.map(h => ({
            name: h.cycleName.substring(0, 15),
            score: h.finalScore,
            potential: h.potentialScore || 0
        }))
    ].reverse();

    // Calcular médias por categoria
    const categoryAverages = Object.entries(
        data.competencies.reduce((acc, c) => {
            if (!acc[c.category]) acc[c.category] = { total: 0, count: 0 };
            acc[c.category].total += c.score;
            acc[c.category].count += 1;
            return acc;
        }, {} as Record<string, { total: number; count: number }>)
    ).map(([category, { total, count }]) => ({
        category: categoryLabels[category as keyof typeof categoryLabels] || category,
        average: count > 0 ? total / count : 0,
        color: categoryColors[category as keyof typeof categoryColors] || '#94a3b8'
    }));

    // Classificação Nine Box
    const pot = data.potentialScore || 0;
    let boxLabel = 'Mantenedor';
    let boxColor = 'bg-slate-100 text-slate-800';

    if (pot >= 66 && data.finalScore >= 4) { boxLabel = 'Estrela'; boxColor = 'bg-blue-100 text-blue-800'; }
    else if (pot >= 66 && data.finalScore >= 2.5) { boxLabel = 'Futuro Líder'; boxColor = 'bg-emerald-100 text-emerald-800'; }
    else if (pot >= 66) { boxLabel = 'Enigma'; boxColor = 'bg-amber-100 text-amber-800'; }
    else if (pot >= 33 && data.finalScore >= 4) { boxLabel = 'Profissional Chave'; boxColor = 'bg-teal-100 text-teal-800'; }
    else if (pot >= 33 && data.finalScore < 2.5) { boxLabel = 'Questionável'; boxColor = 'bg-orange-100 text-orange-800'; }
    else if (pot < 33 && data.finalScore >= 4) { boxLabel = 'Especialista'; boxColor = 'bg-violet-100 text-violet-800'; }
    else if (pot < 33 && data.finalScore >= 2.5) { boxLabel = 'Eficaz'; boxColor = 'bg-yellow-100 text-yellow-800'; }
    else if (pot < 33) { boxLabel = 'Risco'; boxColor = 'bg-red-100 text-red-800'; }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header Fixo */}
            <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/ninebox">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar à Matriz
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-slate-200" />
                        <h1 className="font-bold text-slate-800">Análise Detalhada</h1>
                    </div>
                    <Badge className={boxColor}>{boxLabel}</Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* Perfil do Colaborador */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                        <div className="flex items-center gap-6">
                            <Avatar className="w-20 h-20 border-4 border-white/50 shadow-xl">
                                <AvatarFallback className="bg-white text-indigo-600 text-2xl font-bold">
                                    {data.employeeName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{data.employeeName}</h2>
                                <p className="opacity-90 flex items-center gap-2 mt-1">
                                    <Briefcase className="w-4 h-4" />
                                    {data.jobTitle}
                                </p>
                                <div className="flex items-center gap-4 mt-3">
                                    <span className="text-sm opacity-80 flex items-center gap-1">
                                        <Target className="w-3.5 h-3.5" />
                                        {data.department}
                                    </span>
                                    {data.admissionDate && (
                                        <span className="text-sm opacity-80 flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Desde {new Date(data.admissionDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Métricas Rápidas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 border-b">
                        <div className="p-6 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Desempenho</p>
                            <p className="text-3xl font-black text-slate-900">{data.finalScore.toFixed(1)}</p>
                            <p className="text-xs text-slate-400">de 5.0</p>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Potencial</p>
                            <p className="text-3xl font-black text-indigo-600">{pot}%</p>
                            <p className="text-xs text-slate-400">calibrado</p>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evolução</p>
                            <div className="flex items-center justify-center gap-1">
                                {insights.evolutionTrend === 'UP' && <ArrowUpRight className="w-6 h-6 text-emerald-500" />}
                                {insights.evolutionTrend === 'DOWN' && <ArrowDownRight className="w-6 h-6 text-red-500" />}
                                {insights.evolutionTrend === 'STABLE' && <Minus className="w-6 h-6 text-slate-400" />}
                                <span className={`text-lg font-bold ${insights.evolutionTrend === 'UP' ? 'text-emerald-600' :
                                    insights.evolutionTrend === 'DOWN' ? 'text-red-600' : 'text-slate-600'
                                    }`}>
                                    {insights.evolutionTrend === 'UP' ? 'Crescendo' :
                                        insights.evolutionTrend === 'DOWN' ? 'Caindo' : 'Estável'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promoção</p>
                            <p className={`text-lg font-bold ${data.promotionReady ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {data.promotionReady ? 'Pronto' : 'Em desenvolvimento'}
                            </p>
                            {data.timeToPromotion && (
                                <p className="text-xs text-slate-400">{data.timeToPromotion} meses</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Grid de Análises */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Gráfico Radar de Competências */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-600" />
                                    Mapa de Competências
                                </CardTitle>
                                <CardDescription>
                                    Comparativo entre ciclos de avaliação
                                    {historicalCycles.length > 0 && (
                                        <span className="ml-2 text-xs">
                                            ({historicalCycles.length + 1} ciclos)
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {radarData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={380}>
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
                                                {/* Nível Esperado (base) */}
                                                <Radar
                                                    name="Nível Esperado"
                                                    dataKey="expected"
                                                    stroke="#94a3b8"
                                                    fill="#94a3b8"
                                                    fillOpacity={0.15}
                                                    strokeDasharray="5 5"
                                                    strokeWidth={2}
                                                />
                                                {/* Ciclos Históricos (mais antigos primeiro, mais transparentes) */}
                                                {historicalCycles.slice().reverse().map((cycle, idx) => (
                                                    <Radar
                                                        key={cycle.index}
                                                        name={cycle.name}
                                                        dataKey={`history_${cycle.index}`}
                                                        stroke={cycle.color.stroke}
                                                        fill={cycle.color.fill}
                                                        fillOpacity={0.15 + (idx * 0.05)}
                                                        strokeWidth={1.5}
                                                        strokeDasharray="3 3"
                                                    />
                                                ))}
                                                {/* Ciclo Atual (destaque) */}
                                                <Radar
                                                    name={`${data.cycleName.substring(0, 12)}... (Atual)`}
                                                    dataKey="score"
                                                    stroke="#6366f1"
                                                    fill="#6366f1"
                                                    fillOpacity={0.4}
                                                    strokeWidth={2.5}
                                                />
                                                <Legend
                                                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                                                    iconSize={10}
                                                />
                                                <RechartsTooltip
                                                    content={({ payload }) => {
                                                        if (!payload?.length) return null;
                                                        const item = payload[0].payload;
                                                        return (
                                                            <div className="bg-white p-3 rounded-lg shadow-xl border text-xs max-w-xs">
                                                                <p className="font-bold text-slate-800 mb-2 border-b pb-1">{item.fullName}</p>
                                                                <div className="space-y-1">
                                                                    <p className="flex justify-between">
                                                                        <span className="text-slate-500">Esperado:</span>
                                                                        <span className="font-medium">{item.expected}</span>
                                                                    </p>
                                                                    <p className="flex justify-between text-indigo-600 font-semibold">
                                                                        <span>✦ Atual:</span>
                                                                        <span>{item.score?.toFixed(1) || '-'}</span>
                                                                    </p>
                                                                    {historicalCycles.map((cycle) => {
                                                                        const histValue = item[`history_${cycle.index}`];
                                                                        if (!histValue) return null;
                                                                        return (
                                                                            <p key={cycle.index} className="flex justify-between" style={{ color: cycle.color.stroke }}>
                                                                                <span>○ {cycle.name}:</span>
                                                                                <span>{histValue?.toFixed(1) || '-'}</span>
                                                                            </p>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>

                                        {/* Legenda de Cores */}
                                        {historicalCycles.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-3 justify-center border-t pt-4">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                                    <span className="text-slate-600 font-medium">Atual</span>
                                                </div>
                                                {historicalCycles.map((cycle) => (
                                                    <div key={cycle.index} className="flex items-center gap-1.5 text-xs">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: cycle.color.fill }}
                                                        />
                                                        <span className="text-slate-500">{cycle.name}</span>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <div className="w-3 h-3 rounded-full bg-slate-300 border border-dashed border-slate-400" />
                                                    <span className="text-slate-500">Esperado</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="h-[350px] flex items-center justify-center text-slate-400">
                                        <p>Sem dados de competências para exibir</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Evolução Histórica */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                    Evolução por Ciclo
                                </CardTitle>
                                <CardDescription>Histórico de desempenho e potencial ao longo do tempo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {historyData.length > 1 ? (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={historyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                            />
                                            <YAxis
                                                domain={[0, 5]}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                            />
                                            <RechartsTooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                name="Desempenho"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                dot={{ r: 6, fill: '#6366f1' }}
                                                activeDot={{ r: 8 }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="potential"
                                                name="Potencial (%)"
                                                stroke="#10b981"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                                dot={{ r: 4, fill: '#10b981' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[350px] flex flex-col items-center justify-center text-slate-400 space-y-2">
                                        <Clock className="w-8 h-8" />
                                        <p>Esta é a primeira avaliação do colaborador</p>
                                        <p className="text-xs">O histórico aparecerá nos próximos ciclos</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Média por Categoria */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500" />
                                    Desempenho por Categoria
                                </CardTitle>
                                <CardDescription>Média das competências agrupadas por tipo</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {categoryAverages.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={categoryAverages} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 5]} />
                                            <YAxis
                                                type="category"
                                                dataKey="category"
                                                width={120}
                                                tick={{ fontSize: 12 }}
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
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-slate-400">
                                        <p>Sem dados de categorias</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Análise de Risco */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <Card className={`border-2 ${data.retentionRisk === 'CRITICAL' || data.retentionRisk === 'HIGH'
                            ? 'border-red-200 bg-red-50/50'
                            : data.retentionRisk === 'MEDIUM'
                                ? 'border-amber-200 bg-amber-50/50'
                                : 'border-emerald-200 bg-emerald-50/50'
                            }`}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className={`w-5 h-5 ${data.retentionRisk === 'CRITICAL' || data.retentionRisk === 'HIGH'
                                        ? 'text-red-600'
                                        : data.retentionRisk === 'MEDIUM'
                                            ? 'text-amber-600'
                                            : 'text-emerald-600'
                                        }`} />
                                    Análise de Risco de Perda
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {insights.riskAnalysis}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Insights de IA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-500" />
                                Análise Inteligente
                            </CardTitle>
                            <CardDescription>Insights gerados com base nos dados da avaliação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Resumo */}
                            <div className="bg-white/80 rounded-xl p-4 border border-indigo-100">
                                <h4 className="font-bold text-slate-800 mb-2">Resumo Executivo</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{insights.summary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Pontos Fortes */}
                                <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100">
                                    <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Pontos Fortes
                                    </h4>
                                    <ul className="space-y-2">
                                        {insights.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                                                <span className="text-emerald-500 mt-1">•</span>
                                                {s}
                                            </li>
                                        ))}
                                        {insights.strengths.length === 0 && (
                                            <li className="text-sm text-slate-500 italic">Sem dados suficientes</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Pontos de Melhoria */}
                                <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-100">
                                    <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Pontos de Melhoria
                                    </h4>
                                    <ul className="space-y-2">
                                        {insights.improvements.map((s, i) => (
                                            <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                                                <span className="text-amber-500 mt-1">•</span>
                                                {s}
                                            </li>
                                        ))}
                                        {insights.improvements.length === 0 && (
                                            <li className="text-sm text-slate-500 italic">Sem gaps identificados</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Recomendações */}
                            <div className="bg-blue-50/80 rounded-xl p-4 border border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    Recomendações de Desenvolvimento
                                </h4>
                                <ul className="space-y-2">
                                    {insights.recommendations.map((r, i) => (
                                        <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                                            <span className="text-blue-500 mt-1">→</span>
                                            {r}
                                        </li>
                                    ))}
                                    {insights.recommendations.length === 0 && (
                                        <li className="text-sm text-slate-500 italic">Manter acompanhamento regular</li>
                                    )}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feedback do Gestor */}
                {(data.feedback || data.strengths || data.improvements) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-slate-600" />
                                    Feedback do Gestor
                                </CardTitle>
                                {data.managerName && (
                                    <CardDescription>Avaliado por {data.managerName}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.feedback && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-500 mb-1">Feedback Geral</h4>
                                        <p className="text-slate-700">{data.feedback}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {data.strengths && (
                                        <div className="bg-emerald-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-emerald-700 mb-1">Pontos Fortes</h4>
                                            <p className="text-sm text-emerald-800">{data.strengths}</p>
                                        </div>
                                    )}
                                    {data.improvements && (
                                        <div className="bg-amber-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-amber-700 mb-1">Melhorias</h4>
                                            <p className="text-sm text-amber-800">{data.improvements}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
