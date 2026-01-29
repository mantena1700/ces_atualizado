'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, Building2, Mail, Phone, Briefcase, Star, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cores por departamento
const getDepartmentColors = (department: string | null) => {
    const schemes: Record<string, { gradient: string; bg: string; border: string; text: string }> = {
        'Tecnologia': {
            gradient: 'from-blue-600 via-indigo-600 to-purple-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-600'
        },
        'Administrativo': {
            gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-600'
        },
        'Comercial': {
            gradient: 'from-amber-500 via-orange-500 to-red-500',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-600'
        },
        'Financeiro': {
            gradient: 'from-slate-600 via-zinc-600 to-stone-600',
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-600'
        },
        'RH': {
            gradient: 'from-pink-500 via-rose-500 to-red-500',
            bg: 'bg-pink-50',
            border: 'border-pink-200',
            text: 'text-pink-600'
        },
        'Operações': {
            gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
            bg: 'bg-violet-50',
            border: 'border-violet-200',
            text: 'text-violet-600'
        },
        'Diretoria': {
            gradient: 'from-slate-800 via-slate-900 to-black',
            bg: 'bg-slate-100',
            border: 'border-slate-300',
            text: 'text-slate-800'
        },
        'default': {
            gradient: 'from-slate-600 via-slate-700 to-slate-800',
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            text: 'text-slate-600'
        }
    };

    const dept = department || '';
    const found = Object.keys(schemes).find(key =>
        key !== 'default' && dept.toLowerCase().includes(key.toLowerCase())
    );

    return schemes[found || 'default'];
};

function OrgNode({ data, selected }: any) {
    const isCEO = !data.managerId;
    const colors = getDepartmentColors(isCEO ? 'Diretoria' : data.department);
    const employees = data.employees || [];
    const headCount = data.headCount || 0;

    return (
        <div className={cn(
            "relative group transition-all duration-300",
            selected ? "scale-105 z-50" : "hover:scale-102"
        )}>
            {/* Glow Effect quando selecionado */}
            {selected && (
                <div className={cn(
                    "absolute -inset-3 rounded-3xl opacity-30 blur-xl",
                    `bg-gradient-to-r ${colors.gradient}`
                )} />
            )}

            {/* Handle de entrada (Topo) */}
            {!isCEO && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!bg-gradient-to-b !from-slate-300 !to-slate-400 !w-3 !h-3 !-top-1.5 !border-2 !border-white !shadow-md"
                />
            )}

            {/* Card Principal */}
            <div className={cn(
                "w-[300px] rounded-2xl overflow-hidden border-2 transition-all duration-300",
                "bg-white shadow-xl",
                selected ? "border-blue-400 ring-4 ring-blue-100" : colors.border,
                "hover:shadow-2xl"
            )}>
                {/* Header com Gradiente */}
                <div className={cn(
                    "p-4 bg-gradient-to-r text-white relative overflow-hidden",
                    colors.gradient
                )}>
                    {/* Pattern de fundo */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                    {/* Badge de CEO */}
                    {isCEO && (
                        <div className="absolute top-2 right-2 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                            <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                    )}

                    <div className="relative z-10">
                        <h3 className="font-bold text-base leading-tight mb-1 pr-8">
                            {data.label}
                        </h3>
                        <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                            <Building2 className="w-3 h-3" />
                            {data.department || 'Sem Departamento'}
                        </div>
                    </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-4 space-y-4">
                    {/* Lista de Ocupantes */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Ocupantes
                            </span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                headCount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}>
                                {headCount}
                            </span>
                        </div>

                        {employees.length > 0 ? (
                            <div className="space-y-2">
                                {employees.slice(0, 3).map((emp: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 group/emp hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm font-bold text-blue-600">
                                            {emp.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium text-slate-700 truncate block">
                                                {emp.name}
                                            </span>
                                            {emp.email && (
                                                <span className="text-[10px] text-slate-400 truncate block">
                                                    {emp.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {employees.length > 3 && (
                                    <div className="text-center py-1">
                                        <span className="text-xs text-slate-400 font-medium">
                                            + {employees.length - 3} outros
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 rounded-xl bg-amber-50/50 border border-dashed border-amber-200">
                                <Briefcase className="w-6 h-6 text-amber-300 mb-1" />
                                <span className="text-xs text-amber-500 font-medium">Vago</span>
                            </div>
                        )}
                    </div>

                    {/* Métricas Rápidas */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-blue-50">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 block">Headcount</span>
                                <span className="text-sm font-bold text-slate-700">{headCount}</span>
                            </div>
                        </div>
                        {data.subordinateCount !== undefined && (
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-purple-50">
                                    <ChevronDown className="w-3.5 h-3.5 text-purple-600" />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block">Subordinados</span>
                                    <span className="text-sm font-bold text-slate-700">{data.subordinateCount || 0}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Handle de saída (Base) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-gradient-to-b !from-emerald-400 !to-teal-500 !w-4 !h-4 !-bottom-2 !border-2 !border-white !shadow-lg hover:!scale-125 !transition-transform cursor-pointer"
            />
        </div>
    );
}

export default memo(OrgNode);
