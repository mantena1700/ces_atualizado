'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getFactors, createFactor, updateFactor, deleteFactor, createFactorLevel, deleteFactorLevel } from "@/app/actions/factors";
import { Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";

export function FactorsManager() {
    const [factors, setFactors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form Fator
    const [formData, setFormData] = useState({ name: '', weight: '', description: '' });

    // Expandir níveis
    const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
    const [newLevelData, setNewLevelData] = useState({ description: '', points: '', level: '' });

    async function loadData() {
        setLoading(true);
        const data = await getFactors();
        setFactors(data);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveFactor = async () => {
        const payload = {
            name: formData.name,
            weight: parseFloat(formData.weight) || 1.0,
            description: formData.description
        };

        if (editingId) {
            await updateFactor(editingId, payload);
        } else {
            await createFactor(payload);
        }

        setEditingId(null);
        setIsCreating(false);
        setFormData({ name: '', weight: '', description: '' });
        loadData();
    };

    const handleDeleteFactor = async (id: string) => {
        if (confirm("Tem certeza? Isso apagará todas as avaliações ligadas a este fator.")) {
            await deleteFactor(id);
            loadData();
        }
    };

    const handleAddLevel = async (factorId: string) => {
        if (!newLevelData.description || !newLevelData.points) return alert("Preencha descrição e pontos");

        await createFactorLevel(factorId, {
            description: newLevelData.description,
            points: parseInt(newLevelData.points),
            level: parseInt(newLevelData.level) || 0
        });

        setNewLevelData({ description: '', points: '', level: '' });
        loadData();
    };

    const handleDeleteLevel = async (id: string) => {
        if (confirm("Remover este nível?")) {
            await deleteFactorLevel(id);
            loadData();
        }
    };

    const startEdit = (f: any) => {
        setEditingId(f.id);
        setFormData({ name: f.name, weight: f.weight.toString(), description: f.description || '' });
        setIsCreating(true);
    };

    const startNew = () => {
        setEditingId(null);
        setFormData({ name: '', weight: '', description: '' });
        setIsCreating(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Metodologia e Fatores de Avaliação</h3>
                <Button onClick={startNew} size="sm" className="gap-2 bg-slate-900 text-white">
                    <Plus className="w-4 h-4" /> Novo Fator
                </Button>
            </div>

            {isCreating && (
                <Card className="bg-slate-50 border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{editingId ? 'Editar Fator' : 'Adicionar Novo Fator'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome do Fator</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Conhecimento Técnico" />
                            </div>
                            <div className="space-y-2">
                                <Label>Peso (Multiplicador)</Label>
                                <Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="1.0" />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label>Descrição (Opcional)</Label>
                                <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="O que este fator avalia?" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-2 pt-0">
                        <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleSaveFactor}><Save className="w-4 h-4 mr-2" /> Salvar</Button>
                    </CardFooter>
                </Card>
            )}

            <div className="grid gap-4">
                {factors.map(f => (
                    <Card key={f.id} className="overflow-hidden">
                        <div className="p-4 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                    {f.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{f.name}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">Peso: {f.weight}x</span>
                                        <span>{f.levels.length} níveis configurados</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setExpandedFactor(expandedFactor === f.id ? null : f.id)}>
                                    {expandedFactor === f.id ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                                    Níveis
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => startEdit(f)}><Edit2 className="w-4 h-4 text-slate-500" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteFactor(f.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                            </div>
                        </div>

                        {expandedFactor === f.id && (
                            <div className="bg-slate-50/50 border-t p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    <h5 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Níveis de Pontuação</h5>
                                    {f.levels.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum nível configurado.</p>}

                                    <div className="space-y-2">
                                        {f.levels.map((lvl: any) => (
                                            <div key={lvl.id} className="flex items-center justify-between bg-white border p-2 rounded-md shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{lvl.level}</span>
                                                    <span className="text-sm font-medium text-slate-700">{lvl.description}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-blue-600">{lvl.points} pts</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteLevel(lvl.id)}>
                                                        <Trash2 className="w-3 h-3 text-red-300 hover:text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-end gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Ordem</Label>
                                        <Input className="h-8 w-16 bg-white" placeholder="1" value={newLevelData.level} onChange={e => setNewLevelData({ ...newLevelData, level: e.target.value })} />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <Label className="text-xs">Descrição do Nível</Label>
                                        <Input className="h-8 bg-white" placeholder="Ex: Ensino Superior Completo" value={newLevelData.description} onChange={e => setNewLevelData({ ...newLevelData, description: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Pontos Base</Label>
                                        <Input className="h-8 w-24 bg-white" placeholder="100" type="number" value={newLevelData.points} onChange={e => setNewLevelData({ ...newLevelData, points: e.target.value })} />
                                    </div>
                                    <Button size="sm" className="h-8" onClick={() => handleAddLevel(f.id)}><Plus className="w-3 h-3 mr-1" /> Add</Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
