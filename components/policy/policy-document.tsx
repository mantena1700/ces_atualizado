'use client';

import { useState } from 'react';
import { PolicyOverview } from '@/app/actions/policy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Building2, Users, Briefcase, Award, DollarSign, TrendingUp,
    FileText, Layers, Grid3X3, ChevronDown, ChevronRight,
    BookOpen, Scale, CheckCircle2, ArrowRight, Percent, Gift,
    LayoutGrid, Network, Calculator
} from 'lucide-react';

interface PolicyDocumentProps {
    data: PolicyOverview;
}

export function PolicyDocument({ data }: PolicyDocumentProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro', 'structure', 'matrix']));

    const toggleSection = (section: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(section)) {
            newSet.delete(section);
        } else {
            newSet.add(section);
        }
        setExpandedSections(newSet);
    };

    const SectionHeader = ({ id, icon: Icon, title, subtitle }: { id: string; icon: any; title: string; subtitle?: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 hover:to-slate-50 transition-all border-b"
        >
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {expandedSections.has(id) ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
        </button>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Capa do Documento */}
            <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
                <div className="p-12 text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
                        <div className="absolute bottom-10 right-10 w-48 h-48 border border-white rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white rounded-full"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                            <BookOpen className="w-4 h-4" />
                            Documento Oficial
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Política de Cargos e Salários
                        </h1>
                        <p className="text-xl text-blue-200 mb-8">
                            PCCS - Plano de Cargos, Carreiras e Salários
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <Users className="w-4 h-4" />
                                <span>{data.totalEmployees} Colaboradores</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <Briefcase className="w-4 h-4" />
                                <span>{data.totalRoles} Cargos</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <Layers className="w-4 h-4" />
                                <span>{data.totalGrades} Grades</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                <Building2 className="w-4 h-4" />
                                <span>{data.totalDepartments.length} Departamentos</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-4 bg-black/20 text-center text-sm text-blue-200">
                    Gerado em {new Date(data.generatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </Card>

            {/* Sumário Executivo */}
            <Card className="overflow-hidden border-none shadow-xl">
                <SectionHeader
                    id="intro"
                    icon={FileText}
                    title="1. Introdução e Objetivos"
                    subtitle="Propósito e abrangência da política"
                />
                {expandedSections.has('intro') && (
                    <div className="p-8 space-y-6">
                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-600 leading-relaxed">
                                Esta Política de Cargos e Salários tem como objetivo estabelecer critérios claros e transparentes
                                para a gestão de pessoas, garantindo equidade interna e competitividade externa na atração e
                                retenção de talentos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                                <Scale className="w-8 h-8 text-blue-600 mb-3" />
                                <h4 className="font-bold text-slate-800 mb-1">Equidade Interna</h4>
                                <p className="text-sm text-slate-600">
                                    Garantir que cargos de mesma complexidade tenham remuneração equivalente.
                                </p>
                            </div>
                            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                                <TrendingUp className="w-8 h-8 text-emerald-600 mb-3" />
                                <h4 className="font-bold text-slate-800 mb-1">Competitividade</h4>
                                <p className="text-sm text-slate-600">
                                    Manter salários alinhados com o mercado para atrair talentos.
                                </p>
                            </div>
                            <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                                <Award className="w-8 h-8 text-purple-600 mb-3" />
                                <h4 className="font-bold text-slate-800 mb-1">Meritocracia</h4>
                                <p className="text-sm text-slate-600">
                                    Progressão baseada em desempenho e desenvolvimento profissional.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Estrutura Organizacional */}
            <Card className="overflow-hidden border-none shadow-xl">
                <SectionHeader
                    id="structure"
                    icon={Network}
                    title="2. Estrutura Organizacional"
                    subtitle={`${data.totalDepartments.length} departamentos • ${data.totalRoles} cargos`}
                />
                {expandedSections.has('structure') && (
                    <div className="p-8 space-y-6">
                        {/* Departamentos */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-slate-400" />
                                Departamentos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {data.departments.map((dept, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800">{dept.name}</h4>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                {dept.employeesCount} pessoas
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1">
                                            <p>{dept.rolesCount} cargos diferentes</p>
                                            <p>Média salarial: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dept.avgSalary)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cargos por Hierarquia */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-slate-400" />
                                Hierarquia de Cargos
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Cargo</th>
                                            <th className="px-4 py-3 text-left">Departamento</th>
                                            <th className="px-4 py-3 text-center">Grade</th>
                                            <th className="px-4 py-3 text-center">Pontos</th>
                                            <th className="px-4 py-3 text-center">Headcount</th>
                                            <th className="px-4 py-3 text-left">Reporta a</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.hierarchy.slice(0, 15).map((role, i) => (
                                            <tr key={role.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-800">{role.title}</td>
                                                <td className="px-4 py-3 text-slate-500">{role.department || '-'}</td>
                                                <td className="px-4 py-3 text-center">
                                                    {role.grade ? (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                            {role.grade}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center font-mono text-slate-600">{role.totalPoints}</td>
                                                <td className="px-4 py-3 text-center font-bold">{role.headcount}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs">{role.reportsTo || 'Nível Executivo'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {data.hierarchy.length > 15 && (
                                    <p className="text-center text-xs text-slate-400 py-3">
                                        + {data.hierarchy.length - 15} cargos adicionais
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Fatores de Avaliação */}
            <Card className="overflow-hidden border-none shadow-xl">
                <SectionHeader
                    id="factors"
                    icon={Award}
                    title="3. Sistema de Avaliação de Cargos"
                    subtitle={`${data.factors.length} fatores de avaliação`}
                />
                {expandedSections.has('factors') && (
                    <div className="p-8 space-y-6">
                        <p className="text-slate-600">
                            Os cargos são avaliados através do <strong>Método de Pontos por Fator</strong>, onde cada cargo
                            recebe uma pontuação baseada em critérios objetivos que mensuram sua complexidade e importância.
                        </p>

                        <div className="space-y-4">
                            {data.factors.map((factor, i) => (
                                <div key={factor.id} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="p-4 bg-slate-50 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{factor.name}</h4>
                                            {factor.description && (
                                                <p className="text-sm text-slate-500">{factor.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold">
                                                Peso: {(factor.weight * 100).toFixed(0)}%
                                            </span>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">
                                                {factor.levelsCount} níveis
                                            </span>
                                        </div>
                                    </div>
                                    {factor.levels.length > 0 && (
                                        <div className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {factor.levels.map((level, j) => (
                                                    <div key={j} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs">
                                                        <span className="font-bold text-slate-800">Nível {level.level}</span>
                                                        <span className="text-slate-500">{level.description}</span>
                                                        <span className="font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                                                            {level.points} pts
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {data.factors.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Nenhum fator de avaliação cadastrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Matriz Salarial */}
            <Card className="overflow-hidden border-none shadow-xl">
                <SectionHeader
                    id="matrix"
                    icon={Grid3X3}
                    title="4. Matriz Salarial"
                    subtitle={`${data.totalGrades} grades × ${data.totalSteps} steps`}
                />
                {expandedSections.has('matrix') && (
                    <div className="p-8 space-y-6">
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-600 font-medium">Menor Salário</p>
                                <p className="text-xl font-bold text-blue-800">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.salaryRange.min)}
                                </p>
                            </div>
                            <div className="px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-xs text-emerald-600 font-medium">Média Salarial</p>
                                <p className="text-xl font-bold text-emerald-800">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.averageSalary)}
                                </p>
                            </div>
                            <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-100">
                                <p className="text-xs text-purple-600 font-medium">Maior Salário</p>
                                <p className="text-xl font-bold text-purple-800">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.salaryRange.max)}
                                </p>
                            </div>
                        </div>

                        {data.salaryMatrix.length > 0 && data.steps.length > 0 ? (
                            <div className="overflow-x-auto border rounded-xl">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-900 text-white">
                                            <th className="px-4 py-3 text-left font-bold">Grade</th>
                                            {data.steps.map(step => (
                                                <th key={step.id} className="px-4 py-3 text-center font-bold">
                                                    {step.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {data.salaryMatrix.map((row, i) => (
                                            <tr key={row.gradeId} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">
                                                    {row.gradeName}
                                                </td>
                                                {row.values.map(cell => (
                                                    <td key={cell.stepId} className="px-4 py-3 text-center font-mono text-slate-700">
                                                        {cell.amount > 0
                                                            ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cell.amount)
                                                            : '-'
                                                        }
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 border rounded-xl">
                                <Grid3X3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Matriz salarial não configurada</p>
                            </div>
                        )}

                        {/* Grades */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-slate-400" />
                                Grades Salariais (Faixas de Pontuação)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {data.grades.map(grade => (
                                    <div key={grade.id} className="p-4 border border-slate-200 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800">{grade.name}</h4>
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                {grade.rolesCount} cargos
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Pontuação: {grade.minPoints} - {grade.maxPoints} pontos
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Encargos e Benefícios */}
            <Card className="overflow-hidden border-none shadow-xl">
                <SectionHeader
                    id="costs"
                    icon={Calculator}
                    title="5. Encargos e Benefícios"
                    subtitle="Composição do custo de pessoal"
                />
                {expandedSections.has('costs') && (
                    <div className="p-8 space-y-8">
                        {/* Encargos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CLT */}
                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                                        <Percent className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Encargos CLT</h4>
                                        <p className="text-xs text-slate-500">Total: {data.taxes.totalCLT.toFixed(2)}% sobre salário</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {data.taxes.clt.map((tax, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">{tax.label}</span>
                                            <span className="font-mono font-bold text-slate-800">{tax.value.toFixed(2)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* PJ */}
                            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-emerald-600 text-white rounded-lg">
                                        <Percent className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Encargos PJ</h4>
                                        <p className="text-xs text-slate-500">Total: {data.taxes.totalPJ.toFixed(2)}% sobre valor</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {data.taxes.pj.map((tax, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600">{tax.label}</span>
                                            <span className="font-mono font-bold text-slate-800">{tax.value.toFixed(2)}%</span>
                                        </div>
                                    ))}
                                    {data.taxes.pj.length === 0 && (
                                        <p className="text-sm text-slate-400">Nenhum encargo PJ configurado</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Benefícios */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-slate-400" />
                                Benefícios Oferecidos
                            </h3>
                            {data.benefits.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {data.benefits.map(benefit => (
                                        <div key={benefit.id} className="p-4 border border-slate-200 rounded-lg hover:border-purple-300 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800">{benefit.name}</h4>
                                                <span className={`text-xs px-2 py-0.5 rounded ${benefit.type === 'FIXED'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {benefit.type === 'FIXED' ? 'Fixo' : 'Percentual'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    {benefit.employeesCount} beneficiários
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {benefit.type === 'FIXED'
                                                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(benefit.value)
                                                        : `${benefit.value}%`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 border rounded-xl">
                                    <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Nenhum benefício cadastrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            {/* Regras de Progressão */}
            <Card className="overflow-hidden border-none shadow-xl">
                <SectionHeader
                    id="progression"
                    icon={TrendingUp}
                    title="6. Regras de Progressão"
                    subtitle="Critérios para movimentação salarial"
                />
                {expandedSections.has('progression') && (
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 border-2 border-blue-200 rounded-xl bg-blue-50/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <ArrowRight className="w-6 h-6 text-blue-600" />
                                    <h4 className="font-bold text-slate-800">Progressão Horizontal</h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    Movimentação entre Steps (A → B → C) dentro da mesma Grade.
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <span>Avaliação de desempenho satisfatória</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <span>Tempo mínimo no step atual (12-18 meses)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <span>Disponibilidade orçamentária</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 border-2 border-purple-200 rounded-xl bg-purple-50/50">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                    <h4 className="font-bold text-slate-800">Progressão Vertical</h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-4">
                                    Promoção para cargo de Grade superior (mudança de cargo).
                                </p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <span>Vaga aprovada no orçamento</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <span>Requisitos técnicos do novo cargo</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                                        <span>Aprovação do gestor e RH</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                            <strong>Nota:</strong> Todas as progressões são analisadas durante o ciclo de revisão anual
                            e estão sujeitas à aprovação da diretoria.
                        </div>
                    </div>
                )}
            </Card>

            {/* Rodapé */}
            <div className="text-center py-8 text-slate-400 text-sm">
                <p>Este documento foi gerado automaticamente pelo Sistema PCCS</p>
                <p className="text-xs mt-1">
                    Versão atualizada em {new Date(data.generatedAt).toLocaleDateString('pt-BR')}
                </p>
            </div>
        </div>
    );
}
