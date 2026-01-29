'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Trash2, Plus, X } from 'lucide-react';
import { updateGradeConfig, createGrade, deleteGrade, createStep, updateStep, deleteStep } from '@/app/actions/matrix-config';

interface GradesConfigProps {
    grades: any[];
    steps?: any[];
    onClose: () => void;
}

export function GradesConfigModal({ grades: initialGrades, steps: initialSteps = [], onClose }: GradesConfigProps) {
    const [activeTab, setActiveTab] = useState<'grades' | 'steps'>('grades');
    const [grades, setGrades] = useState(initialGrades);
    const [steps, setSteps] = useState(initialSteps);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // States for NEW items
    const [newGrade, setNewGrade] = useState({ name: '', minPoints: 0, maxPoints: 0 });
    const [newStep, setNewStep] = useState('');

    // --- BUTTON HANDLERS ---
    const reload = () => window.location.reload();

    // Grades Handlers
    const handleUpdateGrade = async (grade: any) => {
        setLoadingId(grade.id);
        await updateGradeConfig(grade.id, { name: grade.name, minPoints: Number(grade.minPoints), maxPoints: Number(grade.maxPoints) });
        setLoadingId(null);
    };

    const handleCreateGrade = async () => {
        if (!newGrade.name) return;
        setLoadingId('new-grade');
        await createGrade(newGrade);
        setLoadingId(null);
        reload();
    };

    const handleDeleteGrade = async (id: string) => {
        if (!confirm("Excluir Grade?")) return;
        setLoadingId(id);
        const res = await deleteGrade(id);
        if (!res.success) alert(res.error);
        else setGrades(grades.filter(g => g.id !== id));
        setLoadingId(null);
        reload();
    };

    // Steps Handlers
    const handleUpdateStep = async (step: any) => {
        setLoadingId(step.id);
        await updateStep(step.id, step.name);
        setLoadingId(null);
    };

    const handleCreateStep = async () => {
        if (!newStep) return;
        setLoadingId('new-step');
        await createStep({ name: newStep });
        setLoadingId(null);
        reload();
    };

    const handleDeleteStep = async (id: string) => {
        if (!confirm("Excluir Step e todos os seus valores?")) return;
        setLoadingId(id);
        const res = await deleteStep(id);
        if (!res.success) alert(res.error);
        else setSteps(steps.filter(s => s.id !== id));
        setLoadingId(null);
        reload();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-card border rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
                <div className="p-6 border-b flex justify-between items-center bg-muted/10">
                    <div>
                        <h3 className="text-lg font-bold">Configuração da Matriz</h3>
                        <p className="text-muted-foreground text-sm">Gerencie as linhas (Grades) e colunas (Steps).</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>

                {/* TABS HEADER */}
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'grades' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/20'}`}
                        onClick={() => setActiveTab('grades')}
                    >
                        Grades (Linhas)
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'steps' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:bg-muted/20'}`}
                        onClick={() => setActiveTab('steps')}
                    >
                        Steps (Colunas)
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    {activeTab === 'grades' ? (
                        /* --- GRADES TAB --- */
                        <div className="grid gap-4">
                            {grades.map(grade => (
                                <div key={grade.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/10">
                                    <div className="col-span-5 space-y-1">
                                        <Label className="text-xs">Nome</Label>
                                        <Input value={grade.name} onChange={e => setGrades(grades.map(g => g.id === grade.id ? { ...g, name: e.target.value } : g))} />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Min</Label>
                                        <Input type="number" value={grade.minPoints} onChange={e => setGrades(grades.map(g => g.id === grade.id ? { ...g, minPoints: e.target.value } : g))} />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        <Label className="text-xs">Max</Label>
                                        <Input type="number" value={grade.maxPoints} onChange={e => setGrades(grades.map(g => g.id === grade.id ? { ...g, maxPoints: e.target.value } : g))} />
                                    </div>
                                    <div className="col-span-1 flex gap-1 pb-1">
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleUpdateGrade(grade)} disabled={loadingId === grade.id}>
                                            <Settings2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteGrade(grade.id)} disabled={loadingId === grade.id}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {/* New Grade */}
                            <div className="border-t pt-4 mt-2">
                                <Label>Adicionar Grade</Label> <span className="text-xs text-muted-foreground">(Nível Hierárquico)</span>
                                <div className="grid grid-cols-12 gap-2 mt-2">
                                    <div className="col-span-5"><Input placeholder="Nome (Ex: G-08)" value={newGrade.name} onChange={e => setNewGrade({ ...newGrade, name: e.target.value })} /></div>
                                    <div className="col-span-3"><Input type="number" placeholder="Min" value={newGrade.minPoints} onChange={e => setNewGrade({ ...newGrade, minPoints: Number(e.target.value) })} /></div>
                                    <div className="col-span-3"><Input type="number" placeholder="Max" value={newGrade.maxPoints} onChange={e => setNewGrade({ ...newGrade, maxPoints: Number(e.target.value) })} /></div>
                                    <div className="col-span-1"><Button size="icon" onClick={handleCreateGrade} disabled={loadingId === 'new-grade'}><Plus className="w-4 h-4" /></Button></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- STEPS TAB --- */
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {steps.map(step => (
                                    <div key={step.id} className="flex items-center gap-2 border p-3 rounded-md bg-muted/10">
                                        <div className="flex-1">
                                            <Label className="text-xs mb-1 block">Nome do Step</Label>
                                            <Input
                                                value={step.name}
                                                onChange={e => setSteps(steps.map(s => s.id === step.id ? { ...s, name: e.target.value } : s))}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 mt-5">
                                            <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleUpdateStep(step)} disabled={loadingId === step.id}>
                                                <Settings2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDeleteStep(step.id)} disabled={loadingId === step.id}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <Label>Adicionar Step</Label> <span className="text-xs text-muted-foreground">(Coluna Vertical)</span>
                                <div className="flex gap-2 mt-2 max-w-sm">
                                    <Input placeholder="Nome (Ex: F, G, Senior I)" value={newStep} onChange={e => setNewStep(e.target.value)} />
                                    <Button onClick={handleCreateStep} disabled={loadingId === 'new-step'}>
                                        <Plus className="w-4 h-4 mr-2" /> Adicionar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-muted/20 flex justify-end">
                    <Button onClick={onClose}>Concluir</Button>
                </div>
            </div>
        </div>
    );
}
