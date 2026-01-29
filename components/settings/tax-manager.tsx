'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getTaxSettings, saveTax, deleteTax, TaxSetting } from '@/app/actions/settings';
import { BadgeDollarSign, Save, Loader2, Info, Plus, Trash2, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function TaxManager() {
    const [taxes, setTaxes] = useState<TaxSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Estado para nova taxa
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTax, setNewTax] = useState({ label: '', value: '0', description: '', category: 'PJ' as 'PJ' | 'CLT' });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const data = await getTaxSettings();
        setTaxes(data);
        setLoading(false);
    }

    const handleChange = (key: string, field: keyof TaxSetting, value: string) => {
        setTaxes(prev => prev.map(t => {
            if (t.key !== key) return t;
            if (field === 'value') {
                return { ...t, value: parseFloat(value) || 0 };
            }
            return { ...t, [field]: value };
        }));
    };

    const handleSaveItem = async (tax: TaxSetting) => {
        setSavingId(tax.key);
        const result = await saveTax(tax);
        if (result.success) {
            // alert("Salvo!"); 
        } else {
            alert("Erro ao salvar.");
        }
        setSavingId(null);
    };

    const handleDelete = async (key: string) => {
        if (!confirm("Tem certeza que deseja remover este encargo?")) return;

        const result = await deleteTax(key);
        if (result.success) {
            setTaxes(prev => prev.filter(t => t.key !== key));
        }
    };

    const handleCreate = async () => {
        const key = `TAX_${newTax.category}_${Date.now()}`;
        const taxToSave: TaxSetting = {
            key,
            label: newTax.label,
            value: parseFloat(newTax.value) || 0,
            description: newTax.description,
            category: newTax.category,
            isCustom: true
        };

        const result = await saveTax(taxToSave);
        if (result.success) {
            setTaxes(prev => [...prev, taxToSave]);
            setIsAddOpen(false);
            setNewTax({ label: '', value: '0', description: '', category: 'PJ' });
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Carregando configurações...</div>;

    const renderGroup = (category: 'CLT' | 'PJ', title: string, subtitle: string, colorClass: string, iconColor: string) => {
        const groupTaxes = taxes.filter(t => t.category === category);
        const total = groupTaxes.reduce((acc, t) => acc + t.value, 0);

        return (
            <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`${colorClass} p-2 rounded-lg ${iconColor}`}>
                            <BadgeDollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                            <p className="text-sm text-slate-500">{subtitle}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        setNewTax(prev => ({ ...prev, category }));
                        setIsAddOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar
                    </Button>
                </div>

                <div className="space-y-3 flex-1">
                    {groupTaxes.map(tax => (
                        <div key={tax.key} className="group relative bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                    {/* Edição Inline de Label e Descrição */}
                                    <Input
                                        className="h-7 text-sm font-bold border-transparent px-0 hover:border-slate-200 focus:border-blue-500 focus:px-2 transition-all -ml-2 w-full"
                                        value={tax.label}
                                        onChange={(e) => handleChange(tax.key, 'label', e.target.value)}
                                        onBlur={() => handleSaveItem(tax)}
                                        placeholder="Nome do Encargo"
                                    />
                                    <Input
                                        className="h-6 text-xs text-slate-500 border-transparent px-0 hover:border-slate-200 focus:border-blue-500 focus:px-2 transition-all -ml-2 w-full"
                                        value={tax.description}
                                        onChange={(e) => handleChange(tax.key, 'description', e.target.value)}
                                        onBlur={() => handleSaveItem(tax)}
                                        placeholder="Descrição curta (opcional)"
                                    />
                                </div>

                                <div className="flex items-center gap-2 self-start pt-1">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="w-20 text-right font-mono font-bold h-8 pr-7"
                                            value={tax.value}
                                            onChange={(e) => handleChange(tax.key, 'value', e.target.value)}
                                            onBlur={() => handleSaveItem(tax)}
                                        />
                                        <span className="absolute right-2 top-1.5 text-xs font-bold text-slate-400">%</span>
                                    </div>

                                    {/* Botão de Excluir (somente para customs ou se quisermos liberar tudo) */}
                                    {tax.isCustom && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                            onClick={() => handleDelete(tax.key)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Feedback visual de salvamento */}
                            {savingId === tax.key && (
                                <div className="absolute right-2 bottom-2">
                                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                                </div>
                            )}
                        </div>
                    ))}

                    {groupTaxes.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm">
                            Nenhum encargo configurado.
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Total {category}: <strong className="text-slate-800 text-lg">{total.toFixed(2)}%</strong>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <>
            <div className="grid gap-8 md:grid-cols-2 h-full items-start">
                {renderGroup('CLT', 'Encargos CLT', 'Incidem sobre salário base CLT.', 'bg-blue-50', 'text-blue-600')}
                {renderGroup('PJ', 'Custos PJ & Outros', 'Custos operacionais / variaveis.', 'bg-emerald-50', 'text-emerald-600')}
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Novo Encargo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome do Encargo</Label>
                            <Input
                                placeholder="Ex: Taxa Administrativa"
                                value={newTax.label}
                                onChange={e => setNewTax({ ...newTax, label: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Input
                                placeholder="Ex: Cobrado mensalmente sobre a nota"
                                value={newTax.description}
                                onChange={e => setNewTax({ ...newTax, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Valor (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={newTax.value}
                                    onChange={e => setNewTax({ ...newTax, value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label>Categoria</Label>
                                <div className="flex h-10 items-center gap-4 px-3 border rounded-md bg-slate-50 text-sm font-medium text-slate-600">
                                    {newTax.category}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={!newTax.label}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
