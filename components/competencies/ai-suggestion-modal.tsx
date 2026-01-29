'use client';

import { useState } from 'react';
import { AICompetencySuggestion, suggestCompetenciesWithAI, applyAISuggestions } from '@/app/actions/competencies';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Sparkles, Brain, Check, X, ChevronRight,
    Zap, TrendingUp, Users, Briefcase, Star,
    Loader2, CheckCircle2, Code, Heart, Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AISuggestionModalProps {
    jobRoleId: string;
    onClose: () => void;
}

const categoryConfig = {
    'TECHNICAL': { label: 'Técnica', color: 'bg-blue-100 text-blue-700', icon: Code },
    'BEHAVIORAL': { label: 'Comportamental', color: 'bg-purple-100 text-purple-700', icon: Heart },
    'ORGANIZATIONAL': { label: 'Organizacional', color: 'bg-amber-100 text-amber-700', icon: Building2 }
};

const seniorityLabels = {
    'JUNIOR': 'Júnior',
    'PLENO': 'Pleno',
    'SENIOR': 'Sênior',
    'SPECIALIST': 'Especialista',
    'LEADERSHIP': 'Liderança'
};

export function AISuggestionModal({ jobRoleId, onClose }: AISuggestionModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [suggestions, setSuggestions] = useState<AICompetencySuggestion[] | null>(null);
    const [analysis, setAnalysis] = useState<{
        title: string;
        department: string | null;
        cbo: string | null;
        isLeadership: boolean;
        seniority: string;
    } | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [applied, setApplied] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const result = await suggestCompetenciesWithAI(jobRoleId);
            setSuggestions(result.suggestions);
            setAnalysis(result.analysis);
            // Selecionar todas por padrão
            setSelected(new Set(result.suggestions.map(s => s.competencyId)));
        } catch (error) {
            console.error('Erro ao analisar:', error);
        }
        setLoading(false);
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selected);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelected(newSet);
    };

    const handleApply = async () => {
        if (!suggestions) return;
        setApplying(true);

        const toApply = suggestions
            .filter(s => selected.has(s.competencyId))
            .map(s => ({
                competencyId: s.competencyId,
                levelId: s.suggestedLevelId,
                required: s.required,
                weight: s.weight
            }));

        const result = await applyAISuggestions(jobRoleId, toApply);

        if (result.success) {
            setApplied(true);
            setTimeout(() => {
                router.refresh();
                onClose();
            }, 1500);
        } else {
            alert('Erro: ' + result.error);
        }
        setApplying(false);
    };

    // Estado inicial - botão de análise
    if (!suggestions) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <Card className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl animate-pulse">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">Sugestão Inteligente</h2>
                                <p className="text-white/80 text-sm">Powered by IA • Atualizado 2026</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <p className="text-slate-600">
                            Nossa IA vai analisar o cargo e sugerir as <strong>competências mais adequadas</strong>
                            baseado em:
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                <span className="text-slate-700">Título do Cargo</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg text-sm">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span className="text-slate-700">Departamento</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-sm">
                                <TrendingUp className="w-4 h-4 text-amber-600" />
                                <span className="text-slate-700">Senioridade</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-sm">
                                <Zap className="w-4 h-4 text-emerald-600" />
                                <span className="text-slate-700">Tendências 2026</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" className="flex-1" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                onClick={handleAnalyze}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Analisando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Analisar Cargo
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // Sucesso ao aplicar
    if (applied) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Competências Adicionadas!</h3>
                    <p className="text-slate-500">{selected.size} competências foram configuradas com sucesso</p>
                </Card>
            </div>
        );
    }

    // Mostrar sugestões
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={onClose}>
            <Card className="w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Brain className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">Sugestões da IA</h2>
                                <p className="text-white/80 text-sm">{analysis?.title}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Análise */}
                <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b flex gap-4 flex-wrap">
                    {analysis?.department && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            📍 {analysis.department}
                        </span>
                    )}
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        📊 {seniorityLabels[analysis?.seniority as keyof typeof seniorityLabels] || 'Pleno'}
                    </span>
                    {analysis?.isLeadership && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                            👑 Cargo de Liderança
                        </span>
                    )}
                    {analysis?.cbo && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                            CBO: {analysis.cbo}
                        </span>
                    )}
                </div>

                {/* Lista de Sugestões */}
                <div className="max-h-[400px] overflow-y-auto">
                    {suggestions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Nenhuma sugestão disponível</p>
                            <p className="text-sm">Certifique-se de gerar as competências padrão primeiro</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {suggestions.map(suggestion => {
                                const catConfig = categoryConfig[suggestion.category as keyof typeof categoryConfig] || categoryConfig['TECHNICAL'];
                                const CatIcon = catConfig.icon;
                                const isSelected = selected.has(suggestion.competencyId);

                                return (
                                    <div
                                        key={suggestion.competencyId}
                                        onClick={() => toggleSelection(suggestion.competencyId)}
                                        className={`p-4 cursor-pointer transition-all ${isSelected
                                                ? 'bg-indigo-50 border-l-4 border-indigo-500'
                                                : 'hover:bg-slate-50 border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600'
                                                    : 'border-slate-300'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-800">{suggestion.competencyName}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${catConfig.color}`}>
                                                        {catConfig.label}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                        Nível {suggestion.suggestedLevel} - {suggestion.suggestedLevelName}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500">{suggestion.reason}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={`text-xs ${suggestion.required ? 'text-rose-600' : 'text-slate-500'}`}>
                                                        {suggestion.required ? '⚠️ Obrigatória' : '✓ Desejável'}
                                                    </span>
                                                    <span className="text-xs text-indigo-600">
                                                        Peso {suggestion.weight}/5
                                                    </span>
                                                    <div className="flex-1" />
                                                    <span className={`text-xs font-bold ${suggestion.confidence >= 90 ? 'text-emerald-600' :
                                                            suggestion.confidence >= 80 ? 'text-blue-600' :
                                                                'text-amber-600'
                                                        }`}>
                                                        {suggestion.confidence}% confiança
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        {selected.size} de {suggestions.length} selecionadas
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            onClick={handleApply}
                            disabled={selected.size === 0 || applying}
                        >
                            {applying ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Aplicando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Aplicar {selected.size} Sugestões
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
