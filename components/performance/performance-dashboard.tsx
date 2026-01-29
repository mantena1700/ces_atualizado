'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Target, Calendar, User, ChevronRight, BarChart2, TrendingUp,
    Trophy, AlertTriangle, Rocket, Search, Plus, Users, CheckCircle2,
    Clock, Star, ArrowUpRight, Sparkles, Send, Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewCycleModal } from './new-cycle-modal';
import { BatchManagerAssignmentDialog } from './batch-manager-assignment-dialog';
import {
    createPerformanceCycle,
    initializeEvaluationsForCycle,
    sendBatchNotifications
} from '@/app/actions/performance';
import { toast } from 'sonner';

interface Props {
    cycles: any[];
    activeCycle: any;
    evaluations: any[];
    insights: any;
    employees: any[];
}

export function PerformanceDashboard({ cycles, activeCycle, evaluations, insights, employees }: Props) {
    const [showCycleModal, setShowCycleModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [initializing, setInitializing] = useState(false);
    const [sendingNotifications, setSendingNotifications] = useState(false);

    // Batch Assignment State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBatchAssignDialog, setShowBatchAssignDialog] = useState(false);
    const router = useRouter();

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === filteredEvaluations.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredEvaluations.map(e => e.id)));
        }
    };

    const handleBatchSendNotifications = async () => {
        setSendingNotifications(true);
        const result = await sendBatchNotifications(Array.from(selectedIds));

        if (result.success) {
            toast.success(`${result.count} notificações enviadas com sucesso!`);
            setIsSelectionMode(false);
            setSelectedIds(new Set());
            router.refresh();
        } else {
            toast.error('Erro ao enviar notificações: ' + result.error);
        }
        setSendingNotifications(false);
    };

    const handleInitializeAll = async () => {
        if (!activeCycle) return;
        setInitializing(true);
        await initializeEvaluationsForCycle(activeCycle.id);
        setInitializing(false);
        window.location.reload();
    };

    const filteredEvaluations = evaluations.filter(e =>
        e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.jobRoleTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingEmployees = employees.filter(e => !e.hasEvaluation);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'DONE':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'SUBMITTED':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'Concluída';
            case 'DONE': return 'Finalizada';
            case 'IN_PROGRESS': return 'Em Andamento';
            case 'SUBMITTED': return 'Aguardando Revisão';
            default: return 'Pendente';
        }
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-slate-400';
        if (score >= 4.5) return 'text-emerald-600';
        if (score >= 3.5) return 'text-blue-600';
        if (score >= 2.5) return 'text-amber-600';
        return 'text-rose-600';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30">
            <div className="container mx-auto py-8 px-4 space-y-8">
                {/* Header Premium */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Target className="w-6 h-6" />
                                </div>
                                <span className="text-rose-100 text-sm font-medium uppercase tracking-wider">
                                    Gestão de Performance
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">
                                Avaliação de Desempenho
                            </h1>
                            <p className="text-rose-100 max-w-lg">
                                {activeCycle
                                    ? `Ciclo: ${activeCycle.name} • ${new Date(activeCycle.startDate).toLocaleDateString('pt-BR')} a ${new Date(activeCycle.endDate).toLocaleDateString('pt-BR')}`
                                    : 'Nenhum ciclo ativo. Crie um novo para começar.'
                                }
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {activeCycle && pendingEmployees.length > 0 && (
                                <Button
                                    onClick={handleInitializeAll}
                                    disabled={initializing}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
                                >
                                    {initializing ? (
                                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Users className="w-4 h-4 mr-2" />
                                    )}
                                    Iniciar Todas ({pendingEmployees.length})
                                </Button>
                            )}
                            <Button
                                onClick={() => setShowCycleModal(true)}
                                className="bg-white text-rose-600 hover:bg-rose-50 font-semibold shadow-lg"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Ciclo
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Métricas Principais */}
                {insights && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Média Geral</p>
                                    <h3 className={`text-3xl font-bold mt-1 ${getScoreColor(insights.averageScore)}`}>
                                        {insights.averageScore.toFixed(1)}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">de 5.0 pontos</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Star className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Concluídas</p>
                                    <h3 className="text-3xl font-bold mt-1 text-emerald-600">
                                        {insights.completedEvaluations}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">
                                        de {insights.totalEvaluations} avaliações
                                    </p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Pendentes</p>
                                    <h3 className="text-3xl font-bold mt-1 text-amber-600">
                                        {insights.pendingEvaluations}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">aguardando ação</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium">Prontos p/ Promoção</p>
                                    <h3 className="text-3xl font-bold mt-1 text-rose-600">
                                        {insights.promotionCandidates.length}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">alto desempenho</p>
                                </div>
                                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                    <Rocket className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Insights Inteligentes */}
                {insights && (insights.topPerformers.length > 0 || insights.needsAttention.length > 0 || insights.promotionCandidates.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Performers */}
                        {insights.topPerformers.length > 0 && (
                            <Card className="p-6 bg-white border-0 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-100 rounded-xl">
                                        <Trophy className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Top Performers</h3>
                                </div>
                                <div className="space-y-3">
                                    {insights.topPerformers.map((p: any, i: number) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.role}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-emerald-600">{p.score.toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Candidatos a Promoção */}
                        {insights.promotionCandidates.length > 0 && (
                            <Card className="p-6 bg-white border-0 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-100 rounded-xl">
                                        <Rocket className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Prontos para Promoção</h3>
                                </div>
                                <div className="space-y-3">
                                    {insights.promotionCandidates.map((p: any) => (
                                        <div key={p.id} className="p-3 bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                                                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                                                    {p.readiness}% pronto
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-500 gap-1">
                                                <span>{p.currentRole}</span>
                                                <ArrowUpRight className="w-3 h-3 text-rose-500" />
                                                <span className="font-medium text-rose-600">{p.nextRole}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Precisam de Atenção */}
                        {insights.needsAttention.length > 0 && (
                            <Card className="p-6 bg-white border-0 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-100 rounded-xl">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800">Precisam de Atenção</h3>
                                </div>
                                <div className="space-y-3">
                                    {insights.needsAttention.map((p: any) => (
                                        <div key={p.id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                                                    <p className="text-xs text-slate-500">{p.role}</p>
                                                </div>
                                                <span className="font-bold text-amber-600">{p.score.toFixed(1)}</span>
                                            </div>
                                            {p.gaps.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {p.gaps.map((g: string, i: number) => (
                                                        <span key={i} className="text-xs bg-white text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                                                            {g}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Lista de Avaliações */}
                <Card className="p-6 bg-white border-0 shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Avaliações ({evaluations.length})</h2>
                            <p className="text-slate-500 text-sm">{evaluations.length} colaboradores</p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            {evaluations.length > 0 && (
                                <Button
                                    variant={isSelectionMode ? "secondary" : "outline"}
                                    onClick={() => {
                                        setIsSelectionMode(!isSelectionMode);
                                        setSelectedIds(new Set());
                                    }}
                                    className={isSelectionMode ? "bg-slate-200" : ""}
                                >
                                    {isSelectionMode ? 'Cancelar Seleção' : 'Gerenciar em Lote'}
                                </Button>
                            )}
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nome ou cargo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    {evaluations.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-800 mb-2">
                                Nenhuma avaliação iniciada
                            </h3>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                Clique em "Iniciar Todas" para criar avaliações para todos os colaboradores com cargo definido.
                            </p>
                            {activeCycle && (
                                <Button onClick={handleInitializeAll} disabled={initializing}>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Iniciar Avaliações
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEvaluations.map((evaluation) => (
                                <div key={evaluation.id} className="relative group">
                                    {isSelectionMode && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                                                checked={selectedIds.has(evaluation.id)}
                                                onChange={() => toggleSelection(evaluation.id)}
                                            />
                                        </div>
                                    )}
                                    <Link
                                        href={isSelectionMode ? '#' : `/avaliacao/${evaluation.employeeId}`}
                                        onClick={(e) => {
                                            if (isSelectionMode) {
                                                e.preventDefault();
                                                toggleSelection(evaluation.id);
                                            }
                                        }}
                                        className={`block ${isSelectionMode ? 'cursor-pointer' : ''}`}
                                    >
                                        <Card className={`p-5 border transition-all bg-white 
                                            ${selectedIds.has(evaluation.id)
                                                ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/30'
                                                : 'border-slate-100 hover:border-rose-200 hover:shadow-xl group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-rose-50/50'
                                            }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-lg font-bold text-rose-600">
                                                        {evaluation.employeeName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 line-clamp-1">
                                                            {evaluation.employeeName}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 line-clamp-1">
                                                            {evaluation.jobRoleTitle}
                                                        </p>
                                                        {evaluation.managerName && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
                                                                    {evaluation.managerName.charAt(0)}
                                                                </div>
                                                                <span className="text-xs text-slate-400">
                                                                    {evaluation.managerName.split(' ')[0]}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(evaluation.status)}`}>
                                                    {getStatusLabel(evaluation.status)}
                                                </span>

                                                {evaluation.finalScore !== null ? (
                                                    <div className="text-right">
                                                        <span className={`text-2xl font-bold ${getScoreColor(evaluation.finalScore)}`}>
                                                            {evaluation.finalScore.toFixed(1)}
                                                        </span>
                                                        <span className="text-xs text-slate-400 ml-1">/5</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400">
                                                        {evaluation.completedItems}/{evaluation.totalItems} itens
                                                    </div>
                                                )}
                                            </div>

                                            {!isSelectionMode && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                                    <span className="text-sm text-rose-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Ver Avaliação <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            )}
                                        </Card>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Modal Novo Ciclo */}
                <NewCycleModal
                    isOpen={showCycleModal}
                    onClose={() => setShowCycleModal(false)}
                />

                {/* Batch Assignment Dialog */}
                {showBatchAssignDialog && (
                    <BatchManagerAssignmentDialog
                        evaluationIds={Array.from(selectedIds)}
                        onClose={() => setShowBatchAssignDialog(false)}
                        onSuccess={() => {
                            setShowBatchAssignDialog(false);
                            setIsSelectionMode(false);
                            setSelectedIds(new Set());
                            router.refresh();
                        }}
                    />
                )}

                {/* Floating Action Bar */}
                {isSelectionMode && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl border border-slate-200 px-6 py-3 flex items-center gap-6 z-50 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded-full">{selectedIds.size}</span>
                            selecionados
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleAll}
                                className="text-slate-600 hover:text-slate-900"
                            >
                                {selectedIds.size === filteredEvaluations.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setShowBatchAssignDialog(true)}
                                disabled={selectedIds.size === 0}
                                className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6"
                            >
                                Atribuir Gestor
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleBatchSendNotifications}
                                disabled={selectedIds.size === 0 || sendingNotifications}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
                            >
                                {sendingNotifications ? (
                                    <span className="animate-pulse">Enviando...</span>
                                ) : (
                                    <>
                                        <Send className="w-3 h-3 mr-2" />
                                        Enviar Notificações
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
