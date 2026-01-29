'use client';

import { Card } from '@/components/ui/card';
import { OrgChart } from '@/components/org-chart';
import { Building2, Users, Layers, Network, GitBranch, BarChart3 } from 'lucide-react';

interface Props {
    stats: {
        totalRoles: number;
        totalEmployees: number;
        topRoles: number;
        departments: number;
        avgSpanOfControl: number;
    };
}

export function OrgChartDashboard({ stats }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="p-8 space-y-8">
                {/* Header Premium */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">
                                Estrutura Organizacional
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">
                            Organograma Integrado
                        </h1>
                        <p className="text-blue-100 max-w-2xl">
                            Visualização hierárquica automática baseada nos vínculos definidos no cadastro de cargos.
                            Arraste e explore a estrutura da organização.
                        </p>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Cargos</p>
                                <h3 className="text-3xl font-bold mt-1 text-slate-800">
                                    {stats.totalRoles}
                                </h3>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Colaboradores</p>
                                <h3 className="text-3xl font-bold mt-1 text-emerald-600">
                                    {stats.totalEmployees}
                                </h3>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Departamentos</p>
                                <h3 className="text-3xl font-bold mt-1 text-purple-600">
                                    {stats.departments}
                                </h3>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Níveis Topo</p>
                                <h3 className="text-3xl font-bold mt-1 text-amber-600">
                                    {stats.topRoles}
                                </h3>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Network className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Span of Control</p>
                                <h3 className="text-3xl font-bold mt-1 text-rose-600">
                                    {stats.avgSpanOfControl}
                                </h3>
                                <p className="text-slate-400 text-xs">média</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Organograma */}
                <Card className="overflow-hidden border-0 shadow-xl bg-white">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <GitBranch className="w-5 h-5 text-blue-600" />
                                    Estrutura Hierárquica
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Clique nos cargos para expandir • Arraste para navegar
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 min-h-[600px]">
                        <OrgChart />
                    </div>
                </Card>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Como Funciona
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            O organograma é gerado dinamicamente a partir das relações definidas no cadastro de <strong>Cargos</strong>.
                            Ao definir que o "Analista" reporta ao "Gerente", o sistema desenha a linha de comando automaticamente.
                            Os funcionários são exibidos dentro de cada caixa conforme sua ocupação atual.
                        </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                            Span of Control
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            O "Span of Control" indica a média de subordinados diretos por cargo.
                            Um valor alto pode indicar sobrecarga gerencial, enquanto um valor baixo pode sugerir
                            estrutura hierárquica profunda. O ideal varia por setor e cultura organizacional.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
