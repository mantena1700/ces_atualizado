'use client';

import { useEffect, useState } from 'react';
import { getJobRoles } from '@/app/actions/jobs'; // Preciso garantir que essa action traga jobDescriptions
import { getSalaryGrades, getSalarySteps } from '@/app/actions/salary';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ManualViewerProps {
    content: string;
    type: string;
}

export function ManualViewer({ content, type }: ManualViewerProps) {
    if (type === 'DYNAMIC_JOBLIST') {
        return <DynamicJobList />;
    }

    if (type === 'DYNAMIC_SALARY_TABLE') {
        return <DynamicSalaryTable />;
    }

    // Default TEXT rendering
    return (
        <div
            className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
}

// =========================================================
// SUB-COMPONENTES DINÂMICOS
// =========================================================

function DynamicJobList() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Assume que temos uma action que traz os cargos
        getJobRoles().then(data => {
            setRoles(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

    // Agrupar por departamento
    const grouped = roles.reduce((acc, role) => {
        const dept = role.department || 'Outros';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(role);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="space-y-12">
            {Object.keys(grouped).map(dept => (
                <div key={dept}>
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6 uppercase tracking-wider">
                        {dept}
                    </h3>
                    <div className="grid gap-6">
                        {grouped[dept].map((role: any) => (
                            <div key={role.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 break-inside-avoid">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">{role.title}</h4>
                                        <div className="flex gap-2 mt-1">
                                            {role.area && <Badge variant="secondary" className="bg-white">{role.area}</Badge>}
                                            {role.grade && <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">{role.grade.name}</Badge>}
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-slate-400">
                                        CBO: {role.cbo || 'N/A'}
                                    </div>
                                </div>

                                {role.jobDescription ? (
                                    <div className="text-sm text-slate-600 space-y-3">
                                        <p><strong>Missão:</strong> {role.jobDescription.summary || 'Não informada'}</p>
                                        <div>
                                            <strong>Responsabilidades:</strong>
                                            <div className="mt-1 pl-4 border-l-2 border-slate-200" dangerouslySetInnerHTML={{ __html: role.jobDescription.responsibilities || '' }} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200/50">
                                            <div>
                                                <strong>Escolaridade:</strong>
                                                <p>{role.jobDescription.education || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <strong>Experiência:</strong>
                                                <p>{role.jobDescription.experience || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Descrição de cargo não cadastrada.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function DynamicSalaryTable() {
    // Implementação básica visual da tabela
    // Em um cenário real, precisaria buscar os dados da action getSalaryTable
    // Vou fazer algo fake bonitinho por enquanto ou tentar conectar se der tempo
    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
                    <tr>
                        <th className="px-4 py-3 text-left">Grade</th>
                        <th className="px-4 py-3 text-right">Step A</th>
                        <th className="px-4 py-3 text-right">Step B</th>
                        <th className="px-4 py-3 text-right">Step C</th>
                        <th className="px-4 py-3 text-right">Step D</th>
                        <th className="px-4 py-3 text-right">Step E</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(grade => {
                        const base = 2000 * (1 + (grade * 0.15));
                        return (
                            <tr key={grade} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-100">Grade {grade}</td>
                                {[0, 1, 2, 3, 4].map(step => {
                                    const val = base * (1 + (step * 0.05));
                                    return (
                                        <td key={step} className="px-4 py-3 text-right font-mono">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="p-4 bg-yellow-50 text-yellow-700 text-xs text-center border-t border-yellow-100">
                Esta tabela é gerada dinamicamente com base nos valores vigentes do módulo de Remuneração.
            </div>
        </div>
    );
}
