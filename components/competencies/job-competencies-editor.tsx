'use client';

import { useState } from 'react';
import { addCompetencyToJob, updateJobCompetency, removeCompetencyFromJob } from '@/app/actions/competencies';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AISuggestionModal } from './ai-suggestion-modal';
import {
    ArrowLeft, Plus, Trash2, Save, Brain, Building2, Award,
    Star, Code, Heart, Target, ChevronDown, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface JobCompetenciesEditorProps {
    data: {
        role: {
            id: string;
            title: string;
            department: string | null;
            grade: string | null;
        };
        assignedCompetencies: {
            id: string;
            competencyId: string;
            competencyName: string;
            category: string;
            critical: boolean;
            levels: { id: string; level: number; name: string }[];
            currentLevelId: string;
            currentLevel: number;
            currentLevelName: string;
            required: boolean;
            weight: number;
        }[];
        allCompetencies: {
            id: string;
            name: string;
            category: string;
            critical: boolean;
            levels: { id: string; level: number; name: string }[];
        }[];
    };
}

const categoryConfig = {
    'TECHNICAL': { label: 'Técnica', color: 'bg-blue-100 text-blue-700', icon: Code },
    'BEHAVIORAL': { label: 'Comportamental', color: 'bg-purple-100 text-purple-700', icon: Heart },
    'ORGANIZATIONAL': { label: 'Organizacional', color: 'bg-amber-100 text-amber-700', icon: Building2 }
};

const levelColors = [
    'border-slate-300 bg-slate-50',
    'border-blue-300 bg-blue-50',
    'border-emerald-300 bg-emerald-50',
    'border-amber-300 bg-amber-50',
    'border-purple-300 bg-purple-50',
    'border-rose-300 bg-rose-50'
];

export function JobCompetenciesEditor({ data }: JobCompetenciesEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [newComp, setNewComp] = useState({
        competencyId: '',
        levelId: '',
        required: true,
        weight: 3
    });

    // Competências não atribuídas
    const unassignedCompetencies = data.allCompetencies.filter(
        c => !data.assignedCompetencies.find(ac => ac.competencyId === c.id)
    );

    const handleAdd = async () => {
        if (!newComp.competencyId || !newComp.levelId) return;
        setLoading('add');
        const result = await addCompetencyToJob(
            data.role.id,
            newComp.competencyId,
            newComp.levelId,
            newComp.required,
            newComp.weight
        );
        if (result.success) {
            setShowAddModal(false);
            setNewComp({ competencyId: '', levelId: '', required: true, weight: 3 });
            router.refresh();
        } else {
            alert('Erro: ' + result.error);
        }
        setLoading(null);
    };

    const handleUpdateLevel = async (id: string, levelId: string) => {
        setLoading(id);
        await updateJobCompetency(id, { levelId });
        router.refresh();
        setLoading(null);
    };

    const handleUpdateRequired = async (id: string, required: boolean) => {
        setLoading(id);
        await updateJobCompetency(id, { required });
        router.refresh();
        setLoading(null);
    };

    const handleUpdateWeight = async (id: string, weight: number) => {
        setLoading(id);
        await updateJobCompetency(id, { weight });
        router.refresh();
        setLoading(null);
    };

    const handleRemove = async (id: string, name: string) => {
        if (!confirm(`Remover "${name}" deste cargo?`)) return;
        setLoading(id);
        const result = await removeCompetencyFromJob(id);
        if (result.success) {
            router.refresh();
        } else {
            alert('Erro: ' + result.error);
        }
        setLoading(null);
    };

    const selectedComp = unassignedCompetencies.find(c => c.id === newComp.competencyId);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/competencias">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Competências do Cargo</h1>
                        <p className="text-sm text-slate-500">{data.role.title}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowAIModal(true)}
                        variant="outline"
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Sugerir com IA
                    </Button>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        disabled={unassignedCompetencies.length === 0}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Manual
                    </Button>
                </div>
            </div>

            {/* Info do Cargo */}
            <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-xl">
                        <Brain className="w-10 h-10 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-black">{data.role.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-indigo-200 text-sm">
                            {data.role.department && (
                                <span className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {data.role.department}
                                </span>
                            )}
                            {data.role.grade && (
                                <span className="flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    {data.role.grade}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-5xl font-black">{data.assignedCompetencies.length}</p>
                        <p className="text-indigo-200 text-sm">competências</p>
                    </div>
                </div>
            </Card>

            {/* Lista de Competências */}
            <div className="space-y-4">
                {data.assignedCompetencies.length === 0 ? (
                    <Card className="p-12 border-none shadow-lg text-center">
                        <Brain className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-500 mb-6">Nenhuma competência atribuída a este cargo</p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                onClick={() => setShowAIModal(true)}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Sugerir com IA
                            </Button>
                            <Button
                                onClick={() => setShowAddModal(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Manual
                            </Button>
                        </div>
                    </Card>
                ) : (
                    data.assignedCompetencies.map(comp => {
                        const catConfig = categoryConfig[comp.category as keyof typeof categoryConfig] || categoryConfig['TECHNICAL'];
                        const CatIcon = catConfig.icon;

                        return (
                            <Card key={comp.id} className={`p-5 border-2 shadow-lg transition-all ${levelColors[comp.currentLevel]}`}>
                                <div className="flex items-start gap-4">
                                    {/* Ícone */}
                                    <div className={`p-3 rounded-xl ${catConfig.color}`}>
                                        <CatIcon className="w-6 h-6" />
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-slate-800">{comp.competencyName}</h4>
                                            {comp.critical && (
                                                <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${catConfig.color}`}>
                                                {catConfig.label}
                                            </span>
                                        </div>

                                        {/* Controles */}
                                        <div className="flex flex-wrap gap-4 mt-4">
                                            {/* Nível */}
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-slate-500">Nível:</Label>
                                                <select
                                                    value={comp.currentLevelId}
                                                    onChange={e => handleUpdateLevel(comp.id, e.target.value)}
                                                    disabled={loading === comp.id}
                                                    className="h-8 px-2 border rounded text-sm bg-white"
                                                >
                                                    {comp.levels.map(level => (
                                                        <option key={level.id} value={level.id}>
                                                            {level.level}. {level.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Peso */}
                                            <div className="flex items-center gap-2">
                                                <Label className="text-xs text-slate-500">Peso:</Label>
                                                <select
                                                    value={comp.weight}
                                                    onChange={e => handleUpdateWeight(comp.id, parseInt(e.target.value))}
                                                    disabled={loading === comp.id}
                                                    className="h-8 px-2 border rounded text-sm bg-white"
                                                >
                                                    {[1, 2, 3, 4, 5].map(w => (
                                                        <option key={w} value={w}>{w}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Obrigatória */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={comp.required}
                                                    onChange={e => handleUpdateRequired(comp.id, e.target.checked)}
                                                    disabled={loading === comp.id}
                                                    className="rounded"
                                                />
                                                <Label className="text-xs text-slate-500 !mb-0">Obrigatória</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                        onClick={() => handleRemove(comp.id, comp.competencyName)}
                                        disabled={loading === comp.id}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Modal Adicionar */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6 m-4">
                        <h3 className="text-lg font-bold mb-4">Adicionar Competência</h3>

                        <div className="space-y-4">
                            <div>
                                <Label>Competência</Label>
                                <select
                                    value={newComp.competencyId}
                                    onChange={e => {
                                        const comp = unassignedCompetencies.find(c => c.id === e.target.value);
                                        setNewComp({
                                            ...newComp,
                                            competencyId: e.target.value,
                                            levelId: comp?.levels[0]?.id || ''
                                        });
                                    }}
                                    className="w-full h-10 px-3 border rounded-md"
                                >
                                    <option value="">Selecione...</option>
                                    {unassignedCompetencies.map(comp => (
                                        <option key={comp.id} value={comp.id}>
                                            {comp.name} ({categoryConfig[comp.category as keyof typeof categoryConfig]?.label})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedComp && (
                                <div>
                                    <Label>Nível Esperado</Label>
                                    <select
                                        value={newComp.levelId}
                                        onChange={e => setNewComp({ ...newComp, levelId: e.target.value })}
                                        className="w-full h-10 px-3 border rounded-md"
                                    >
                                        {selectedComp.levels.map(level => (
                                            <option key={level.id} value={level.id}>
                                                {level.level}. {level.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <Label>Peso (1-5)</Label>
                                <select
                                    value={newComp.weight}
                                    onChange={e => setNewComp({ ...newComp, weight: parseInt(e.target.value) })}
                                    className="w-full h-10 px-3 border rounded-md"
                                >
                                    {[1, 2, 3, 4, 5].map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newComp.required}
                                    onChange={e => setNewComp({ ...newComp, required: e.target.checked })}
                                    className="rounded"
                                />
                                <Label className="!mb-0">Competência Obrigatória</Label>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowAddModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleAdd}
                                disabled={!newComp.competencyId || !newComp.levelId || loading === 'add'}
                            >
                                {loading === 'add' ? 'Adicionando...' : 'Adicionar'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal IA */}
            {showAIModal && (
                <AISuggestionModal
                    jobRoleId={data.role.id}
                    onClose={() => setShowAIModal(false)}
                />
            )}
        </div>
    );
}
