'use client';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    X, User, Briefcase, BadgeDollarSign, Building2, Phone, Receipt,
    PieChart, Pencil, Calendar, Mail, MapPin, Scale, Award, Clock,
    GraduationCap, Star, TrendingUp, Sparkles, Target, ChevronRight,
    FileText, CreditCard, ShieldCheck, Download
} from "lucide-react";
import { TaxSetting } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

interface EmployeeDetailsProps {
    employee: any;
    onClose: () => void;
    onEdit: () => void;
    taxSettings?: TaxSetting[];
}

export function EmployeeDetails({ employee, onClose, onEdit, taxSettings = [] }: EmployeeDetailsProps) {
    if (!employee) return null;

    // --- CÁLCULOS FINANCEIROS ---
    const salary = Number(employee.salary) || 0;
    const hiringType = employee.hiringType || 'CLT';

    const applicableTaxes = taxSettings.filter(t => t.category === hiringType);

    let totalTaxRate = 0;
    let taxes = 0;
    if (applicableTaxes.length > 0) {
        totalTaxRate = applicableTaxes.reduce((acc, t) => acc + t.value, 0) / 100;
        taxes = salary * totalTaxRate;
    } else {
        const fallbackRate = hiringType === 'CLT' ? 0.68 : 0;
        taxes = salary * fallbackRate;
    }

    let benefitsTotal = 0;
    const benefitsList = employee.benefits?.map((eb: any) => {
        const b = eb.benefit;
        const cost = b.type === 'FIXED' ? Number(b.value) : (salary * (Number(b.value) / 100));
        benefitsTotal += cost;
        return { ...b, cost };
    }) || [];

    const totalCost = salary + taxes + benefitsTotal;

    const pSalary = totalCost > 0 ? (salary / totalCost) * 100 : 0;
    const pTaxes = totalCost > 0 ? (taxes / totalCost) * 100 : 0;
    const pBenefits = totalCost > 0 ? (benefitsTotal / totalCost) * 100 : 0;
    const r = 15.9155;

    // Calcular tempo de empresa
    const admissionDate = employee.admissionDate ? new Date(employee.admissionDate) : null;
    let tempoEmpresa = '';
    if (admissionDate) {
        const now = new Date();
        const years = Math.floor((now.getTime() - admissionDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const months = Math.floor((now.getTime() - admissionDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)) % 12;
        if (years > 0) {
            tempoEmpresa = `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months !== 1 ? 'es' : ''}`;
        } else {
            tempoEmpresa = `${months} mês${months !== 1 ? 'es' : ''}`;
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-[3px] animate-in fade-in duration-200">
            <div className="h-full w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">

                {/* --- HEADER PREMIUM --- */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shrink-0 overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10 p-6">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-blue-300 uppercase tracking-widest text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                                <Briefcase className="w-3.5 h-3.5" />
                                Prontuário Digital
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onEdit}
                                    className="h-9 text-xs font-semibold bg-white text-slate-900 hover:bg-blue-50 rounded-lg gap-1.5"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Avatar e Info Principal */}
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white/20">
                                {employee.name?.charAt(0) || <User className="w-8 h-8" />}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white mb-1">
                                    {employee.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm text-blue-200">
                                        <Building2 className="w-3.5 h-3.5" />
                                        {employee.jobRole?.department || 'Geral'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-emerald-300">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        {employee.jobRole?.title || 'Sem Cargo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTEÚDO SCROLLÁVEL --- */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="p-6 space-y-6">

                        {/* Quick Stats (Cards em Grid) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Card className="p-4 bg-white border-0 shadow-sm">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Salário Base</p>
                                <p className="text-lg font-bold text-slate-800">{formatCurrency(salary)}</p>
                            </Card>
                            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
                                <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Custo Total</p>
                                <p className="text-lg font-bold text-blue-700">{formatCurrency(totalCost)}</p>
                            </Card>
                            <Card className="p-4 bg-white border-0 shadow-sm">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Regime</p>
                                <p className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" />
                                    {hiringType}
                                </p>
                            </Card>
                            <Card className="p-4 bg-white border-0 shadow-sm">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Grade</p>
                                <p className="text-lg font-bold text-purple-600">
                                    {employee.jobRole?.grade?.name || '—'}
                                </p>
                            </Card>
                        </div>

                        {/* Informações Profissionais */}
                        <Card className="p-5 bg-white border-0 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                Informações Profissionais
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Cargo Atual</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {employee.jobRole?.title || 'Não definido'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Pontuação do Cargo</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {employee.jobRole?.totalPoints || 0} pontos
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Data de Admissão</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {admissionDate ? admissionDate.toLocaleDateString('pt-BR') : 'Não informada'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tempo de Empresa</p>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {tempoEmpresa || 'Não calculado'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Composição de Custos */}
                        <Card className="p-5 bg-white border-0 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                                <PieChart className="w-4 h-4" />
                                Composição de Custo Mensal
                            </h3>

                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Gráfico Donut */}
                                <div className="relative w-36 h-36 shrink-0">
                                    <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                                        <circle cx="21" cy="21" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                                        <circle cx="21" cy="21" r={r} fill="transparent" stroke="#3b82f6" strokeWidth="6"
                                            strokeDasharray={`${pSalary} ${100 - pSalary}`} strokeDashoffset="0" strokeLinecap="round" />
                                        <circle cx="21" cy="21" r={r} fill="transparent" stroke="#f43f5e" strokeWidth="6"
                                            strokeDasharray={`${pTaxes} ${100 - pTaxes}`} strokeDashoffset={-pSalary} strokeLinecap="round" />
                                        <circle cx="21" cy="21" r={r} fill="transparent" stroke="#10b981" strokeWidth="6"
                                            strokeDasharray={`${pBenefits} ${100 - pBenefits}`} strokeDashoffset={-(pSalary + pTaxes)} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                        <span className="text-lg font-black text-slate-800">100%</span>
                                    </div>
                                </div>

                                {/* Legenda */}
                                <div className="flex-1 w-full space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Salário</p>
                                                <p className="text-[10px] text-slate-400">Valor Bruto</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-800">{formatCurrency(salary)}</p>
                                            <p className="text-[10px] text-slate-400">{pSalary.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Encargos</p>
                                                <p className="text-[10px] text-slate-400">{hiringType === 'CLT' ? 'FGTS, INSS, 13º...' : 'Custos operacionais'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-rose-600">{formatCurrency(taxes)}</p>
                                            <p className="text-[10px] text-slate-400">{pTaxes.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">Benefícios</p>
                                                <p className="text-[10px] text-slate-400">{benefitsList.length} ativo(s)</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(benefitsTotal)}</p>
                                            <p className="text-[10px] text-slate-400">{pBenefits.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Detalhamento de Encargos */}
                        {taxes > 0 && applicableTaxes.length > 0 && (
                            <Card className="p-5 bg-white border-0 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Scale className="w-4 h-4" />
                                        Detalhamento de Encargos ({hiringType})
                                    </h3>
                                    {hiringType === 'CLT' && (
                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg font-medium">
                                            Provisão Mensal
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {applicableTaxes.map((tax, idx) => {
                                        const taxValue = salary * (tax.value / 100);
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">{tax.label}</p>
                                                    <p className="text-[10px] text-slate-400">{tax.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-rose-600 font-mono">
                                                        {formatCurrency(taxValue)}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400">{tax.value}%</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl mt-3">
                                        <span className="text-xs font-bold text-rose-700 uppercase">Total Encargos</span>
                                        <span className="text-base font-black text-rose-700">{formatCurrency(taxes)}</span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Lista de Benefícios */}
                        <Card className="p-5 bg-white border-0 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                Benefícios Ativos
                            </h3>
                            {benefitsList.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 rounded-xl">
                                    <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">Nenhum benefício vinculado</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {benefitsList.map((b: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <BadgeDollarSign className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">{b.name}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {b.type === 'FIXED' ? 'Valor Fixo' : `${b.value}% do salário`}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-emerald-600 font-mono">
                                                {formatCurrency(b.cost)}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl mt-3">
                                        <span className="text-xs font-bold text-emerald-700 uppercase">Total Benefícios</span>
                                        <span className="text-base font-black text-emerald-700">{formatCurrency(benefitsTotal)}</span>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Dados Pessoais */}
                        <Card className="p-5 bg-white border-0 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Dados Pessoais
                            </h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-slate-200/50 rounded-lg text-slate-400">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Nascimento</p>
                                        <p className="text-sm font-medium text-slate-700">
                                            {employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('pt-BR') : '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-slate-200/50 rounded-lg text-slate-400">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">CPF</p>
                                        <p className="text-sm font-medium text-slate-700">{employee.cpf || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-slate-200/50 rounded-lg text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                                        <p className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
                                            {employee.personalEmail || '—'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="p-2 bg-slate-200/50 rounded-lg text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p>
                                        <p className="text-sm font-medium text-slate-700">{employee.phone || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            {(employee.address || employee.city) && (
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl mt-3">
                                    <div className="p-2 bg-slate-200/50 rounded-lg text-slate-400 mt-0.5">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Endereço</p>
                                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                            {[employee.address, employee.number, employee.neighborhood].filter(Boolean).join(', ')}
                                            <br />
                                            {[employee.city, employee.state].filter(Boolean).join(' - ')}
                                            {employee.zipCode && ` • CEP: ${employee.zipCode}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Ações Rápidas */}
                        <Card className="p-5 bg-gradient-to-r from-slate-100 to-slate-50 border-0 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Ações Rápidas
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all group text-left">
                                    <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Ver Descrição</p>
                                        <p className="text-[10px] text-slate-400">do Cargo</p>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all group text-left">
                                    <div className="p-2.5 bg-purple-100 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Avaliar</p>
                                        <p className="text-[10px] text-slate-400">Desempenho</p>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all group text-left">
                                    <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Trilha</p>
                                        <p className="text-[10px] text-slate-400">de Carreira</p>
                                    </div>
                                </button>
                                <button className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all group text-left">
                                    <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Exportar</p>
                                        <p className="text-[10px] text-slate-400">PDF</p>
                                    </div>
                                </button>
                            </div>
                        </Card>

                        {/* Espaço extra */}
                        <div className="h-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
