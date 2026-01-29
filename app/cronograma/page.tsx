'use client';

import { useState, useEffect } from 'react';
import { getPhases, createPhase, deletePhase, assignToPhase } from '@/app/actions/schedule';
import { calculateEnquadramento } from '@/app/actions/simulations';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CalendarDays,
    Plus,
    Trash2,
    ChevronRight,
    Clock,
    CheckCircle2,
    DollarSign,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CronogramaPage() {
    const [phases, setPhases] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    async function loadData() {
        try {
            setLoading(true);
            const [ps, enq] = await Promise.all([
                getPhases(),
                calculateEnquadramento()
            ]);
            console.log("Dados carregados:", ps, enq);
            setPhases(ps);
            setAllEmployees(enq.data);
        } catch (error) {
            console.error("Erro ao carregar cronograma:", error);
            alert("Erro ao carregar dados. Verifique o console.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createPhase({ name: newName, targetDate: newDate });
        if (res.success) {
            setNewName('');
            setNewDate('');
            setShowAdd(false);
            loadData();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Deletar esta fase?")) {
            await deletePhase(id);
            loadData();
        }
    };

    const getCustoFase = (phaseEmployees: any[]) => {
        return phaseEmployees.reduce((acc, emp) => {
            // Re-calcular o gap para este funcionário
            const empDetails = allEmployees.find(ae => ae.id === emp.id);
            return acc + (empDetails?.gap || 0);
        }, 0);
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando cronograma...</div>;

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cronograma de Implementação</h2>
                    <p className="text-muted-foreground">Planeje as ondas de enquadramento salarial ao longo do tempo.</p>
                </div>
                <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
                    <Plus className="w-4 h-4" /> Nova Fase
                </Button>
            </div>

            {showAdd && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader><CardTitle className="text-lg">Cadastrar Nova Onda de Ajuste</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label>Nome da Fase</Label>
                                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Onda 1 - Prioridade" required />
                            </div>
                            <div className="space-y-1">
                                <Label>Data Prevista</Label>
                                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full">Criar Fase</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LISTA DE FASES */}
                <div className="lg:col-span-2 space-y-6">
                    {phases.length === 0 ? (
                        <div className="text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
                            Nenhuma fase cadastrada. Crie a primeira fase para organizar o cronograma.
                        </div>
                    ) : (
                        phases.map((phase, index) => {
                            const custo = getCustoFase(phase.employees);
                            return (
                                <Card key={phase.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl">{phase.name}</CardTitle>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <CalendarDays className="w-3 h-3" />
                                                        {new Date(phase.targetDate).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(phase.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-6 mt-2">
                                            <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3">
                                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500">Investimento</p>
                                                    <p className="text-lg font-bold">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custo)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-3">
                                                <Users className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-slate-500">Colaboradores</p>
                                                    <p className="text-lg font-bold">{phase.employees.length}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-xs font-semibold mb-2 text-slate-400">Pessoas vinculadas a esta fase:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {phase.employees.map((emp: any) => (
                                                    <span key={emp.id} className="px-2 py-1 bg-white border rounded text-xs shadow-sm">
                                                        {emp.name}
                                                    </span>
                                                ))}
                                                {phase.employees.length === 0 && <span className="text-xs italic text-slate-400">Ninguém vinculado</span>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* SIDEBAR: VINCULAR PESSOAS */}
                <Card className="h-fit sticky top-8">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" /> Aguardando Fase
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">Pessoas que ainda não foram alocadas em um cronograma.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                            {allEmployees
                                .filter(ae => !phases.some(p => p.employees.some((e: any) => e.id === ae.id)))
                                .map(ae => (
                                    <div key={ae.id} className="p-3 border rounded-lg bg-white flex justify-between items-center group">
                                        <div>
                                            <p className="text-sm font-semibold">{ae.name}</p>
                                            <p className="text-[10px] text-rose-500 font-bold">Gap: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ae.gap)}</p>
                                        </div>
                                        {phases.length > 0 && (
                                            <div className="flex gap-1">
                                                {phases.map((p, idx) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => assignToPhase([ae.id], p.id).then(loadData)}
                                                        className="h-6 w-6 rounded bg-slate-100 hover:bg-primary hover:text-white text-[10px] font-bold transition-colors"
                                                        title={`Adicionar à ${p.name}`}
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
