'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getEvaluationByToken, saveManagerEvaluation } from '@/app/actions/performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    User,
    Briefcase,
    Star,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Clock,
    Send,
    Save
} from 'lucide-react';

interface EvaluationData {
    evaluation: {
        id: string;
        employee: {
            name: string;
            email: string | null;
            admissionDate: Date | null;
            jobRole: {
                title: string;
                department: string | null;
                grade: { name: string } | null;
            } | null;
        };
        cycle: {
            name: string;
            startDate: Date;
            endDate: Date;
        };
        items: {
            id: string;
            type: string;
            weight: number;
            competency: {
                name: string;
                category: string;
                levels: { id: string; level: number; name: string }[];
            } | null;
            competencyLevelId: string | null;
        }[];
    };
    managerName: string;
    tokenExpires: Date;
}

export default function ManagerPortalPage() {
    const params = useParams();
    const token = params.token as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EvaluationData | null>(null);
    const [success, setSuccess] = useState(false);

    // Estado das notas e comentários
    const [scores, setScores] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState('');
    const [strengths, setStrengths] = useState('');
    const [improvements, setImprovements] = useState('');
    const [nextSteps, setNextSteps] = useState('');
    const [trainingNeeds, setTrainingNeeds] = useState('');
    const [promotionReady, setPromotionReady] = useState(false);
    const [timeToPromotion, setTimeToPromotion] = useState<number | undefined>(undefined);
    const [retentionRisk, setRetentionRisk] = useState('LOW');

    useEffect(() => {
        loadEvaluation();
    }, [token]);

    const loadEvaluation = async () => {
        setLoading(true);
        const result = await getEvaluationByToken(token);
        if (result.success && result.data) {
            setData(result.data);
            // Inicializar notas
            const initialScores: Record<string, number> = {};
            result.data.evaluation.items.forEach((item: any) => {
                initialScores[item.id] = item.score || 3;
            });
            setScores(initialScores);
        } else {
            setError(result.error || 'Erro ao carregar avaliação');
        }
        setLoading(false);
    };

    const handleScoreChange = (itemId: string, score: number) => {
        setScores(prev => ({ ...prev, [itemId]: score }));
    };

    const handleSubmit = async () => {
        if (!data) return;

        setSubmitting(true);

        const itemsToSubmit = Object.entries(scores).map(([id, score]) => ({
            id,
            managerScore: score,
            comments: comments[id]
        }));

        const result = await saveManagerEvaluation(token, {
            items: itemsToSubmit,
            feedback,
            strengths,
            improvements,
            nextSteps,
            trainingNeeds,
            promotionReady,
            timeToPromotion,
            retentionRisk
        });

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Erro ao salvar avaliação');
        }

        setSubmitting(false);
    };

    const getProgress = () => {
        if (!data) return 0;
        const filled = Object.keys(scores).length;
        const total = data.evaluation.items.length;
        return Math.round((filled / total) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-slate-600">Carregando avaliação...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Acesso Negado</h2>
                        <p className="text-slate-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Avaliação Enviada!</h2>
                        <p className="text-slate-600">
                            A avaliação de {data?.evaluation.employee.name} foi registrada com sucesso.
                        </p>
                        <p className="text-sm text-slate-500 mt-4">
                            Você pode fechar esta página.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) return null;

    const { evaluation, managerName } = data;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Star className="w-4 h-4" />
                        Portal de Avaliação de Desempenho
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Avaliação de {evaluation.employee.name}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        Ciclo: {evaluation.cycle.name}
                    </p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Colaborador</p>
                                <p className="font-semibold text-slate-800">{evaluation.employee.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Cargo</p>
                                <p className="font-semibold text-slate-800">{evaluation.employee.jobRole?.title || 'Não definido'}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Gestor Avaliador</p>
                                <p className="font-semibold text-slate-800">{managerName}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress */}
                <Card className="mb-8">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700">Progresso da Avaliação</span>
                            <span className="text-sm font-bold text-blue-600">{getProgress()}%</span>
                        </div>
                        <Progress value={getProgress()} className="h-2" />
                    </CardContent>
                </Card>

                {/* Competências */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500" />
                            Avaliação de Competências
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {evaluation.items.map((item: any) => {
                            const expectedLevel = item.competency?.levels?.find(
                                (l: any) => l.id === item.competencyLevelId
                            );

                            return (
                                <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">
                                                {item.competency?.name || 'Competência'}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.competency?.category || 'GERAL'}
                                                </Badge>
                                                {expectedLevel && (
                                                    <span className="text-xs text-slate-500">
                                                        Nível esperado: {expectedLevel.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-700">
                                            Peso {item.weight}
                                        </Badge>
                                    </div>

                                    {/* Escala de Notas */}
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-500 mb-2">Selecione a nota:</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((score) => (
                                                <button
                                                    key={score}
                                                    onClick={() => handleScoreChange(item.id, score)}
                                                    className={`
                                                        w-12 h-12 rounded-lg font-bold text-lg transition-all
                                                        flex items-center justify-center
                                                        ${scores[item.id] === score
                                                            ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }
                                                    `}
                                                >
                                                    {score}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                                            <span>Insatisfatório</span>
                                            <span>Excepcional</span>
                                        </div>
                                    </div>

                                    {/* Comentário */}
                                    <Textarea
                                        placeholder="Comentários sobre esta competência (opcional)"
                                        value={comments[item.id] || ''}
                                        onChange={(e) => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                                        className="text-sm"
                                        rows={2}
                                    />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Feedback Geral */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            Feedback e Recomendações
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Feedback Geral *
                            </label>
                            <Textarea
                                placeholder="Escreva um feedback geral sobre o desempenho do colaborador"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Pontos Fortes *
                                </label>
                                <Textarea
                                    placeholder="Destaque os pontos fortes"
                                    value={strengths}
                                    onChange={(e) => setStrengths(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Pontos a Melhorar *
                                </label>
                                <Textarea
                                    placeholder="Áreas que precisam de desenvolvimento"
                                    value={improvements}
                                    onChange={(e) => setImprovements(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Próximos Passos
                                </label>
                                <Textarea
                                    placeholder="Ações recomendadas para o próximo período"
                                    value={nextSteps}
                                    onChange={(e) => setNextSteps(e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Necessidades de Treinamento
                                </label>
                                <Textarea
                                    placeholder="Treinamentos ou capacitações sugeridos"
                                    value={trainingNeeds}
                                    onChange={(e) => setTrainingNeeds(e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Indicadores de Promoção */}
                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-semibold text-slate-800 mb-3">Indicadores de Progressão</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="promotionReady"
                                        checked={promotionReady}
                                        onChange={(e) => setPromotionReady(e.target.checked)}
                                        className="w-5 h-5 rounded border-slate-300"
                                    />
                                    <label htmlFor="promotionReady" className="text-sm text-slate-700">
                                        Pronto para promoção
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">
                                        Tempo estimado p/ promoção (meses)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="36"
                                        value={timeToPromotion || ''}
                                        onChange={(e) => setTimeToPromotion(e.target.value ? parseInt(e.target.value) : undefined)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        placeholder="Ex: 6"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">
                                        Risco de Retenção
                                    </label>
                                    <select
                                        value={retentionRisk}
                                        onChange={(e) => setRetentionRisk(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="LOW">Baixo</option>
                                        <option value="MEDIUM">Médio</option>
                                        <option value="HIGH">Alto</option>
                                        <option value="CRITICAL">Crítico</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" disabled={submitting}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Rascunho
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || !feedback || !strengths || !improvements}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Enviar Avaliação
                    </Button>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>PCCS DOM Seven - Sistema de Gestão de Pessoas</p>
                    <p className="mt-1">Esta avaliação é confidencial</p>
                </div>
            </div>
        </div>
    );
}
