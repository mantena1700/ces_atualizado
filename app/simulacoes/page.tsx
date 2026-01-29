'use client';

import { useState, useEffect } from 'react';
import { calculateEnquadramento } from '@/app/actions/simulations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calculator,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    Download,
    ArrowUpRight,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimulacoesPage() {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await calculateEnquadramento();
            setReport(data);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="p-8 text-center">Calculando impacto financeiro...</div>;
    if (!report) return <div className="p-8 text-center">Nenhum dado encontrado para simulação.</div>;

    const { summary, data } = report;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen print:bg-white print:p-0">
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-shadow-none { shadow: none !important; border: 1px solid #eee !important; }
                    aside, nav, .sidebar, button { display: none !important; }
                    .main-content { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    @page { margin: 1.5cm; }
                    tr { avoid-break-inside: auto; }
                }
            `}</style>

            <div className="flex items-center justify-between no-print">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Simulações de Enquadramento</h2>
                    <p className="text-muted-foreground">Analise o impacto financeiro da implementação do novo plano salarial.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="gap-2 shadow-sm border-slate-200">
                        <Download className="w-4 h-4" /> Gerar Relatório PDF
                    </Button>
                </div>
            </div>

            {/* HEADER PARA IMPRESSÃO (Só aparece no PDF) */}
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-8">
                <h1 className="text-2xl font-bold">Relatório Executivo de Enquadramento Salarial</h1>
                <p className="text-sm text-slate-500">PCCS NextGen - Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Impacto Real (Custo Empresa)</CardTitle>
                        <Calculator className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalImpactReal)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Salário + Encargos + Benefícios
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Custo Total Atual (Mensal)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.totalCostAtual)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Impacto de {summary.impactPercentage.toFixed(2)}% na folha total
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Abaixo da Matriz</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.countAbaixo}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Colaboradores que ganham menos que o Step A
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Red Circles (Excedentes)</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.countExcedente}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Colaboradores acima do teto da grade
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* DASHBOARD EXECUTIVO */}
            <div className="grid gap-6 md:grid-cols-7">

                {/* GRÁFICO DE DISPERSÃO (Pontos x Salário) */}
                <Card className="md:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Curva de Aderência (Pontos x Salário)</CardTitle>
                        <p className="text-sm text-muted-foreground">Cada ponto representa um colaborador. A linha representa a tendência ideal.</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full border relative bg-slate-50/50 rounded-lg overflow-hidden group">
                            {(() => {
                                // Lógica simples de Escala para o Gráfico
                                const maxSalary = Math.max(...data.map((d: any) => Math.max(d.salaryAtual, d.proposedSalary)), 5000) * 1.1;
                                const maxPoints = Math.max(...data.map((d: any) => d.totalPoints), 500) * 1.1;

                                return (
                                    <>
                                        {/* Eixo Y - Labels */}
                                        <div className="absolute left-0 top-0 bottom-0 w-12 border-r flex flex-col justify-between py-2 text-[10px] text-slate-400 px-1 bg-white z-10">
                                            <span>{new Intl.NumberFormat('pt-BR', { notation: "compact" }).format(maxSalary)}</span>
                                            <span>{new Intl.NumberFormat('pt-BR', { notation: "compact" }).format(maxSalary / 2)}</span>
                                            <span>0</span>
                                        </div>

                                        {/* Grid Lines Horizontais */}
                                        <div className="absolute left-12 right-0 top-[25%] h-px bg-slate-200 border-dashed border-b"></div>
                                        <div className="absolute left-12 right-0 top-[50%] h-px bg-slate-200 border-dashed border-b"></div>
                                        <div className="absolute left-12 right-0 top-[75%] h-px bg-slate-200 border-dashed border-b"></div>

                                        {/* Plotagem dos Colaboradores */}
                                        <div className="absolute left-12 right-0 top-0 bottom-6">
                                            {data.map((emp: any) => {
                                                const bottom = (emp.salaryAtual / maxSalary) * 100;
                                                const left = (emp.totalPoints / maxPoints) * 100;
                                                // Cor baseada no status
                                                const colorClass = emp.status === 'Abaixo da Tabela' ? 'bg-amber-400' :
                                                    emp.status === 'Excedente' ? 'bg-rose-500' : 'bg-emerald-500';

                                                return (
                                                    <div
                                                        key={emp.id}
                                                        className={`absolute w-3 h-3 rounded-full border border-white shadow-sm opacity-80 hover:opacity-100 hover:scale-150 transition-all cursor-pointer ${colorClass}`}
                                                        style={{ bottom: `${bottom}%`, left: `${left}%` }}
                                                        title={`${emp.name} (${emp.totalPoints} pts) - R$ ${emp.salaryAtual}`}
                                                    ></div>
                                                )
                                            })}
                                        </div>

                                        {/* Eixo X - Label */}
                                        <div className="absolute left-12 right-0 bottom-0 h-6 border-t flex items-center justify-between px-2 text-[10px] text-slate-400 bg-white">
                                            <span>0 pts</span>
                                            <span className="font-semibold uppercase tracking-widest">Peso do Cargo (Pontos Hay)</span>
                                            <span>{Math.round(maxPoints)} pts</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="flex gap-4 justify-center mt-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Enquadrado</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Abaixo (Aumento Necessário)</div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Excedente (Acima do Mercado)</div>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI POR DEPARTAMENTO */}
                <Card className="md:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Impacto por Departamento</CardTitle>
                        <p className="text-sm text-muted-foreground">Onde investir o orçamento?</p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(() => {
                                // Agrupamento por Departamento
                                const deptStats: any = {};
                                data.forEach((d: any) => {
                                    const dept = d.jobArea || 'Geral';
                                    if (!deptStats[dept]) deptStats[dept] = { totalGap: 0, count: 0, totalSalary: 0 };
                                    deptStats[dept].totalGap += d.gap;
                                    deptStats[dept].totalSalary += d.salaryAtual;
                                    deptStats[dept].count += 1;
                                });

                                const sortedDepts = Object.entries(deptStats)
                                    .sort(([, a]: any, [, b]: any) => b.totalGap - a.totalGap) // Ordenar por maior impacto
                                    .slice(0, 5); // Top 5

                                return sortedDepts.map(([dept, stat]: any) => (
                                    <div key={dept} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="font-medium text-slate-700">{dept}</div>
                                            <div className="text-slate-500">{stat.count} pessoas</div>
                                        </div>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-xs font-bold text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stat.totalGap)}
                                                <span className="text-slate-400 font-normal ml-1">necessários</span>
                                            </div>
                                            <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                +{((stat.totalGap / stat.totalSalary) * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${(stat.totalGap / summary.totalImpact) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ));
                            })()}

                            {Object.keys(data).length === 0 && <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* MAIN DATA TABLE */}
            <Card className="shadow-md overflow-hidden border-none ring-1 ring-slate-200">
                <CardHeader className="bg-white border-b flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Detalhamento por Colaborador</CardTitle>
                        <p className="text-sm text-muted-foreground">Comparação Individual: Atual vs Proposto</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Exportar Relatório
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b">
                                <tr>
                                    <th className="p-4 text-left">Colaborador / Cargo</th>
                                    <th className="p-4 text-left">Grade</th>
                                    <th className="p-4 text-right">Custo Empresa</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Custo Proposto</th>
                                    <th className="p-4 text-right">Impacto Real</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {data.map((row: any) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedEmployee(row)}
                                    >
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-900">{row.name}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={cn(
                                                    "text-[9px] font-black px-1.5 py-0.5 rounded border",
                                                    row.hiringType === 'CLT' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                                                )}>
                                                    {row.hiringType}
                                                </span>
                                                <div className="text-xs text-slate-500 uppercase tracking-tighter">{row.jobTitle}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-600 font-medium">{row.gradeName || '-'}</td>
                                        <td className="p-4 text-right">
                                            <div className="font-mono text-slate-700 text-xs">Nom: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.salaryAtual)}</div>
                                            <div className="font-bold text-slate-900">Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.totalCostAtual)}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                                row.status === 'Abaixo da Tabela' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                    row.status === 'Excedente' ? "bg-rose-50 text-rose-700 border-rose-200" :
                                                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            )}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-bold text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.totalCostProposto)}
                                            </div>
                                            <div className="text-[10px] text-primary font-bold uppercase">Step {row.proposedStep}</div>
                                        </td>
                                        <td className="p-4 text-right font-bold">
                                            {row.totalGap > 0 ? (
                                                <span className="text-rose-600 flex items-center justify-end gap-1">
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.totalGap)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* MODAL DE DIAGNÓSTICO DETALHADO - VISUAL PREMIUM */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border-none ring-1 ring-white/20 overflow-hidden flex flex-col max-h-[90vh]">

                        {/* HEADER - Título e Botão Fechar */}
                        <div className="flex items-center justify-between px-8 py-5 border-b bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Análise de Enquadramento</h3>
                                <p className="text-sm text-slate-500 font-medium">Diagnóstico de Tabela Salarial • Grade {selectedEmployee.gradeName}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100" onClick={() => setSelectedEmployee(null)}>
                                <ChevronDown className="w-6 h-6 rotate-180 text-slate-400" />
                            </Button>
                        </div>

                        <div className="overflow-y-auto p-8 bg-slate-50/50 space-y-8">

                            {/* 1. CARTÃO DE PERFIL E SALÁRIO (HERO SECTION) */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                                <div className="h-20 w-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-slate-200 shrink-0 z-10">
                                    {selectedEmployee.name.charAt(0)}
                                </div>

                                <div className="flex-1 text-center md:text-left z-10">
                                    <h4 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h4>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 shadow-sm">
                                            {selectedEmployee.jobTitle}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-600 font-medium text-sm">{selectedEmployee.gradeName}</span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custo Total</span>
                                            <span className="font-bold text-slate-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.totalCostAtual)}</span>
                                        </div>
                                        <div className="flex flex-col border-l border-slate-200 pl-3">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Encargos</span>
                                            <span className="font-semibold text-slate-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.totalCostAtual - selectedEmployee.salaryAtual - (selectedEmployee.benefitsTotal || 0))}</span>
                                        </div>
                                        <div className="flex flex-col border-l border-slate-200 pl-3">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Benefícios</span>
                                            <span className="font-semibold text-slate-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.benefitsTotal || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center md:text-right bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px] z-10">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Salário Base</div>
                                    <div className="text-3xl font-black text-slate-800 tracking-tighter">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.salaryAtual)}
                                    </div>
                                    <div className="text-[10px] font-bold text-emerald-600 mt-1">
                                        Valor usado na comparação
                                    </div>
                                </div>
                            </div>

                            {/* 2. RÉGUA SALARIAL (VISUAL REFINADO) */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                            Posição na Faixa
                                        </h5>
                                        <p className="text-slate-500 text-sm">Onde o salário base se encontra em relação ao mercado.</p>
                                    </div>
                                </div>

                                <div className="relative h-24 w-full px-4">
                                    {/* Legendas Superiores (Piso e Teto) */}
                                    <div className="absolute top-0 left-0 text-xs font-bold text-slate-400 uppercase tracking-widest">Piso</div>
                                    <div className="absolute top-0 right-0 text-xs font-bold text-slate-400 uppercase tracking-widest">Teto</div>

                                    {/* Barra de Fundo */}
                                    <div className="absolute left-0 right-0 top-8 h-3 bg-slate-100 rounded-full overflow-hidden"></div>

                                    {/* Barra de Faixa Ideal (Gradiente Suave) */}
                                    <div className="absolute left-[10%] right-[10%] top-8 h-3 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 rounded-full opacity-60"></div>

                                    {/* Marcador MIDPOINT */}
                                    <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-300 border-dashed z-0"></div>
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Midpoint da Grade</div>

                                    {/* Marcador do Usuário (Animado) */}
                                    {(() => {
                                        // Lógica visual de %
                                        const ratio = selectedEmployee.salaryAtual / selectedEmployee.proposedSalary;
                                        let visualPercent = ((ratio - 0.7) / (1.3 - 0.7)) * 100;
                                        visualPercent = Math.max(0, Math.min(100, visualPercent));

                                        const statusColor = selectedEmployee.status === 'Excedente' ? 'bg-rose-500 text-rose-50' :
                                            selectedEmployee.status === 'Abaixo da Tabela' ? 'bg-amber-500 text-amber-50' :
                                                'bg-emerald-500 text-emerald-50';

                                        const needleColor = selectedEmployee.status === 'Excedente' ? 'border-rose-500' :
                                            selectedEmployee.status === 'Abaixo da Tabela' ? 'border-amber-500' :
                                                'border-emerald-500';

                                        return (
                                            <div className="absolute top-5 h-full w-px transition-all duration-700 ease-out z-10" style={{ left: `${visualPercent}%` }}>
                                                {/* Agulha */}
                                                <div className={`h-8 w-1 -ml-[1px] ${selectedEmployee.status === 'Excedente' ? 'bg-rose-500' : selectedEmployee.status === 'Abaixo da Tabela' ? 'bg-amber-500' : 'bg-emerald-500'} rounded-full`}></div>

                                                {/* Balão de Valor */}
                                                <div className={`absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg shadow-lg ${statusColor} text-center min-w-[100px]`}>
                                                    <div className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Você está aqui</div>
                                                    <div className="text-sm font-black tracking-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.salaryAtual)}</div>
                                                    {/* Triângulo do balão */}
                                                    <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${selectedEmployee.status === 'Excedente' ? 'bg-rose-500' : selectedEmployee.status === 'Abaixo da Tabela' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="flex justify-between items-center text-sm font-medium text-slate-600 mt-6 pt-4 border-t border-slate-50">
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.proposedSalary * 0.8)}</span>
                                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.proposedSalary * 1.2)}</span>
                                </div>
                            </div>

                            {/* 3. GRID DE DIAGNÓSTICO E AÇÃO */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Card Diagnóstico */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                        <h5 className="font-bold text-slate-800">Diagnóstico Técnico</h5>
                                    </div>
                                    <div className="mb-4">
                                        {selectedEmployee.status === 'Excedente' && <div className="text-rose-600 font-bold text-lg mb-2">Salário acima do teto</div>}
                                        {selectedEmployee.status === 'Abaixo da Tabela' && <div className="text-amber-600 font-bold text-lg mb-2">Salário defasado</div>}
                                        {selectedEmployee.status === 'Enquadrado' && <div className="text-emerald-600 font-bold text-lg mb-2">Salário compatível</div>}

                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {selectedEmployee.status === 'Excedente'
                                                ? "O valor atual ultrapassa o limite máximo da faixa salarial estipulada para este cargo e nível de senioridade."
                                                : selectedEmployee.status === 'Abaixo da Tabela'
                                                    ? "O valor atual está abaixo do mínimo praticado para a posição, gerando riscos de retenção e passivo trabalhista."
                                                    : "O colaborador está posicionado dentro da zona segura da faixa salarial, alinhado com as políticas da empresa."
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Card Plano de Ação */}
                                <div className={`p-6 rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${selectedEmployee.status === 'Abaixo da Tabela' ? 'bg-amber-50/50 border-amber-100' :
                                    selectedEmployee.status === 'Excedente' ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'
                                    }`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${selectedEmployee.status === 'Abaixo da Tabela' ? 'bg-amber-100 text-amber-700' :
                                            selectedEmployee.status === 'Excedente' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <h5 className="font-bold text-slate-800">Plano de Ação Recomendado</h5>
                                    </div>

                                    {selectedEmployee.status === 'Excedente' ? (
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                                <span className="text-sm text-rose-900 font-medium">Congelar aumentos até equiparação.</span>
                                            </li>
                                            <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-rose-100 shadow-sm">
                                                <div className="w-2 h-2 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                                                <span className="text-sm text-rose-900 font-medium">Avaliar upgrade de cargo (Sênior).</span>
                                            </li>
                                        </ul>
                                    ) : selectedEmployee.status === 'Abaixo da Tabela' ? (
                                        <div className="space-y-3">
                                            <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm">
                                                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Ajuste Imediato</div>
                                                <div className="text-2xl font-black text-amber-700">
                                                    +{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedEmployee.gap)}
                                                </div>
                                                <div className="text-xs text-amber-600 mt-1">Para atingir o piso da categoria</div>
                                            </div>
                                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200">
                                                Aplicar Ajuste Agora
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[120px] text-center">
                                            <span className="text-emerald-700 font-bold">Nenhuma ação necessária.</span>
                                            <span className="text-emerald-600/70 text-sm mt-1">Manter monitoramento anual.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 border-t flex justify-end gap-3">
                            <Button variant="outline" size="lg" onClick={() => setSelectedEmployee(null)}>Fechar</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
