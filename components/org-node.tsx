'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, Building2, Briefcase, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cores por departamento
function getDepartmentColors(department: string | null) {
    const dept = (department || '').toLowerCase();

    if (dept.includes('diretoria') || dept.includes('presidência'))
        return { gradient: 'from-slate-800 to-slate-900', border: 'border-slate-300', badge: 'bg-slate-700' };
    if (dept.includes('tecnologia') || dept.includes('ti') || dept.includes('sistemas'))
        return { gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-200', badge: 'bg-blue-600' };
    if (dept.includes('comercial') || dept.includes('vendas'))
        return { gradient: 'from-amber-400 to-orange-500', border: 'border-amber-200', badge: 'bg-amber-500' };
    if (dept.includes('rh') || dept.includes('recursos humanos') || dept.includes('pessoas'))
        return { gradient: 'from-pink-500 to-rose-600', border: 'border-pink-200', badge: 'bg-pink-600' };
    if (dept.includes('financeiro') || dept.includes('contábil'))
        return { gradient: 'from-slate-500 to-slate-700', border: 'border-slate-200', badge: 'bg-slate-600' };
    if (dept.includes('operações') || dept.includes('logística'))
        return { gradient: 'from-teal-500 to-cyan-600', border: 'border-teal-200', badge: 'bg-teal-600' };
    if (dept.includes('marketing') || dept.includes('comunicação'))
        return { gradient: 'from-violet-500 to-purple-600', border: 'border-violet-200', badge: 'bg-violet-600' };
    if (dept.includes('jurídico') || dept.includes('legal'))
        return { gradient: 'from-red-500 to-rose-600', border: 'border-red-200', badge: 'bg-red-600' };

    return { gradient: 'from-indigo-500 to-purple-600', border: 'border-indigo-200', badge: 'bg-indigo-600' };
}

function OrgNode({ data, selected }: any) {
    const isCEO = !data.managerId;
    const colors = getDepartmentColors(isCEO ? 'Diretoria' : data.department);
    const employees = data.employees || [];
    const headCount = data.headCount || 0;
    const hasEmployees = employees.length > 0;

    return (
        <div className={cn(
            "relative group transition-all duration-200",
            selected ? "scale-105 z-50" : "hover:scale-[1.02]"
        )}>
            {/* Glow Effect quando selecionado */}
            {selected && (
                <div className={cn(
                    "absolute -inset-2 rounded-2xl opacity-40 blur-lg",
                    `bg-gradient-to-r ${colors.gradient}`
                )} />
            )}

            {/* Handle de entrada (Topo) */}
            {!isCEO && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!bg-gradient-to-b !from-slate-300 !to-slate-400 !w-2.5 !h-2.5 !-top-1 !border-2 !border-white !shadow-md"
                />
            )}

            {/* Card Principal - Mais Compacto */}
            <div className={cn(
                "w-[220px] rounded-xl overflow-hidden border transition-all duration-200",
                "bg-white shadow-lg",
                selected ? "border-blue-400 ring-2 ring-blue-100" : colors.border,
                "hover:shadow-xl"
            )}>
                {/* Header Compacto */}
                <div className={cn(
                    "px-3 py-2.5 bg-gradient-to-r text-white relative overflow-hidden",
                    colors.gradient
                )}>
                    {/* Badge de CEO */}
                    {isCEO && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow">
                            <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                    )}

                    <h3 className="font-semibold text-sm leading-tight pr-6 truncate">
                        {data.label}
                    </h3>
                    <div className="flex items-center gap-1 text-white/75 text-[10px] mt-0.5">
                        <Building2 className="w-2.5 h-2.5" />
                        <span className="truncate">{data.department || 'Geral'}</span>
                    </div>
                </div>

                {/* Corpo Compacto */}
                <div className="px-3 py-2">
                    {/* Ocupantes */}
                    {hasEmployees ? (
                        <div className="space-y-1">
                            {employees.slice(0, 2).map((emp: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 py-1 px-1.5 rounded-md bg-slate-50 border border-slate-100"
                                >
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0">
                                        {emp.name?.charAt(0)}
                                    </div>
                                    <span className="text-xs text-slate-700 truncate flex-1">
                                        {emp.name}
                                    </span>
                                </div>
                            ))}
                            {employees.length > 2 && (
                                <div className="text-center">
                                    <span className="text-[10px] text-slate-400">
                                        +{employees.length - 2} outros
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-2 rounded-md bg-amber-50/60 border border-dashed border-amber-200">
                            <Briefcase className="w-4 h-4 text-amber-300 mr-1.5" />
                            <span className="text-[10px] text-amber-500 font-medium">Vago</span>
                        </div>
                    )}

                    {/* Footer com Headcount */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] text-slate-400">Headcount</span>
                        </div>
                        <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded",
                            headCount > 0 ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                        )}>
                            {headCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* Handle de saída (Base) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-gradient-to-b !from-emerald-400 !to-teal-500 !w-3 !h-3 !-bottom-1.5 !border-2 !border-white !shadow-lg hover:!scale-125 !transition-transform cursor-pointer"
            />
        </div>
    );
}

export default memo(OrgNode);
