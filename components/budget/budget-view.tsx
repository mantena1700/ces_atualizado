'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BadgeDollarSign, Users, AlertCircle, TrendingUp, Pencil, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BudgetOverviewItem, saveDepartmentBudget } from '@/app/actions/budget';
import { useRouter } from 'next/navigation';

interface BudgetViewProps {
    initialData: BudgetOverviewItem[];
    year: number;
}

export function BudgetView({ initialData, year }: BudgetViewProps) {
    const router = useRouter();
    const [editingItem, setEditingItem] = useState<BudgetOverviewItem | null>(null);
    const [editForm, setEditForm] = useState({ budget: '', headcount: '' });
    const [loading, setLoading] = useState(false);

    // Totais Gerais
    const totalBudget = initialData.reduce((acc, i) => acc + i.budgetTarget, 0);
    const totalActual = initialData.reduce((acc, i) => acc + i.budgetActual, 0);
    const totalPct = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

    const totalHC = initialData.reduce((acc, i) => acc + i.headcountTarget, 0);
    const actualHC = initialData.reduce((acc, i) => acc + i.headcountActual, 0);

    const handleEdit = (item: BudgetOverviewItem) => {
        setEditingItem(item);
        setEditForm({
            budget: item.budgetTarget.toString(),
            headcount: item.headcountTarget.toString()
        });
    };

    const handleSave = async () => {
        if (!editingItem) return;
        setLoading(true);
        const result = await saveDepartmentBudget({
            department: editingItem.department,
            year: year,
            monthlyBudget: parseFloat(editForm.budget) || 0,
            headcountLimit: parseInt(editForm.headcount) || 0
        });

        if (result.success) {
            setEditingItem(null);
            router.refresh(); // Recarrega dados do servidor
        } else {
            alert('Erro ao salvar: ' + result.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            {/* Cards de Resumo - Design Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BadgeDollarSign className="w-24 h-24" />
                    </div>
                    <div className="p-6 relative z-10">
                        <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Orçamento Mensal</p>
                        <h2 className="text-3xl font-black tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget)}
                        </h2>
                        <div className="mt-4 flex items-center gap-2 text-sm text-blue-100 bg-white/10 w-fit px-2 py-1 rounded-md backdrop-blur-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Previsão Consolidada
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executado</p>
                                <h2 className={`text-3xl font-black tracking-tight ${totalActual > totalBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalActual)}
                                </h2>
                            </div>
                            <div className={`p-2 rounded-lg ${totalActual > totalBudget ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500">
                                <span>Utilização</span>
                                <span>{totalPct.toFixed(1)}%</span>
                            </div>
                            <Progress
                                value={totalPct > 100 ? 100 : totalPct}
                                className="h-2.5"
                                indicatorClassName={totalPct > 100 ? 'bg-rose-500' : (totalPct > 90 ? 'bg-amber-500' : 'bg-emerald-500')}
                            />
                            <p className="text-[10px] text-slate-400 text-right pt-1">
                                Gap: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget - totalActual)}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="relative overflow-hidden border-none shadow-lg bg-white">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Headcount</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-3xl font-black text-slate-800">{actualHC}</h2>
                                    <span className="text-lg font-medium text-slate-400">/ {totalHC}</span>
                                </div>
                            </div>
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="bg-slate-800 h-full rounded-full"
                                    style={{ width: `${totalHC > 0 ? (actualHC / totalHC) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                                {totalHC - actualHC} vagas open
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabela Detalhada com Visual Refinado */}
            <Card className="overflow-hidden border-none shadow-xl bg-white ring-1 ring-slate-900/5">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Detalhamento por Centro de Custo</h3>
                        <p className="text-sm text-slate-500">Acompanhamento granular de metas e realizado.</p>
                    </div>
                    <div className="text-xs text-slate-400 italic">
                        * Valores incluem Encargos e Benefícios
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Departamento</th>
                                <th className="px-6 py-4 text-center">Headcount</th>
                                <th className="px-6 py-4 w-1/4">Consumo do Budget</th>
                                <th className="px-6 py-4 text-right">Orçado</th>
                                <th className="px-6 py-4 text-right">Realizado</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 w-[60px]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {initialData.map((item) => {
                                const pct = item.budgetTarget > 0 ? (item.budgetActual / item.budgetTarget) * 100 : 0;
                                const isOverBudget = item.budgetActual > item.budgetTarget && item.budgetTarget > 0;

                                return (
                                    <tr key={item.department} className="hover:bg-slate-50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-base">{item.department}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">Centro de Custo</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                <Users className="w-3 h-3 text-slate-400" />
                                                <span className="font-bold text-slate-700">{item.headcountActual}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-slate-500">{item.headcountTarget}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full">
                                                <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                                    <span className="text-slate-500">Progresso</span>
                                                    <span className={isOverBudget ? 'text-rose-600' : 'text-slate-600'}>{pct.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : (pct > 90 ? 'bg-amber-400' : 'bg-blue-500')
                                                            }`}
                                                        style={{ width: `${pct > 100 ? 100 : pct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-slate-500">
                                            {item.budgetTarget > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.budgetTarget) : <span className="text-slate-300">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold text-base ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.budgetActual)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.status === 'danger' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wide border border-rose-100">
                                                    Estourado
                                                </span>
                                            )}
                                            {item.status === 'warning' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wide border border-amber-100">
                                                    Atenção
                                                </span>
                                            )}
                                            {item.status === 'ok' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wide border border-emerald-100">
                                                    Regular
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => handleEdit(item)}
                                                title="Editar Metas"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Linha Totalizadora */}
                            <tr className="bg-slate-100/50 font-bold border-t-2 border-slate-200">
                                <td className="px-6 py-4">TOTAIS</td>
                                <td className="px-6 py-4 text-center">{actualHC} / {totalHC}</td>
                                <td className="px-6 py-4">
                                    <div className="w-full max-w-[180px]">
                                        <Progress value={totalPct > 100 ? 100 : totalPct} className="h-2" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudget)}</td>
                                <td className="px-6 py-4 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalActual)}</td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal de Edição */}
            <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mudar Metas - {editingItem?.department}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Orçamento Mensal (R$)</Label>
                            <Input
                                type="number"
                                value={editForm.budget}
                                onChange={e => setEditForm({ ...editForm, budget: e.target.value })}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-slate-500">Valor total mensal permitido para salários + encargos.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Limite de Headcount</Label>
                            <Input
                                type="number"
                                value={editForm.headcount}
                                onChange={e => setEditForm({ ...editForm, headcount: e.target.value })}
                                placeholder="0"
                            />
                            <p className="text-xs text-slate-500">Número máximo de cadeiras aprovadas.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingItem(null)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando...' : 'Salvar Metas'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
