'use client';

import { useState } from 'react';
import { JobDescriptionListItem, generateDescriptionTemplate } from '@/app/actions/job-descriptions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    FileText, Search, Plus, Eye, Building2, Users, Award,
    CheckCircle2, Clock, AlertCircle, FileWarning, Sparkles,
    Filter, ArrowUpDown
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface JobDescriptionsListProps {
    items: JobDescriptionListItem[];
    stats: {
        totalRoles: number;
        withDescription: number;
        withoutDescription: number;
        byStatus: {
            draft: number;
            review: number;
            approved: number;
        };
    };
}

const statusConfig = {
    'APPROVED': { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    'REVIEW': { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    'DRAFT': { label: 'Rascunho', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText },
    'EMPTY': { label: 'Sem Descrição', color: 'bg-rose-50 text-rose-600 border-rose-200', icon: FileWarning }
};

export function JobDescriptionsList({ items, stats }: JobDescriptionsListProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState<string | null>(null);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.department?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleGenerateTemplate = async (jobRoleId: string) => {
        setLoading(jobRoleId);
        const result = await generateDescriptionTemplate(jobRoleId);
        if (result.success) {
            router.refresh();
            router.push(`/descricoes/${jobRoleId}`);
        } else {
            alert('Erro ao gerar template: ' + result.error);
        }
        setLoading(null);
    };

    // Agrupar por departamento
    const groupedByDepartment = filteredItems.reduce((acc, item) => {
        const dept = item.department || 'Sem Departamento';
        if (!acc[dept]) acc[dept] = [];
        acc[dept].push(item);
        return acc;
    }, {} as Record<string, JobDescriptionListItem[]>);

    return (
        <div className="space-y-8">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-200" />
                        <span className="text-sm text-blue-100 font-medium">Total de Cargos</span>
                    </div>
                    <p className="text-3xl font-black">{stats.totalRoles}</p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm text-slate-500 font-medium">Aprovados</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.byStatus.approved}</p>
                    <Progress
                        value={(stats.byStatus.approved / stats.totalRoles) * 100}
                        className="h-1.5 mt-2"
                        indicatorClassName="bg-emerald-500"
                    />
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-slate-500 font-medium">Em Revisão</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.byStatus.review}</p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <FileWarning className="w-5 h-5 text-rose-500" />
                        <span className="text-sm text-slate-500 font-medium">Sem Descrição</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.withoutDescription}</p>
                </Card>
            </div>

            {/* Barra de Filtros */}
            <Card className="p-4 border-none shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por cargo ou departamento..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="APPROVED">Aprovados</option>
                            <option value="REVIEW">Em Revisão</option>
                            <option value="DRAFT">Rascunho</option>
                            <option value="EMPTY">Sem Descrição</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Lista por Departamento */}
            {Object.entries(groupedByDepartment).map(([dept, roles]) => (
                <div key={dept} className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <Building2 className="w-5 h-5 text-slate-400" />
                        <h3 className="font-bold text-slate-700">{dept}</h3>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {roles.length} cargos
                        </span>
                    </div>

                    <Card className="overflow-hidden border-none shadow-xl ring-1 ring-slate-900/5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Cargo</th>
                                        <th className="px-6 py-4 text-center">Grade</th>
                                        <th className="px-6 py-4 text-center">Headcount</th>
                                        <th className="px-6 py-4 text-center">CBO</th>
                                        <th className="px-6 py-4 text-center">Completude</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 w-[150px]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {roles.map(item => {
                                        const statusInfo = statusConfig[item.status as keyof typeof statusConfig] || statusConfig['EMPTY'];
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <tr key={item.jobRoleId} className="hover:bg-slate-50 transition-all group">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-800">{item.title}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.grade ? (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                            {item.grade}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1 text-slate-600">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {item.headcount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                                                    {item.cbo || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Progress
                                                            value={item.completeness}
                                                            className="h-1.5 w-20"
                                                            indicatorClassName={
                                                                item.completeness >= 80 ? 'bg-emerald-500' :
                                                                    item.completeness >= 50 ? 'bg-amber-500' : 'bg-slate-300'
                                                            }
                                                        />
                                                        <span className="text-[10px] text-slate-400">{item.completeness}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${statusInfo.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        {item.status === 'EMPTY' ? (
                                                            <Button
                                                                size="sm"
                                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                                                onClick={() => handleGenerateTemplate(item.jobRoleId)}
                                                                disabled={loading === item.jobRoleId}
                                                            >
                                                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                                                {loading === item.jobRoleId ? 'Gerando...' : 'Gerar Descrição'}
                                                            </Button>
                                                        ) : (
                                                            <Link href={`/descricoes/${item.jobRoleId}`}>
                                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    Visualizar
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            ))}

            {filteredItems.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhum cargo encontrado</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                </div>
            )}
        </div>
    );
}
