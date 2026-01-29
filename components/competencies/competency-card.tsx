'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Brain, X, Star, Code, Heart, Building2,
    Award, Target, Users, TrendingUp, ChevronRight,
    Plus, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface CompetencyCardProps {
    competency: {
        id: string;
        name: string;
        category: string;
        critical?: boolean;
        levelNumber: number;
        levelName: string;
        levels?: { id: string; level: number; name: string; description?: string; indicators?: string }[];
        required?: boolean;
        weight?: number;
    };
    showDetails?: boolean;
}

const categoryConfig = {
    'TECHNICAL': { label: 'Técnica', color: 'bg-blue-100 text-blue-700', bgGradient: 'from-blue-600 to-cyan-600', icon: Code },
    'BEHAVIORAL': { label: 'Comportamental', color: 'bg-purple-100 text-purple-700', bgGradient: 'from-purple-600 to-pink-600', icon: Heart },
    'ORGANIZATIONAL': { label: 'Organizacional', color: 'bg-amber-100 text-amber-700', bgGradient: 'from-amber-500 to-orange-500', icon: Building2 }
};

const levelDescriptions: Record<number, { label: string; description: string }> = {
    1: { label: 'Básico', description: 'Conhecimento inicial, requer supervisão' },
    2: { label: 'Intermediário', description: 'Executa com autonomia parcial' },
    3: { label: 'Avançado', description: 'Domina a competência, trabalha sozinho' },
    4: { label: 'Expert', description: 'Referência na competência, ensina outros' },
    5: { label: 'Master', description: 'Autoridade no tema, inovador' }
};

export function CompetencyCard({ competency, showDetails = true }: CompetencyCardProps) {
    const [expanded, setExpanded] = useState(false);
    const catConfig = categoryConfig[competency.category as keyof typeof categoryConfig] || categoryConfig['TECHNICAL'];
    const CatIcon = catConfig.icon;

    return (
        <>
            {/* Card Compacto */}
            <div
                onClick={() => showDetails && setExpanded(true)}
                className={`
                    group relative px-4 py-3 rounded-xl border-2 transition-all cursor-pointer
                    hover:shadow-lg hover:scale-[1.02]
                    ${competency.levelNumber >= 4 ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50' :
                        competency.levelNumber >= 3 ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50' :
                            competency.levelNumber >= 2 ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50' :
                                'border-slate-200 bg-slate-50'}
                `}
            >
                <div className="flex items-center gap-3">
                    {/* Ícone da Categoria */}
                    <div className={`p-2 rounded-lg ${catConfig.color}`}>
                        <CatIcon className="w-4 h-4" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 truncate">{competency.name}</h4>
                            {competency.critical && (
                                <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-slate-500">
                            {catConfig.label} • Nível {competency.levelNumber} - {competency.levelName}
                        </p>
                    </div>

                    {/* Indicador de Nível Visual */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(level => (
                            <div
                                key={level}
                                className={`w-2 h-6 rounded-full transition-all ${level <= competency.levelNumber
                                        ? `bg-gradient-to-t ${catConfig.bgGradient}`
                                        : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Seta */}
                    {showDetails && (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all" />
                    )}
                </div>

                {/* Badge de Obrigatória/Peso */}
                {(competency.required !== undefined || competency.weight) && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                        {competency.required !== undefined && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${competency.required
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                {competency.required ? 'Obrigatória' : 'Desejável'}
                            </span>
                        )}
                        {competency.weight && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                Peso {competency.weight}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Detalhes */}
            {expanded && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setExpanded(false)}>
                    <Card className="w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className={`p-6 bg-gradient-to-br ${catConfig.bgGradient} text-white`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-xl">
                                        <CatIcon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-black">{competency.name}</h2>
                                            {competency.critical && (
                                                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                            )}
                                        </div>
                                        <p className="text-white/80 text-sm mt-1">{catConfig.label}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => setExpanded(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-6 space-y-6">
                            {/* Nível Atual */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                                    Nível Exigido para este Cargo
                                </h3>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border">
                                    <div className="text-4xl font-black text-indigo-600">
                                        {competency.levelNumber}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{competency.levelName}</p>
                                        <p className="text-sm text-slate-500">
                                            {levelDescriptions[competency.levelNumber]?.description || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Barra de Níveis */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                                    Escala de Proficiência
                                </h3>
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <div
                                            key={level}
                                            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${level === competency.levelNumber
                                                    ? 'bg-indigo-100 border-2 border-indigo-300'
                                                    : level < competency.levelNumber
                                                        ? 'bg-slate-50 opacity-50'
                                                        : 'opacity-30'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${level <= competency.levelNumber
                                                    ? `bg-gradient-to-br ${catConfig.bgGradient} text-white`
                                                    : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                {level}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">
                                                    {levelDescriptions[level]?.label}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {levelDescriptions[level]?.description}
                                                </p>
                                            </div>
                                            {level === competency.levelNumber && (
                                                <span className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                                    EXIGIDO
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Configuração do Cargo */}
                            {(competency.required !== undefined || competency.weight) && (
                                <div className="flex gap-4 pt-4 border-t">
                                    {competency.required !== undefined && (
                                        <div className="flex-1 p-3 rounded-lg bg-slate-50 text-center">
                                            <p className="text-xs text-slate-500 mb-1">Status</p>
                                            <p className={`font-bold ${competency.required ? 'text-rose-600' : 'text-slate-600'}`}>
                                                {competency.required ? 'Obrigatória' : 'Desejável'}
                                            </p>
                                        </div>
                                    )}
                                    {competency.weight && (
                                        <div className="flex-1 p-3 rounded-lg bg-slate-50 text-center">
                                            <p className="text-xs text-slate-500 mb-1">Peso na Avaliação</p>
                                            <p className="font-bold text-indigo-600">{competency.weight} / 5</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}

/**
 * Seção de Competências para exibir em outras páginas
 */
interface CompetenciesSectionProps {
    competencies: {
        id: string;
        name: string;
        category: string;
        critical?: boolean;
        levelNumber: number;
        levelName: string;
        required?: boolean;
        weight?: number;
    }[];
    jobRoleId: string;
    editable?: boolean;
}

export function CompetenciesSection({ competencies, jobRoleId, editable = false }: CompetenciesSectionProps) {
    const grouped = competencies.reduce((acc, comp) => {
        if (!acc[comp.category]) acc[comp.category] = [];
        acc[comp.category].push(comp);
        return acc;
    }, {} as Record<string, typeof competencies>);

    if (competencies.length === 0) {
        return (
            <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 text-center">
                <Brain className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 mb-3">Nenhuma competência mapeada para este cargo</p>
                {editable && (
                    <Link href={`/competencias/cargo/${jobRoleId}`}>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Competências
                        </Button>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Brain className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Competências do Cargo</h3>
                        <p className="text-sm text-slate-500">{competencies.length} competências mapeadas</p>
                    </div>
                </div>
                {editable && (
                    <Link href={`/competencias/cargo/${jobRoleId}`}>
                        <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Gerenciar
                        </Button>
                    </Link>
                )}
            </div>

            {/* Lista por Categoria */}
            <div className="space-y-4">
                {Object.entries(grouped).map(([category, comps]) => {
                    const catConfig = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig['TECHNICAL'];
                    const CatIcon = catConfig.icon;

                    return (
                        <div key={category}>
                            <div className="flex items-center gap-2 mb-2">
                                <CatIcon className={`w-4 h-4 ${catConfig.color.split(' ')[1]}`} />
                                <span className="text-sm font-semibold text-slate-600">{catConfig.label}</span>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                    {comps.length}
                                </span>
                            </div>
                            <div className="grid gap-2">
                                {comps.map(comp => (
                                    <CompetencyCard key={comp.id} competency={comp} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
