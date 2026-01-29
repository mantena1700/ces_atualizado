'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Briefcase, Users, Award, TrendingUp, Star, ChevronUp } from 'lucide-react';
import { cn } from "@/lib/utils";

// Cores por nível hierárquico ou departamento
const getNodeColors = (department: string | null, level: number = 0) => {
    const colorSchemes: Record<string, { gradient: string; border: string; accent: string; bg: string }> = {
        'Tecnologia': {
            gradient: 'from-blue-600 via-indigo-600 to-purple-600',
            border: 'border-blue-200',
            accent: 'text-blue-600 bg-blue-50',
            bg: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80'
        },
        'Administrativo': {
            gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
            border: 'border-emerald-200',
            accent: 'text-emerald-600 bg-emerald-50',
            bg: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/80'
        },
        'Comercial': {
            gradient: 'from-amber-500 via-orange-500 to-red-500',
            border: 'border-amber-200',
            accent: 'text-amber-600 bg-amber-50',
            bg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/80'
        },
        'Financeiro': {
            gradient: 'from-slate-600 via-zinc-600 to-stone-600',
            border: 'border-slate-200',
            accent: 'text-slate-600 bg-slate-50',
            bg: 'bg-gradient-to-br from-slate-50/80 to-zinc-50/80'
        },
        'RH': {
            gradient: 'from-pink-500 via-rose-500 to-red-500',
            border: 'border-pink-200',
            accent: 'text-pink-600 bg-pink-50',
            bg: 'bg-gradient-to-br from-pink-50/80 to-rose-50/80'
        },
        'Operações': {
            gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
            border: 'border-violet-200',
            accent: 'text-violet-600 bg-violet-50',
            bg: 'bg-gradient-to-br from-violet-50/80 to-purple-50/80'
        },
        'default': {
            gradient: 'from-slate-700 via-slate-600 to-slate-500',
            border: 'border-slate-200',
            accent: 'text-slate-600 bg-slate-50',
            bg: 'bg-gradient-to-br from-white to-slate-50/80'
        }
    };

    // Encontrar o esquema baseado no departamento
    const dept = department || '';
    const found = Object.keys(colorSchemes).find(key =>
        key !== 'default' && dept.toLowerCase().includes(key.toLowerCase())
    );

    return colorSchemes[found || 'default'];
};

const JobNode = ({ data, selected }: NodeProps) => {
    const colors = getNodeColors(data.department);
    const employeeCount = data.employeeCount || 0;

    return (
        <div
            className={cn(
                "group relative w-[300px] transition-all duration-300 ease-out",
                selected ? "scale-105 z-50" : "hover:scale-102"
            )}
        >
            {/* Glow Effect */}
            {selected && (
                <div className={cn(
                    "absolute -inset-2 rounded-2xl opacity-20 blur-xl",
                    `bg-gradient-to-r ${colors.gradient}`
                )} />
            )}

            {/* Card Principal */}
            <div
                className={cn(
                    "relative rounded-2xl border-2 overflow-hidden transition-all duration-300",
                    colors.border,
                    colors.bg,
                    "backdrop-blur-sm",
                    selected
                        ? "shadow-2xl ring-2 ring-offset-2 ring-slate-900/10"
                        : "shadow-lg hover:shadow-xl"
                )}
            >
                {/* Header Gradiente */}
                <div className={cn(
                    "h-1.5 w-full bg-gradient-to-r",
                    colors.gradient
                )} />

                {/* Badge de Nível (se for executivo/gerente) */}
                {data.isTopLevel && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                )}

                {/* Conteúdo */}
                <div className="p-5">
                    {/* Ícone e Departamento */}
                    <div className="flex justify-between items-start mb-3">
                        <div className={cn(
                            "p-2.5 rounded-xl shadow-sm border border-white/50",
                            colors.accent
                        )}>
                            <Briefcase className="w-5 h-5" />
                        </div>

                        {data.department && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/80 px-2 py-1 rounded-full">
                                {data.department}
                            </span>
                        )}
                    </div>

                    {/* Título do Cargo */}
                    <h3 className="font-bold text-base text-slate-900 leading-tight mb-1 group-hover:text-slate-700 transition-colors">
                        {data.label}
                    </h3>

                    {/* Área */}
                    {data.area && (
                        <p className="text-xs text-slate-500 mb-3">{data.area}</p>
                    )}

                    {/* Métricas */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                        {/* Grade Salarial */}
                        <div className="flex-1 flex items-center gap-1.5 text-xs bg-white/60 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            <span className="font-semibold text-slate-700 truncate">
                                {data.grade || 'Sem Grade'}
                            </span>
                        </div>

                        {/* Pontos */}
                        {data.points > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-slate-900 text-white px-2.5 py-1.5 rounded-lg font-mono">
                                <TrendingUp className="w-3 h-3" />
                                {data.points}
                            </div>
                        )}

                        {/* Colaboradores */}
                        {employeeCount > 0 && (
                            <div className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg font-semibold">
                                <Users className="w-3 h-3" />
                                {employeeCount}
                            </div>
                        )}
                    </div>

                    {/* Indicador de Promoção Possível */}
                    {data.hasCareerPath && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-rose-600">
                            <ChevronUp className="w-3.5 h-3.5" />
                            Permite promoção
                        </div>
                    )}
                </div>
            </div>

            {/* Handles Estilizados */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-gradient-to-br !from-slate-400 !to-slate-500 !border-2 !border-white !shadow-md !-top-1.5"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-4 !h-4 !bg-gradient-to-br !from-emerald-400 !to-teal-500 !border-2 !border-white !shadow-lg !-bottom-2 hover:!scale-125 !transition-transform cursor-pointer"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!w-3 !h-3 !bg-gradient-to-br !from-blue-400 !to-indigo-500 !border-2 !border-white !shadow-md !-right-1.5"
            />
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-gradient-to-br !from-slate-400 !to-slate-500 !border-2 !border-white !shadow-md !-left-1.5"
            />
        </div>
    );
};

export default memo(JobNode);
