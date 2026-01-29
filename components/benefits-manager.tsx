'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Gift, Info } from 'lucide-react';
import { getBenefits, upsertBenefit, deleteBenefit } from '@/app/actions/benefits';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function BenefitsManager() {
    const [benefits, setBenefits] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newBenefit, setNewBenefit] = useState({
        name: '',
        type: 'FIXED',
        value: 0,
        description: ''
    });

    useEffect(() => {
        loadBenefits();
    }, []);

    const loadBenefits = async () => {
        const data = await getBenefits();
        setBenefits(data);
        setLoading(false);
    };

    const handleSave = async (data: any) => {
        const result = await upsertBenefit(data);
        if (result.success) {
            loadBenefits();
            setIsAdding(false);
            setNewBenefit({ name: '', type: 'FIXED', value: 0, description: '' });
        } else {
            alert("Erro ao salvar benefício: " + result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este benefício?")) return;
        const result = await deleteBenefit(id);
        if (result.success) loadBenefits();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Gift className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Catálogo de Benefícios</h3>
                        <p className="text-sm text-muted-foreground">Defina os custos extras por colaborador.</p>
                    </div>
                </div>
                <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
                    <Plus className="w-4 h-4 mr-2" /> Novo Benefício
                </Button>
            </div>

            {isAdding && (
                <Card className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                            <div className="space-y-2">
                                <Label>Nome do Benefício</Label>
                                <Input
                                    placeholder="Ex: Vale Refeição"
                                    value={newBenefit.name}
                                    onChange={e => setNewBenefit({ ...newBenefit, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Valor</Label>
                                <select
                                    className="w-full rounded-md border p-2 text-sm bg-white"
                                    value={newBenefit.type}
                                    onChange={e => setNewBenefit({ ...newBenefit, type: e.target.value })}
                                >
                                    <option value="FIXED">Valor Fixo (R$)</option>
                                    <option value="PERCENTAGE">% do Salário</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Valor (Mensal)</Label>
                                <Input
                                    type="number"
                                    value={newBenefit.value}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setNewBenefit({ ...newBenefit, value: val === '' ? 0 : parseFloat(val) })
                                    }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleSave(newBenefit)} className="bg-blue-600">Salvar</Button>
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit) => (
                    <Card key={benefit.id} className="group relative overflow-hidden transition-all hover:border-blue-300">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(benefit.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                {benefit.name}
                            </CardTitle>
                            <CardDescription className="font-mono text-blue-600 font-bold">
                                {benefit.type === 'FIXED'
                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(benefit.value)
                                    : `${benefit.value}% do salário`
                                }
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-sm text-amber-800">
                <Info className="w-5 h-5 shrink-0" />
                <p>Estes benefícios serão disponibilizados para seleção no cadastro individual de cada colaborador. CLT terá incidência de encargos sobre alguns benefícios (conforme legislação vigente simulada).</p>
            </div>
        </div>
    );
}
