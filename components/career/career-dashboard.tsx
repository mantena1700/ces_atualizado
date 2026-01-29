'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, Users, GitBranch, Rocket, Map, ArrowRight } from 'lucide-react';
import CareerMap from '@/components/career-map';

interface Props {
    nodes: any[];
    edges: any[];
    stats: {
        totalRoles: number;
        rolesWithPaths: number;
        totalPaths: number;
        promotionCandidates: number;
    };
}

export function CareerDashboard({ nodes, edges, stats }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            <div className="p-8 space-y-8">
                {/* Header Premium */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-emerald-100 text-sm font-medium uppercase tracking-wider">
                                Gestão de Carreira
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">
                            Trilha de Carreira & Sucessão
                        </h1>
                        <p className="text-emerald-100 max-w-2xl">
                            Visualize os caminhos de evolução profissional e identifique candidatos prontos para promoção
                            com base nas avaliações de desempenho.
                        </p>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Total de Cargos</p>
                                <h3 className="text-3xl font-bold mt-1 text-slate-800">
                                    {stats.totalRoles}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">posições mapeadas</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Trilhas Configuradas</p>
                                <h3 className="text-3xl font-bold mt-1 text-emerald-600">
                                    {stats.totalPaths}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">caminhos de promoção</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <GitBranch className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Cargos com Trilha</p>
                                <h3 className="text-3xl font-bold mt-1 text-blue-600">
                                    {stats.rolesWithPaths}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">possibilidade de evolução</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Map className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Prontos p/ Promoção</p>
                                <h3 className="text-3xl font-bold mt-1 text-rose-600">
                                    {stats.promotionCandidates}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">avaliação ≥ 4.0</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Rocket className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Mapa de Carreira */}
                <Card className="overflow-hidden border-0 shadow-xl bg-white">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Map className="w-5 h-5 text-emerald-600" />
                                    Mapa de Carreira Interativo
                                </h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Arraste para navegar • Clique nos cargos para ver detalhes • Use o scroll para zoom
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span>Cargo de Entrada</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span>Possível Promoção</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-[600px] relative">
                        <CareerMap initialNodes={nodes} initialEdges={edges} />
                    </div>
                </Card>

                {/* Legenda / Dicas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-bold">1</span>
                            </div>
                            Defina Trilhas
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Configure quais cargos podem evoluir para quais, criando caminhos claros de progressão.
                        </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold">2</span>
                            </div>
                            Avalie Desempenho
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Execute avaliações periódicas para identificar candidatos com alto potencial.
                        </p>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-rose-50 to-orange-50 border-0 shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                                <span className="text-rose-600 font-bold">3</span>
                            </div>
                            Promova Talentos
                        </h3>
                        <p className="text-slate-600 text-sm">
                            Use os insights da avaliação para tomar decisões informadas sobre promoções.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
