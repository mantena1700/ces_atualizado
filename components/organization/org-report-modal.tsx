'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    X, Download, Building2, Users, GitBranch, TrendingUp,
    BarChart3, PieChart, Layers, Target, Award, AlertTriangle,
    CheckCircle2, Clock, Briefcase, ChevronRight, Printer,
    FileText, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';

interface OrgReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        nodes: any[];
        edges: any[];
    };
}

// Cores para os gráficos
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Componente recursivo para desenhar a árvore
function HierarchyNode({ node, edges, nodes, level, isLast }: any) {
    const childrenEdges = edges.filter((e: any) => e.source === node.id);
    const childrenIds = childrenEdges.map((e: any) => e.target);
    const children = nodes.filter((n: any) => childrenIds.includes(n.id));
    const hasChildren = children.length > 0;

    const employees = node.data?.employees || [];
    const isOccupied = employees.length > 0;

    return (
        <div className="relative">
            <div className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-lg border transition-all hover:shadow-md",
                level === 0 ? "bg-slate-900 text-white border-slate-900 mb-4 ml-0" :
                    "bg-white border-slate-100 ml-8 my-1"
            )}>
                {/* Linhas conectoras para níveis > 0 */}
                {level > 0 && (
                    <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-300 transform -translate-y-1/2" />
                )}
                {level > 0 && !isLast && (
                    <div className="absolute -left-6 bottom-0 top-0 w-px bg-slate-300" />
                )}
                {level > 0 && isLast && (
                    <div className="absolute -left-6 top-0 h-1/2 w-px bg-slate-300" />
                )}

                {/* Ícone do Cargo */}
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    level === 0 ? "bg-white/10" : isOccupied ? "bg-indigo-50 text-indigo-600" : "bg-amber-50 text-amber-500"
                )}>
                    {level === 0 ? <Building2 className="w-4 h-4" /> :
                        isOccupied ? <Users className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                </div>

                {/* Detalhes do Cargo */}
                <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                        <span className={cn("font-bold text-sm", level === 0 ? "text-white" : "text-slate-800")}>
                            {node.data.label}
                        </span>
                        {!isOccupied && level !== 0 && (
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-amber-200 text-amber-600 bg-amber-50">
                                Vago
                            </Badge>
                        )}
                        {level === 0 && (
                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] h-5 px-1.5">
                                CEO
                            </Badge>
                        )}
                    </div>
                    <div className={cn("text-xs flex items-center gap-3 mt-0.5", level === 0 ? "text-slate-300" : "text-slate-500")}>
                        <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {node.data.department || 'Geral'}
                        </span>
                        {isOccupied && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {employees.length} {employees.length === 1 ? 'ocupante' : 'ocupantes'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Avatar do Ocupante Principal (se houver) */}
                {isOccupied && (
                    <div className="flex -space-x-2">
                        {employees.slice(0, 3).map((emp: any, idx: number) => (
                            <div key={idx} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-indigo-700" title={emp.name}>
                                {emp.name.charAt(0)}
                            </div>
                        ))}
                        {employees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
                                +{employees.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Filhos Recursivos */}
            {hasChildren && (
                <div className={cn("relative", level === 0 ? "pl-4" : "pl-8")}>
                    {/* Linha vertical principal para os filhos */}
                    <div className="absolute left-0 top-0 bottom-4 w-px bg-slate-200" style={{ left: level === 0 ? '20px' : '32px' }} />

                    {children.map((child: any, idx: number) => (
                        <HierarchyNode
                            key={child.id}
                            node={child}
                            edges={edges}
                            nodes={nodes}
                            level={level + 1}
                            isLast={idx === children.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function HierarchyTree({ nodes, edges }: { nodes: any[], edges: any[] }) {
    // Encontrar o nó raiz (CEO/Presidente - quem não tem "source" apontando para ele como "target")
    // Na nossa estrutura, é quem não tem managerId ou quem não é target de ninguém
    const rootNodes = nodes.filter(n => !n.data?.managerId);

    if (rootNodes.length === 0) {
        // Fallback: tenta pegar nós que não são target de nenhuma aresta
        const targets = new Set(edges.map(e => e.target));
        const potentialRoots = nodes.filter(n => !targets.has(n.id));

        if (potentialRoots.length > 0) {
            return (
                <div className="space-y-4">
                    {potentialRoots.map(root => (
                        <HierarchyNode key={root.id} node={root} edges={edges} nodes={nodes} level={0} isLast={true} />
                    ))}
                </div>
            );
        }

        return <div className="text-center text-slate-500 py-8">Não foi possível identificar a raiz da hierarquia.</div>;
    }

    return (
        <div className="min-w-[600px] py-2">
            {rootNodes.map((root, idx) => (
                <HierarchyNode
                    key={root.id}
                    node={root}
                    edges={edges}
                    nodes={nodes}
                    level={0}
                    isLast={idx === rootNodes.length - 1}
                />
            ))}
        </div>
    );
}

export function OrgReportModal({ isOpen, onClose, data }: OrgReportModalProps) {
    const reportRef = useRef<HTMLDivElement>(null);
    const [printing, setPrinting] = useState(false);

    if (!isOpen) return null;

    const { nodes, edges } = data;

    // Calcular estatísticas do organograma
    const totalRoles = nodes.length;
    const totalEdges = edges.length;

    // Cargos ocupados vs vagos
    const occupiedRoles = nodes.filter(n => (n.data?.employees?.length || 0) > 0).length;
    const vacantRoles = totalRoles - occupiedRoles;
    const occupancyRate = totalRoles > 0 ? ((occupiedRoles / totalRoles) * 100).toFixed(1) : 0;

    // Total de colaboradores
    const totalEmployees = nodes.reduce((sum, n) => sum + (n.data?.employees?.length || 0), 0);

    // Cargos sem gestor (potencial problema)
    const rolesWithoutManager = nodes.filter(n => !n.data?.managerId && n.data?.employees?.length === 0).length;

    // Departamentos únicos
    const departments = [...new Set(nodes.map(n => n.data?.department || 'Sem Departamento'))];

    // Colaboradores por departamento
    const employeesByDept = departments.map(dept => {
        const deptNodes = nodes.filter(n => (n.data?.department || 'Sem Departamento') === dept);
        const employees = deptNodes.reduce((sum, n) => sum + (n.data?.employees?.length || 0), 0);
        const roles = deptNodes.length;
        return { department: dept, employees, roles };
    }).sort((a, b) => b.employees - a.employees);

    // Níveis hierárquicos
    function calculateDepth(nodeId: string, memo: Map<string, number> = new Map()): number {
        if (memo.has(nodeId)) return memo.get(nodeId)!;
        const node = nodes.find(n => n.id === nodeId);
        if (!node?.data?.managerId) {
            memo.set(nodeId, 0);
            return 0;
        }
        const parentId = edges.find(e => e.target === nodeId)?.source;
        if (!parentId) {
            memo.set(nodeId, 0);
            return 0;
        }
        const depth = 1 + calculateDepth(parentId, memo);
        memo.set(nodeId, depth);
        return depth;
    }

    const depths = nodes.map(n => calculateDepth(n.id));
    const maxDepth = Math.max(...depths, 0) + 1;
    const avgDepth = depths.length > 0 ? (depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(1) : '0';

    // Span of Control (média de subordinados diretos)
    const managersWithSubordinates = nodes.filter(n => {
        const directReports = edges.filter(e => e.source === n.id).length;
        return directReports > 0;
    });
    const avgSpan = managersWithSubordinates.length > 0
        ? (edges.length / managersWithSubordinates.length).toFixed(1)
        : '0';

    // Gráfico de pizza - ocupação
    const occupancyData = [
        { name: 'Ocupados', value: occupiedRoles, color: '#10b981' },
        { name: 'Vagos', value: vacantRoles, color: '#f59e0b' }
    ];

    // Imprimir relatório
    const handlePrint = () => {
        setPrinting(true);
        setTimeout(() => {
            window.print();
            setPrinting(false);
        }, 100);
    };

    // Data atual formatada
    const currentDate = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-auto print:bg-white print:p-0"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto print:max-h-none print:rounded-none print:shadow-none"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header do Modal */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white px-8 py-6 print:bg-slate-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-white/10 rounded-xl">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight">Relatório Organizacional</h1>
                                        <p className="text-white/60 text-sm">Análise completa da estrutura hierárquica</p>
                                    </div>
                                </div>
                                <p className="text-xs text-white/40 mt-3">Gerado em {currentDate}</p>
                            </div>
                            <div className="flex items-center gap-2 print:hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white/70 hover:text-white hover:bg-white/10"
                                    onClick={handlePrint}
                                    disabled={printing}
                                >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Imprimir
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                                    onClick={onClose}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo do Relatório */}
                    <div ref={reportRef} className="p-8 space-y-8">
                        {/* Resumo Executivo */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                Resumo Executivo
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-100">
                                    <Building2 className="w-8 h-8 text-indigo-600 mb-2" />
                                    <p className="text-3xl font-bold text-slate-800">{totalRoles}</p>
                                    <p className="text-sm text-slate-500">Cargos</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-100">
                                    <Users className="w-8 h-8 text-emerald-600 mb-2" />
                                    <p className="text-3xl font-bold text-slate-800">{totalEmployees}</p>
                                    <p className="text-sm text-slate-500">Colaboradores</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-100">
                                    <Layers className="w-8 h-8 text-amber-600 mb-2" />
                                    <p className="text-3xl font-bold text-slate-800">{departments.length}</p>
                                    <p className="text-sm text-slate-500">Departamentos</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-100">
                                    <GitBranch className="w-8 h-8 text-purple-600 mb-2" />
                                    <p className="text-3xl font-bold text-slate-800">{maxDepth}</p>
                                    <p className="text-sm text-slate-500">Níveis Hierárquicos</p>
                                </div>
                            </div>
                        </section>

                        {/* Indicadores de Saúde */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                                Indicadores de Saúde Organizacional
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-slate-600">Taxa de Ocupação</span>
                                            <Badge variant={Number(occupancyRate) > 80 ? 'default' : 'secondary'} className={Number(occupancyRate) > 80 ? 'bg-emerald-500' : 'bg-amber-500'}>
                                                {Number(occupancyRate) > 80 ? 'Saudável' : 'Atenção'}
                                            </Badge>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-bold text-slate-800">{occupancyRate}%</span>
                                            <span className="text-sm text-slate-400 mb-1">de cargos ocupados</span>
                                        </div>
                                        <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                                                style={{ width: `${occupancyRate}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">{occupiedRoles} ocupados, {vacantRoles} vagos</p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-slate-600">Span of Control</span>
                                            <Badge variant="outline" className="border-indigo-200 text-indigo-700">Média</Badge>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-bold text-slate-800">{avgSpan}</span>
                                            <span className="text-sm text-slate-400 mb-1">subordinados/gestor</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-3">
                                            {Number(avgSpan) < 4 ? '⚡ Estrutura pode ser achatada' :
                                                Number(avgSpan) > 8 ? '⚠️ Gestores podem estar sobrecarregados' :
                                                    '✅ Proporção equilibrada'}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-slate-600">Profundidade</span>
                                            <Badge variant="outline" className="border-purple-200 text-purple-700">Níveis</Badge>
                                        </div>
                                        <div className="flex items-end gap-2">
                                            <span className="text-4xl font-bold text-slate-800">{maxDepth}</span>
                                            <span className="text-sm text-slate-400 mb-1">níveis totais</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-3">
                                            Média de {avgDepth} níveis por cargo.
                                            {maxDepth > 5 ? ' Considere achatar a hierarquia.' : ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </section>

                        {/* Gráficos */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Distribuição por Departamento */}
                            <Card className="border-2">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <PieChart className="w-4 h-4 text-indigo-600" />
                                        Colaboradores por Departamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={employeesByDept.slice(0, 6)} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" fontSize={11} />
                                            <YAxis dataKey="department" type="category" width={100} fontSize={10} tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '...' : v} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                                formatter={(value: any, name: any) => [value, name === 'employees' ? 'Colaboradores' : 'Cargos']}
                                            />
                                            <Bar dataKey="employees" fill="#6366f1" radius={[0, 4, 4, 0]} name="employees" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Ocupação */}
                            <Card className="border-2">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-indigo-600" />
                                        Taxa de Ocupação de Cargos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RechartsPie>
                                            <Pie
                                                data={occupancyData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {occupancyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Legend />
                                            <Tooltip />
                                        </RechartsPie>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Detalhamento por Departamento */}
                        <section>
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-600" />
                                Detalhamento por Departamento
                            </h2>
                            <div className="overflow-hidden rounded-xl border-2 border-slate-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 font-semibold text-slate-600">Departamento</th>
                                            <th className="text-center px-4 py-3 font-semibold text-slate-600">Cargos</th>
                                            <th className="text-center px-4 py-3 font-semibold text-slate-600">Colaboradores</th>
                                            <th className="text-center px-4 py-3 font-semibold text-slate-600">Ocupação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {employeesByDept.map((dept, idx) => {
                                            const occupiedInDept = nodes.filter(n =>
                                                (n.data?.department || 'Sem Departamento') === dept.department &&
                                                (n.data?.employees?.length || 0) > 0
                                            ).length;
                                            const occRate = dept.roles > 0 ? Math.round((occupiedInDept / dept.roles) * 100) : 0;
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                                            />
                                                            <span className="font-medium text-slate-700">{dept.department}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-medium text-slate-600">{dept.roles}</td>
                                                    <td className="px-4 py-3 text-center font-medium text-slate-600">{dept.employees}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge className={cn(
                                                            occRate >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                                occRate >= 50 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                        )}>
                                                            {occRate}%
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Estrutura Hierárquica Visual */}
                        <section className="break-inside-avoid">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-indigo-600" />
                                Estrutura Hierárquica Detalhada
                            </h2>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 overflow-x-auto">
                                <HierarchyTree nodes={nodes} edges={edges} />
                            </div>
                        </section>

                        {/* Alertas e Recomendações */}
                        <section className="break-inside-avoid">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Alertas e Recomendações
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vacantRoles > 0 && (
                                    <div className="flex gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                                        <div className="p-2 bg-amber-100 rounded-lg h-fit">
                                            <Briefcase className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-amber-800">Vagas em Aberto</h4>
                                            <p className="text-sm text-amber-700 mt-1">{vacantRoles} cargos estão sem ocupantes. Considere iniciar processos seletivos ou reavaliar a necessidade destes cargos.</p>
                                        </div>
                                    </div>
                                )}

                                {Number(avgSpan) > 8 && (
                                    <div className="flex gap-4 p-4 bg-red-50 rounded-xl border border-red-200">
                                        <div className="p-2 bg-red-100 rounded-lg h-fit">
                                            <Users className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-red-800">Span of Control Alto</h4>
                                            <p className="text-sm text-red-700 mt-1">A média de {avgSpan} subordinados por gestor pode indicar sobrecarga. Considere criar novas posições de liderança.</p>
                                        </div>
                                    </div>
                                )}

                                {maxDepth > 5 && (
                                    <div className="flex gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                        <div className="p-2 bg-purple-100 rounded-lg h-fit">
                                            <GitBranch className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-purple-800">Hierarquia Profunda</h4>
                                            <p className="text-sm text-purple-700 mt-1">{maxDepth} níveis hierárquicos podem causar lentidão na tomada de decisões. Avalie oportunidades de achatar a estrutura.</p>
                                        </div>
                                    </div>
                                )}

                                {Number(occupancyRate) >= 80 && Number(avgSpan) <= 7 && maxDepth <= 5 && (
                                    <div className="flex gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                        <div className="p-2 bg-emerald-100 rounded-lg h-fit">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-emerald-800">Estrutura Saudável</h4>
                                            <p className="text-sm text-emerald-700 mt-1">Os indicadores organizacionais estão dentro dos parâmetros recomendados. Continue monitorando periodicamente.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Rodapé */}
                        <div className="border-t pt-6 mt-8">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    <span>PCCS NextGen - Sistema de Gestão de Cargos e Salários</span>
                                </div>
                                <span>Página 1 de 1</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
