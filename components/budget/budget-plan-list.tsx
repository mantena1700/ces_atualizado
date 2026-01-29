'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import {
    Plus, Calendar, FileText, CheckCircle2, Clock, Archive,
    MoreVertical, Copy, Trash2, Eye, TrendingUp, TrendingDown,
    DollarSign, Users, AlertTriangle
} from 'lucide-react';
import { BudgetPlanDTO, createBudgetPlan, deleteBudgetPlan, duplicateBudgetPlan } from '@/app/actions/budget-plan';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BudgetPlanListProps {
    plans: BudgetPlanDTO[];
}

const periodLabels: Record<string, string> = {
    'ANNUAL': 'Anual',
    'SEMESTER': 'Semestral',
    'QUARTER': 'Trimestral',
    'MONTHLY': 'Mensal'
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    'DRAFT': { label: 'Rascunho', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText },
    'APPROVED': { label: 'Aprovado', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
    'CLOSED': { label: 'Encerrado', color: 'bg-slate-100 text-slate-400 border-slate-200', icon: Archive }
};

export function BudgetPlanList({ plans }: BudgetPlanListProps) {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state para criação
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        periodType: 'ANNUAL' as 'ANNUAL' | 'SEMESTER' | 'QUARTER' | 'MONTHLY',
        year: new Date().getFullYear(),
        semester: 1,
        quarter: 1,
        month: 1
    });

    // Form state para duplicação
    const [duplicateForm, setDuplicateForm] = useState({
        name: '',
        year: new Date().getFullYear() + 1
    });

    const handleCreate = async () => {
        setLoading(true);
        const result = await createBudgetPlan({
            name: formData.name,
            description: formData.description || undefined,
            periodType: formData.periodType,
            year: formData.year,
            semester: formData.periodType === 'SEMESTER' ? formData.semester : undefined,
            quarter: formData.periodType === 'QUARTER' ? formData.quarter : undefined,
            month: formData.periodType === 'MONTHLY' ? formData.month : undefined
        });

        if (result.success && result.planId) {
            setShowCreateModal(false);
            router.push(`/orcamento/plano/${result.planId}`);
        } else {
            alert('Erro ao criar: ' + result.error);
        }
        setLoading(false);
    };

    const handleDuplicate = async () => {
        if (!showDuplicateModal) return;
        setLoading(true);
        const result = await duplicateBudgetPlan(showDuplicateModal, duplicateForm.name, duplicateForm.year);
        if (result.success && result.planId) {
            setShowDuplicateModal(null);
            router.push(`/orcamento/plano/${result.planId}`);
        } else {
            alert('Erro ao duplicar: ' + result.error);
        }
        setLoading(false);
    };

    const handleDelete = async (planId: string) => {
        if (!confirm('Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.')) return;
        const result = await deleteBudgetPlan(planId);
        if (result.success) {
            router.refresh();
        } else {
            alert('Erro ao excluir: ' + result.error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Botão de Criar Novo */}
            <div className="flex justify-end">
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano Orçamentário
                </Button>
            </div>

            {/* Lista de Planos */}
            {plans.length === 0 ? (
                <Card className="p-12 text-center border-dashed border-2">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Nenhum Plano Criado</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Clique em "Novo Plano Orçamentário" para começar.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map(plan => {
                        const statusInfo = statusConfig[plan.status] || statusConfig['DRAFT'];
                        const StatusIcon = statusInfo.icon;

                        return (
                            <Card
                                key={plan.id}
                                className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group relative"
                            >
                                {/* Header do Card */}
                                <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 truncate text-lg">{plan.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium text-slate-400">
                                                    {periodLabels[plan.periodType]} • {plan.year}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Body do Card */}
                                <div className="p-5 space-y-4">
                                    {/* KPIs */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <DollarSign className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase">Orçamento</span>
                                            </div>
                                            <p className="font-bold text-slate-800">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL',
                                                    notation: 'compact'
                                                }).format(plan.totalBudget)}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100">
                                            <div className="flex items-center gap-2 text-purple-600 mb-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase">Headcount</span>
                                            </div>
                                            <p className="font-bold text-slate-800">
                                                {plan.totalHeadcount} <span className="text-xs font-normal text-slate-400">pessoas</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info adicional */}
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span>{plan.itemsCount} departamentos</span>
                                        <span>Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>

                                {/* Footer com Ações */}
                                <div className="px-5 py-3 bg-slate-50 border-t flex justify-between items-center">
                                    <Link href={`/orcamento/plano/${plan.id}`}>
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                            <Eye className="w-4 h-4 mr-1" />
                                            Abrir
                                        </Button>
                                    </Link>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-slate-200"
                                            onClick={() => {
                                                setDuplicateForm({ name: `${plan.name} (Cópia)`, year: plan.year + 1 });
                                                setShowDuplicateModal(plan.id);
                                            }}
                                            title="Duplicar Plano"
                                        >
                                            <Copy className="w-4 h-4 text-slate-500" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 hover:bg-red-50"
                                            onClick={() => handleDelete(plan.id)}
                                            title="Excluir Plano"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal de Criação */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Criar Novo Plano Orçamentário
                        </DialogTitle>
                        <DialogDescription>
                            Defina um período e comece a planejar o orçamento de pessoal.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Plano *</Label>
                            <Input
                                placeholder="Ex: Orçamento Anual 2026"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição (opcional)</Label>
                            <Input
                                placeholder="Observações sobre este plano"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Período *</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={formData.periodType}
                                    onChange={e => setFormData({ ...formData, periodType: e.target.value as any })}
                                >
                                    <option value="ANNUAL">Anual</option>
                                    <option value="SEMESTER">Semestral</option>
                                    <option value="QUARTER">Trimestral</option>
                                    <option value="MONTHLY">Mensal</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Ano *</Label>
                                <Input
                                    type="number"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        {formData.periodType === 'SEMESTER' && (
                            <div className="space-y-2">
                                <Label>Semestre</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={formData.semester}
                                    onChange={e => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                                >
                                    <option value={1}>1º Semestre</option>
                                    <option value={2}>2º Semestre</option>
                                </select>
                            </div>
                        )}

                        {formData.periodType === 'QUARTER' && (
                            <div className="space-y-2">
                                <Label>Trimestre</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={formData.quarter}
                                    onChange={e => setFormData({ ...formData, quarter: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Q1 (Jan-Mar)</option>
                                    <option value={2}>Q2 (Abr-Jun)</option>
                                    <option value={3}>Q3 (Jul-Set)</option>
                                    <option value={4}>Q4 (Out-Dez)</option>
                                </select>
                            </div>
                        )}

                        {formData.periodType === 'MONTHLY' && (
                            <div className="space-y-2">
                                <Label>Mês</Label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={formData.month}
                                    onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                >
                                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                                        <option key={i} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={loading || !formData.name}>
                            {loading ? 'Criando...' : 'Criar Plano'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Duplicação */}
            <Dialog open={!!showDuplicateModal} onOpenChange={(open) => !open && setShowDuplicateModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Copy className="w-5 h-5 text-blue-600" />
                            Duplicar Plano
                        </DialogTitle>
                        <DialogDescription>
                            Crie uma cópia deste plano para um novo período.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Novo Plano</Label>
                            <Input
                                value={duplicateForm.name}
                                onChange={e => setDuplicateForm({ ...duplicateForm, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Ano de Referência</Label>
                            <Input
                                type="number"
                                value={duplicateForm.year}
                                onChange={e => setDuplicateForm({ ...duplicateForm, year: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDuplicateModal(null)}>Cancelar</Button>
                        <Button onClick={handleDuplicate} disabled={loading}>
                            {loading ? 'Duplicando...' : 'Duplicar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
