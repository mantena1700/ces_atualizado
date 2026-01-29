'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import {
    Plus, ArrowLeft, Save, CheckCircle2, AlertTriangle, XCircle,
    DollarSign, Users, TrendingUp, TrendingDown, Pencil, Trash2,
    FileCheck, FileClock, Archive, MoreVertical
} from 'lucide-react';
import {
    BudgetPlanDetailDTO,
    BudgetPlanItemDTO,
    upsertBudgetPlanItem,
    deleteBudgetPlanItem,
    updateBudgetPlan,
    getAvailableDepartments
} from '@/app/actions/budget-plan';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BudgetPlanDetailProps {
    plan: BudgetPlanDetailDTO;
    availableDepartments: string[];
}

const statusColors = {
    'ok': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'warning': 'bg-amber-50 text-amber-600 border-amber-200',
    'danger': 'bg-rose-50 text-rose-600 border-rose-200'
};

const statusIcons = {
    'ok': CheckCircle2,
    'warning': AlertTriangle,
    'danger': XCircle
};

const statusLabels = {
    'ok': 'Regular',
    'warning': 'Atenção',
    'danger': 'Estourado'
};

export function BudgetPlanDetail({ plan, availableDepartments }: BudgetPlanDetailProps) {
    const router = useRouter();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<BudgetPlanItemDTO | null>(null);
    const [loading, setLoading] = useState(false);

    // Form para adicionar/editar item
    const [itemForm, setItemForm] = useState({
        department: '',
        plannedBudget: '',
        plannedHeadcount: '',
        notes: ''
    });

    // Cálculos de resumo
    const utilizationPct = plan.totalBudget > 0
        ? (plan.totalActualBudget / plan.totalBudget) * 100
        : 0;

    const varianceClass = plan.overallVariance >= 0 ? 'text-emerald-600' : 'text-rose-600';
    const varianceIcon = plan.overallVariance >= 0 ? TrendingDown : TrendingUp;
    const VarianceIcon = varianceIcon;

    const handleOpenAdd = () => {
        setItemForm({ department: '', plannedBudget: '', plannedHeadcount: '', notes: '' });
        setEditingItem(null);
        setShowAddModal(true);
    };

    const handleOpenEdit = (item: BudgetPlanItemDTO) => {
        setItemForm({
            department: item.department,
            plannedBudget: item.plannedBudget.toString(),
            plannedHeadcount: item.plannedHeadcount.toString(),
            notes: item.notes || ''
        });
        setEditingItem(item);
        setShowAddModal(true);
    };

    const handleSaveItem = async () => {
        setLoading(true);
        const result = await upsertBudgetPlanItem(plan.id, {
            department: itemForm.department,
            plannedBudget: parseFloat(itemForm.plannedBudget) || 0,
            plannedHeadcount: parseInt(itemForm.plannedHeadcount) || 0,
            notes: itemForm.notes || undefined
        });

        if (result.success) {
            setShowAddModal(false);
            router.refresh();
        } else {
            alert('Erro ao salvar: ' + result.error);
        }
        setLoading(false);
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Remover este departamento do plano?')) return;
        const result = await deleteBudgetPlanItem(itemId);
        if (result.success) {
            router.refresh();
        } else {
            alert('Erro ao remover: ' + result.error);
        }
    };

    const handleChangeStatus = async (newStatus: 'DRAFT' | 'APPROVED' | 'CLOSED') => {
        const result = await updateBudgetPlan(plan.id, { status: newStatus });
        if (result.success) {
            router.refresh();
        } else {
            alert('Erro ao atualizar status: ' + result.error);
        }
    };

    // Departamentos ainda não adicionados
    const usedDepartments = plan.items.map(i => i.department);
    const availableForAdd = availableDepartments.filter(d => !usedDepartments.includes(d));

    return (
        <div className="space-y-8">
            {/* Header com Botões */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/orcamento">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{plan.name}</h1>
                        <p className="text-sm text-slate-500">{plan.description || 'Sem descrição'}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {plan.status === 'DRAFT' && (
                        <Button
                            variant="outline"
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleChangeStatus('APPROVED')}
                        >
                            <FileCheck className="w-4 h-4 mr-2" />
                            Aprovar Plano
                        </Button>
                    )}
                    {plan.status === 'APPROVED' && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => handleChangeStatus('DRAFT')}
                            >
                                <FileClock className="w-4 h-4 mr-2" />
                                Voltar para Rascunho
                            </Button>
                            <Button
                                variant="outline"
                                className="border-slate-300"
                                onClick={() => handleChangeStatus('CLOSED')}
                            >
                                <Archive className="w-4 h-4 mr-2" />
                                Encerrar
                            </Button>
                        </>
                    )}
                    <Button onClick={handleOpenAdd} disabled={plan.status === 'CLOSED'}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Departamento
                    </Button>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
                    <div className="flex items-center gap-2 text-blue-100 text-xs font-bold uppercase mb-2">
                        <DollarSign className="w-4 h-4" />
                        Orçamento Planejado
                    </div>
                    <p className="text-2xl font-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.totalBudget)}
                    </p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Executado (Real)
                    </div>
                    <p className="text-2xl font-black text-slate-800">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.totalActualBudget)}
                    </p>
                    <div className="mt-2">
                        <Progress
                            value={utilizationPct > 100 ? 100 : utilizationPct}
                            className="h-2"
                            indicatorClassName={utilizationPct > 100 ? 'bg-rose-500' : (utilizationPct > 90 ? 'bg-amber-500' : 'bg-blue-500')}
                        />
                        <p className="text-xs text-slate-500 mt-1">{utilizationPct.toFixed(1)}% utilizado</p>
                    </div>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                        <VarianceIcon className="w-4 h-4" />
                        Variância
                    </div>
                    <p className={`text-2xl font-black ${varianceClass}`}>
                        {plan.overallVariance >= 0 ? '+' : ''}
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.overallVariance)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {plan.overallVariance >= 0 ? 'Sobra de orçamento' : 'Acima do orçamento'}
                    </p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                        <Users className="w-4 h-4" />
                        Headcount
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-black text-slate-800">{plan.totalActualHeadcount}</p>
                        <p className="text-lg text-slate-400">/ {plan.totalHeadcount}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {plan.totalHeadcount - plan.totalActualHeadcount} vagas disponíveis
                    </p>
                </Card>
            </div>

            {/* Tabela Comparativa */}
            <Card className="overflow-hidden border-none shadow-xl ring-1 ring-slate-900/5">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <h3 className="font-bold text-lg text-slate-800">Comparativo por Departamento</h3>
                    <p className="text-sm text-slate-500">Planejado vs Realizado em tempo real</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-6 py-4 text-left">Departamento</th>
                                <th className="px-6 py-4 text-center">Headcount</th>
                                <th className="px-6 py-4 text-right">Planejado</th>
                                <th className="px-6 py-4 text-right">Realizado</th>
                                <th className="px-6 py-4 text-right">Variância</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 w-[100px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plan.items.map(item => {
                                const StatusIcon = statusIcons[item.status];
                                const pct = item.plannedBudget > 0
                                    ? (item.actualBudget / item.plannedBudget) * 100
                                    : 0;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{item.department}</div>
                                            {item.notes && (
                                                <p className="text-xs text-slate-400 mt-0.5 italic truncate max-w-[200px]">{item.notes}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-sm">
                                                <span className="font-bold text-slate-700">{item.actualHeadcount}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-slate-500">{item.plannedHeadcount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-500">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.plannedBudget)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${item.actualBudget > item.plannedBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.actualBudget)}
                                            </span>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${pct > 100 ? 'bg-rose-500' : (pct > 90 ? 'bg-amber-400' : 'bg-blue-500')
                                                        }`}
                                                    style={{ width: `${pct > 100 ? 100 : pct}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold ${item.budgetVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {item.budgetVariance >= 0 ? '+' : ''}
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.budgetVariance)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusColors[item.status]}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusLabels[item.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-blue-50"
                                                    onClick={() => handleOpenEdit(item)}
                                                    disabled={plan.status === 'CLOSED'}
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-red-50"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    disabled={plan.status === 'CLOSED'}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {plan.items.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                        <p>Nenhum departamento adicionado ainda.</p>
                                        <p className="text-sm">Clique em "Adicionar Departamento" para começar.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Adicionar/Editar Item */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Editar Meta do Departamento' : 'Adicionar Departamento ao Plano'}
                        </DialogTitle>
                        <DialogDescription>
                            Defina a verba e o headcount planejado para este departamento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Departamento *</Label>
                            {editingItem ? (
                                <Input value={itemForm.department} disabled />
                            ) : (
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                                    value={itemForm.department}
                                    onChange={e => setItemForm({ ...itemForm, department: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {availableForAdd.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                    {/* Permite adicionar departamento manual */}
                                    <option value="__custom__">+ Outro (digitar)</option>
                                </select>
                            )}
                            {itemForm.department === '__custom__' && (
                                <Input
                                    placeholder="Digite o nome do departamento"
                                    onChange={e => setItemForm({ ...itemForm, department: e.target.value })}
                                    className="mt-2"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Orçamento Planejado (R$) *</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={itemForm.plannedBudget}
                                    onChange={e => setItemForm({ ...itemForm, plannedBudget: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Headcount Planejado *</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={itemForm.plannedHeadcount}
                                    onChange={e => setItemForm({ ...itemForm, plannedHeadcount: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Observações</Label>
                            <Input
                                placeholder="Notas ou justificativas (opcional)"
                                value={itemForm.notes}
                                onChange={e => setItemForm({ ...itemForm, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancelar</Button>
                        <Button
                            onClick={handleSaveItem}
                            disabled={loading || !itemForm.department || itemForm.department === '__custom__'}
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
