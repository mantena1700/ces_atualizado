'use client';

import { useState } from 'react';
import { createPerformanceCycle } from '@/app/actions/performance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Calendar, Edit3, Loader2, CheckCircle2, Target } from 'lucide-react';

interface NewCycleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewCycleModal({ isOpen, onClose }: NewCycleModalProps) {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [description, setDescription] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createPerformanceCycle({
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description
            });

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setLoading(false);
                onClose();
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName('');
        setStartDate('');
        setEndDate('');
        setDescription('');
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div
                className="w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            >
                <Card className="relative overflow-hidden border-0 shadow-2xl bg-white">
                    {/* Header com fundo degradê */}
                    <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />

                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl">
                                    <Target className="w-6 h-6 text-rose-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Novo Ciclo</h2>
                                    <p className="text-xs text-slate-500 mt-0.5">Configure o período de avaliações</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {success ? (
                            <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Ciclo Criado!</h3>
                                <p className="text-slate-500 mt-1">Redirecionando...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                        Nome do Ciclo
                                    </Label>
                                    <div className="relative">
                                        <Edit3 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="name"
                                            placeholder="Ex: Avaliação Anual 2026"
                                            className="pl-10 h-11 border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start" className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                            Data Início
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="start"
                                                type="date"
                                                className="pl-10 h-11 border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end" className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                            Data Fim
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="end"
                                                type="date"
                                                className="pl-10 h-11 border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="desc" className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                        Descrição <span className="text-slate-300">(opcional)</span>
                                    </Label>
                                    <Input
                                        id="desc"
                                        placeholder="Objetivos do ciclo..."
                                        className="h-11 border-slate-200 focus:border-rose-500 focus:ring-rose-500"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-11"
                                        onClick={handleClose}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-11 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-semibold shadow-lg shadow-rose-200"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        {loading ? 'Criando...' : 'Criar Ciclo'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
