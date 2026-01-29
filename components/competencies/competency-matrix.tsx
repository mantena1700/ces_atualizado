'use client';

import { useState } from 'react';
import { JobCompetencyMatrixItem, CompetencyMatrixOverview } from '@/app/actions/competencies';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompetencyCard } from './competency-card';
import {
    Search, Brain, Building2, Code, Heart, Target,
    ChevronDown, ChevronRight, Eye, Edit2, Filter, Plus
} from 'lucide-react';
import Link from 'next/link';

interface CompetencyMatrixProps {
    matrix: JobCompetencyMatrixItem[];
    stats: CompetencyMatrixOverview;
}

const categoryConfig = {
    'TECHNICAL': { label: 'Técnica', color: 'text-blue-600', bg: 'bg-blue-100' },
    'BEHAVIORAL': { label: 'Comportamental', color: 'text-purple-600', bg: 'bg-purple-100' },
    'ORGANIZATIONAL': { label: 'Organizacional', color: 'text-amber-600', bg: 'bg-amber-100' }
};

export function CompetencyMatrix({ matrix, stats }: CompetencyMatrixProps) {
    const [search, setSearch] = useState('');
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(['all']));

    const filteredMatrix = matrix.filter(item =>
        item.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        item.department?.toLowerCase().includes(search.toLowerCase())
    );

    // Agrupar por departamento
    const groupedByDept = filteredMatrix.reduce((acc, item) => {
        const dept = item.department || 'Sem Departamento';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(item);
        return acc;
    }, {} as Record<string, JobCompetencyMatrixItem[]>);

    const toggleDept = (dept: string) => {
        const newSet = new Set(expandedDepts);
        if (newSet.has(dept)) newSet.delete(dept);
        else newSet.add(dept);
        setExpandedDepts(newSet);
    };

    return (
        <div className="space-y-6">
            {/* Barra de Filtros */}
            <Card className="p-4 border-none shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar cargo ou departamento..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span className="text-slate-500">Técnica</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-500" />
                            <span className="text-slate-500">Comportamental</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-amber-500" />
                            <span className="text-slate-500">Organizacional</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Instrução */}
            <div className="text-sm text-slate-500 bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" />
                <span>Clique em qualquer competência para ver detalhes completos com níveis de proficiência</span>
            </div>

            {/* Matriz por Departamento */}
            {Object.entries(groupedByDept).map(([dept, roles]) => (
                <Card key={dept} className="overflow-hidden border-none shadow-xl">
                    {/* Header do Departamento */}
                    <button
                        onClick={() => toggleDept(dept)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-slate-500" />
                            <span className="font-bold text-slate-800">{dept}</span>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                {roles.length} cargos
                            </span>
                        </div>
                        {expandedDepts.has(dept) || expandedDepts.has('all') ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {/* Cargos do Departamento */}
                    {(expandedDepts.has(dept) || expandedDepts.has('all')) && (
                        <div className="divide-y divide-slate-100">
                            {roles.map(role => (
                                <div key={role.jobRoleId} className="p-4 hover:bg-slate-50/50 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{role.jobTitle}</h4>
                                            {role.grade && (
                                                <span className="text-xs text-slate-500">{role.grade}</span>
                                            )}
                                        </div>
                                        <Link href={`/competencias/cargo/${role.jobRoleId}`}>
                                            <Button variant="outline" size="sm" className="text-xs">
                                                <Edit2 className="w-3 h-3 mr-1" />
                                                Gerenciar
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Competências do Cargo - Usando CompetencyCard */}
                                    {role.competencies.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {role.competencies.map((comp, idx) => (
                                                <CompetencyCard
                                                    key={idx}
                                                    competency={{
                                                        id: idx.toString(),
                                                        name: comp.competencyName,
                                                        category: comp.category,
                                                        levelNumber: comp.levelNumber,
                                                        levelName: comp.levelName,
                                                        required: comp.required,
                                                        weight: comp.weight
                                                    }}
                                                    showDetails={true}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 rounded-lg border-2 border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 italic">
                                                Nenhuma competência mapeada
                                            </p>
                                            <Link href={`/competencias/cargo/${role.jobRoleId}`}>
                                                <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Adicionar
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            ))}

            {filteredMatrix.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhum cargo encontrado</p>
                </div>
            )}
        </div>
    );
}
