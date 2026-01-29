'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, Save, Loader2, Star, CheckCircle2, User, Briefcase,
    Calendar, TrendingUp, Award, MessageSquare, Send, ChevronRight,
    Target, Sparkles, AlertCircle, BarChart3, UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveEvaluationScores, submitEvaluation, finalizeEvaluation } from '@/app/actions/performance';
import { EvaluationInsightsPanel } from './evaluation-insights-panel';
import { EvaluationAnalyticsPanel } from './evaluation-analytics-panel';
import { ManagerAssignmentDialog } from './manager-assignment-dialog';
import { EvaluationFeedbackModal } from './evaluation-feedback-modal';

interface Props {
    evaluation: any;
}

export function EvaluationPage({ evaluation }: Props) {
    const router = useRouter();
    const [items, setItems] = useState(evaluation.items);
    const [feedback, setFeedback] = useState({
        general: evaluation.feedback || '',
        strengths: evaluation.strengths || '',
        improvements: evaluation.improvements || ''
    });
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

    const handleScoreChange = (itemId: string, score: number) => {
        setItems((prev: any[]) =>
            prev.map(item =>
                item.id === itemId ? { ...item, score } : item
            )
        );
    };

    const handleCommentChange = (itemId: string, comments: string) => {
        setItems((prev: any[]) =>
            prev.map(item =>
                item.id === itemId ? { ...item, comments } : item
            )
        );
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = items.map((item: any) => ({
            id: item.id,
            score: item.score || 0,
            comments: item.comments || ''
        }));

        await saveEvaluationScores(evaluation.id, payload);
        setSaving(false);
        setLastSaved(new Date());
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await handleSave();
        await submitEvaluation(evaluation.id, feedback);
        setSubmitting(false);
        window.location.reload();
    };

    const handleFinalize = async () => {
        await finalizeEvaluation(evaluation.id);
        window.location.href = '/avaliacao';
    };

    const completedItems = items.filter((i: any) => i.score !== null).length;
    const totalItems = items.length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    const averageScore = items.length > 0
        ? items.reduce((acc: number, item: any) => acc + (item.score || 0), 0) / items.filter((i: any) => i.score).length
        : 0;

    const getScoreLabel = (score: number | null) => {
        if (score === null) return { label: 'Não avaliado', color: 'text-slate-400' };
        if (score >= 4.5) return { label: 'Excepcional', color: 'text-emerald-600' };
        if (score >= 3.5) return { label: 'Acima do Esperado', color: 'text-blue-600' };
        if (score >= 2.5) return { label: 'Dentro do Esperado', color: 'text-amber-600' };
        if (score >= 1.5) return { label: 'Abaixo do Esperado', color: 'text-orange-600' };
        return { label: 'Crítico', color: 'text-rose-600' };
    };

    const getStatusBadge = () => {
        switch (evaluation.status) {
            case 'DONE':
                return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">Finalizada</span>;
            case 'SUBMITTED':
                return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Aguardando Revisão</span>;
            case 'COMPLETED':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Pronta para Envio</span>;
            case 'IN_PROGRESS':
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Em Andamento</span>;
            default:
                return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">Pendente</span>;
        }
    };

    const canEdit = !['DONE', 'SUBMITTED'].includes(evaluation.status);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
            <div className="container mx-auto py-8 px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/avaliacao" className="inline-flex items-center text-slate-500 hover:text-rose-600 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Avaliações
                    </Link>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                {evaluation.employee.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {evaluation.employee.name}
                                </h1>
                                <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="w-4 h-4" />
                                        {evaluation.employee.jobRole?.title || 'Sem cargo'}
                                    </span>
                                    {evaluation.employee.jobRole?.grade && (
                                        <span className="flex items-center gap-1">
                                            <Award className="w-4 h-4" />
                                            {evaluation.employee.jobRole.grade.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {getStatusBadge()}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna Principal - Avaliação */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progresso */}
                        <Card className="p-6 bg-white border-0 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800">Progresso da Avaliação</h2>
                                <span className="text-sm text-slate-500">{completedItems}/{totalItems} competências</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {!isNaN(averageScore) && averageScore > 0 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-slate-500 text-sm">Média parcial</span>
                                    <span className={`text-lg font-bold ${getScoreLabel(averageScore).color}`}>
                                        {averageScore.toFixed(1)} - {getScoreLabel(averageScore).label}
                                    </span>
                                </div>
                            )}
                        </Card>

                        {/* Competências */}
                        <div className="space-y-4">
                            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                <Target className="w-5 h-5 text-rose-600" />
                                Avaliação de Competências
                            </h2>

                            {items.length === 0 ? (
                                <Card className="p-8 text-center bg-white border-0 shadow-lg">
                                    <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                                    <h3 className="font-medium text-slate-800 mb-2">Sem competências definidas</h3>
                                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                                        Este cargo não possui competências vinculadas na Matriz de Competências.
                                        Configure as competências do cargo para habilitar a avaliação.
                                    </p>
                                    <Link href="/competencias" className="mt-4 inline-block">
                                        <Button variant="outline">
                                            Ir para Matriz de Competências
                                        </Button>
                                    </Link>
                                </Card>
                            ) : (
                                items.map((item: any, index: number) => (
                                    <Card key={item.id} className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-all">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Info da Competência */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <span className="text-xs text-slate-400 uppercase tracking-wider">
                                                            {item.competencyCategory || 'Competência'}
                                                        </span>
                                                        <h3 className="font-bold text-slate-800 text-lg mt-1">
                                                            {item.competencyName || `Item ${index + 1}`}
                                                        </h3>
                                                    </div>
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                                        Peso {item.weight}
                                                    </span>
                                                </div>

                                                {item.expectedLevelName && (
                                                    <p className="text-sm text-slate-500 mb-4">
                                                        <span className="font-medium">Nível esperado:</span> {item.expectedLevelName}
                                                    </p>
                                                )}

                                                {canEdit && (
                                                    <div className="mt-4">
                                                        <Label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
                                                            Observações
                                                        </Label>
                                                        <Textarea
                                                            placeholder="Adicione evidências, exemplos ou comentários..."
                                                            value={item.comments || ''}
                                                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                                            className="h-20 resize-none bg-slate-50 border-slate-200 focus:bg-white"
                                                        />
                                                    </div>
                                                )}

                                                {!canEdit && item.comments && (
                                                    <p className="text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg">
                                                        {item.comments}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Avaliação por Estrelas */}
                                            <div className="w-full md:w-48 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50/30 p-4 rounded-2xl">
                                                <span className="text-xs font-bold text-slate-500 uppercase mb-3">
                                                    Avaliação
                                                </span>
                                                <div className="flex gap-1 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => canEdit && handleScoreChange(item.id, star)}
                                                            disabled={!canEdit}
                                                            className={`p-1.5 rounded-lg transition-all ${canEdit ? 'hover:scale-110' : ''} ${(item.score || 0) >= star
                                                                ? 'text-amber-400'
                                                                : 'text-slate-200'
                                                                }`}
                                                        >
                                                            <Star className="w-7 h-7 fill-current" />
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className={`text-sm font-semibold ${getScoreLabel(item.score).color}`}>
                                                    {getScoreLabel(item.score).label}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Feedback Geral */}
                        {canEdit && items.length > 0 && (
                            <Card className="p-6 bg-white border-0 shadow-lg">
                                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
                                    <MessageSquare className="w-5 h-5 text-rose-600" />
                                    Feedback do Gestor
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Pontos Fortes
                                        </Label>
                                        <Textarea
                                            placeholder="Quais são os principais pontos fortes deste colaborador?"
                                            value={feedback.strengths}
                                            onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
                                            className="h-24 bg-emerald-50/50 border-emerald-200 focus:border-emerald-400"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Pontos a Desenvolver
                                        </Label>
                                        <Textarea
                                            placeholder="Quais áreas precisam de desenvolvimento?"
                                            value={feedback.improvements}
                                            onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
                                            className="h-24 bg-amber-50/50 border-amber-200 focus:border-amber-400"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                            Feedback Geral
                                        </Label>
                                        <Textarea
                                            placeholder="Comentários gerais sobre o desempenho no período..."
                                            value={feedback.general}
                                            onChange={(e) => setFeedback({ ...feedback, general: e.target.value })}
                                            className="h-32"
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Feedback Exibição */}
                        {!canEdit && (evaluation.feedback || evaluation.strengths || evaluation.improvements) && (
                            <Card className="p-6 bg-white border-0 shadow-lg">
                                <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-6">
                                    <MessageSquare className="w-5 h-5 text-rose-600" />
                                    Feedback Registrado
                                </h2>

                                <div className="space-y-4">
                                    {evaluation.strengths && (
                                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <h3 className="font-medium text-emerald-800 mb-2">Pontos Fortes</h3>
                                            <p className="text-emerald-700">{evaluation.strengths}</p>
                                        </div>
                                    )}
                                    {evaluation.improvements && (
                                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                            <h3 className="font-medium text-amber-800 mb-2">Pontos a Desenvolver</h3>
                                            <p className="text-amber-700">{evaluation.improvements}</p>
                                        </div>
                                    )}
                                    {evaluation.feedback && (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <h3 className="font-medium text-slate-800 mb-2">Feedback Geral</h3>
                                            <p className="text-slate-700">{evaluation.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">
                        {/* Informações do Colaborador */}
                        <Card className="p-6 bg-white border-0 shadow-lg">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-rose-600" />
                                Informações
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Cargo</span>
                                    <span className="font-medium text-slate-800">
                                        {evaluation.employee.jobRole?.title || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Departamento</span>
                                    <span className="font-medium text-slate-800">
                                        {evaluation.employee.jobRole?.department || 'N/A'}
                                    </span>
                                </div>
                                {evaluation.employee.admissionDate && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Admissão</span>
                                        <span className="font-medium text-slate-800">
                                            {new Date(evaluation.employee.admissionDate).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Ciclo e Gestor */}
                        <Card className="p-6 bg-white border-0 shadow-lg">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-rose-600" />
                                Detalhes da Avaliação
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <span className="block text-slate-500 mb-1">Ciclo</span>
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-slate-800">{evaluation.cycle.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-500 block mt-1">
                                        {new Date(evaluation.cycle.startDate).toLocaleDateString('pt-BR')} - {new Date(evaluation.cycle.endDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>

                                <div className="border-t pt-4">
                                    <span className="block text-slate-500 mb-2">Gestor Responsável</span>
                                    {evaluation.managerName ? (
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">
                                                    {evaluation.managerName.charAt(0)}
                                                </div>
                                                {evaluation.managerName}
                                            </div>
                                            {evaluation.managerEmail && (
                                                <p className="text-xs text-slate-500 mt-0.5 ml-8">{evaluation.managerEmail}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-amber-50 text-amber-700 rounded-lg text-xs mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            Nenhum gestor atribuído
                                        </div>
                                    )}

                                    {canEdit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                            onClick={() => setAssignmentDialogOpen(true)}
                                        >
                                            <UserCheck className="w-3 h-3 mr-2" />
                                            {evaluation.managerName ? 'Alterar Gestor' : 'Atribuir Gestor'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Trilha de Carreira */}
                        {evaluation.careerPath && evaluation.careerPath.nextRoles.length > 0 && (
                            <Card className="p-6 bg-gradient-to-br from-rose-50 to-orange-50 border-0 shadow-lg">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-rose-600" />
                                    Trilha de Carreira
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Próximos passos possíveis para {evaluation.employee.name.split(' ')[0]}:
                                </p>
                                <div className="space-y-2">
                                    {evaluation.careerPath.nextRoles.map((role: any) => (
                                        <Link
                                            key={role.id}
                                            href={`/carreira?role=${role.id}`}
                                            className="flex items-center justify-between p-3 bg-white rounded-xl hover:shadow-md transition-all group"
                                        >
                                            <span className="font-medium text-slate-800 group-hover:text-rose-600">
                                                {role.title}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Ações */}
                        {canEdit && items.length > 0 && (
                            <Card className="p-6 bg-white border-0 shadow-lg">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-rose-600" />
                                    Ações
                                </h3>
                                <div className="space-y-3">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Salvar Rascunho
                                    </Button>

                                    {progress === 100 && (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="w-full bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white"
                                        >
                                            {submitting ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4 mr-2" />
                                            )}
                                            Enviar Avaliação
                                        </Button>
                                    )}

                                    {lastSaved && (
                                        <p className="text-xs text-center text-slate-400">
                                            Salvo às {lastSaved.toLocaleTimeString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Finalizar (para status SUBMITTED) */}
                        {evaluation.status === 'SUBMITTED' && (
                            <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                    Revisão do Gestor
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Confirme que revisou a avaliação e está pronto para finalizá-la.
                                </p>
                                <Button
                                    onClick={handleFinalize}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Finalizar Avaliação
                                </Button>
                            </Card>
                        )}

                        {/* Painel de Insights e Gráficos */}
                        {evaluation.finalScore !== null && (
                            <>
                                <div className="border-t pt-6 mt-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-blue-600" />
                                            Análise e Insights
                                        </h3>
                                        <Button
                                            onClick={() => setFeedbackModalOpen(true)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Ver Feedback Detalhado
                                        </Button>
                                    </div>
                                </div>
                                <EvaluationInsightsPanel
                                    evaluationId={evaluation.id}
                                    employeeId={evaluation.employee.id}
                                    employeeName={evaluation.employee.name}
                                    finalScore={evaluation.finalScore}
                                    status={evaluation.status}
                                />
                            </>
                        )}

                        {/* Painel de Análise com Gráficos */}
                        <EvaluationAnalyticsPanel
                            evaluationId={evaluation.id}
                            employeeId={evaluation.employee.id}
                            currentItems={items}
                            currentScore={averageScore || 0}
                        />
                    </div>
                </div>
            </div>
            <ManagerAssignmentDialog
                evaluationId={evaluation.id}
                employeeName={evaluation.employee.name}
                isOpen={assignmentDialogOpen}
                onClose={() => setAssignmentDialogOpen(false)}
                onAssigned={() => router.refresh()}
            />
            <EvaluationFeedbackModal
                evaluation={evaluation}
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                canEdit={canEdit}
            />
        </div>
    );
}
