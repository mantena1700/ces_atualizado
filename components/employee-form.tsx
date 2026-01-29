'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createEmployee, updateEmployee, deleteEmployee, getEmployees } from "@/app/actions/employees";
import { getJobRoles } from '@/app/actions/jobs';
import { getBenefits } from '@/app/actions/benefits';
import {
    X, User, MapPin, Briefcase, Trash2, Save, Phone, Calendar,
    CreditCard, ShieldCheck, Gift, Landmark, Mail, Building2,
    GraduationCap, BadgeCheck, Clock, DollarSign, FileText,
    ChevronRight, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EmployeeFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function EmployeeForm({ onClose, onSuccess, initialData }: EmployeeFormProps) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [availableBenefits, setAvailableBenefits] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("pessoal");
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form State - Pessoal
    const [name, setName] = useState(initialData?.name || '');
    const [cpf, setCpf] = useState(initialData?.cpf || '');
    const [birthDate, setBirthDate] = useState(initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [personalEmail, setPersonalEmail] = useState(initialData?.personalEmail || '');
    const [rg, setRg] = useState(initialData?.rg || '');
    const [pis, setPis] = useState(initialData?.pis || '');

    // Form State - Endereço
    const [zipCode, setZipCode] = useState(initialData?.zipCode || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [number, setNumber] = useState(initialData?.number || '');
    const [complement, setComplement] = useState(initialData?.complement || '');
    const [neighborhood, setNeighborhood] = useState(initialData?.neighborhood || '');
    const [city, setCity] = useState(initialData?.city || '');
    const [state, setState] = useState(initialData?.state || '');

    // Form State - Contrato / Financeiro
    const [salary, setSalary] = useState(initialData?.salary?.toString() || '');
    const [jobRoleId, setJobRoleId] = useState(initialData?.jobRoleId || '');
    const [managerId, setManagerId] = useState(initialData?.managerId || '');
    const [hiringType, setHiringType] = useState(initialData?.hiringType || 'CLT');
    const [benefitIds, setBenefitIds] = useState<string[]>(initialData?.benefits?.map((b: any) => b.benefitId) || []);
    const [admissionDate, setAdmissionDate] = useState(initialData?.admissionDate ? new Date(initialData.admissionDate).toISOString().split('T')[0] : '');
    const [workSchedule, setWorkSchedule] = useState(initialData?.workSchedule || '08:00 - 18:00');
    const [bankName, setBankName] = useState(initialData?.bankName || '');
    const [bankAgency, setBankAgency] = useState(initialData?.bankAgency || '');
    const [bankAccount, setBankAccount] = useState(initialData?.bankAccount || '');

    // Form State - Acadêmico
    const [education, setEducation] = useState(initialData?.education || '');
    const [graduationYear, setGraduationYear] = useState(initialData?.graduationYear || '');
    const [course, setCourse] = useState(initialData?.course || '');

    useEffect(() => {
        getJobRoles().then(setRoles);
        getBenefits().then(setAvailableBenefits);
        getEmployees().then(emps => {
            // Filtrar o próprio funcionário se estiver editando para evitar ciclo
            if (initialData?.id) {
                setManagers(emps.filter(e => e.id !== initialData.id));
            } else {
                setManagers(emps);
            }
        });
    }, [initialData]);

    const toggleBenefit = (id: string) => {
        setBenefitIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            name,
            salary: parseFloat(salary),
            jobRoleId: jobRoleId || null,
            hiringType,
            benefitIds,
            cpf: cpf || undefined,
            birthDate: birthDate ? birthDate : undefined,
            personalEmail: personalEmail || undefined,
            phone: phone || undefined,
            zipCode: zipCode || undefined,
            address: address || undefined,
            number: number || undefined,
            complement: complement || undefined,
            neighborhood: neighborhood || undefined,
            city: city || undefined,
            state: state || undefined,
            managerId: managerId || null,
            admissionDate: admissionDate ? admissionDate : undefined
        };

        let result;
        if (initialData?.id) {
            result = await updateEmployee(initialData.id, payload);
        } else {
            result = await createEmployee(payload);
        }

        setLoading(false);

        if (result?.success) {
            setSaveSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 1000);
        } else {
            alert(`Erro ao salvar: ${result?.error || 'Erro desconhecido'}`);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        if (confirm("Tem certeza que deseja remover este colaborador? Esta ação não pode ser desfeita.")) {
            setLoading(true);
            await deleteEmployee(initialData.id);
            setLoading(false);
            onSuccess();
        }
    };

    // Tabs info
    const tabs = [
        { id: 'pessoal', label: 'Dados Pessoais', icon: User },
        { id: 'endereco', label: 'Endereço', icon: MapPin },
        { id: 'contrato', label: 'Contrato', icon: Briefcase },
        { id: 'academico', label: 'Acadêmico', icon: GraduationCap },
    ];

    const selectedRole = roles.find(r => r.id === jobRoleId);

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[3px] animate-in fade-in duration-200">
            <Card className="h-full w-full max-w-2xl rounded-l-3xl rounded-r-none border-l shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col bg-white overflow-hidden border-none">

                {/* Header Premium com Gradiente */}
                <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 pb-24 text-white shrink-0 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-100 uppercase tracking-widest text-[10px] font-bold">
                            <Landmark className="w-4 h-4" />
                            {initialData ? 'Editar Colaborador' : 'Novo Colaborador'}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full h-9 w-9"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Avatar e Info Rápida */}
                <div className="px-8 -mt-16 mb-4 flex items-end justify-between shrink-0 relative z-10">
                    <div className="flex items-end gap-5">
                        <div className="h-24 w-24 rounded-2xl bg-white p-1.5 shadow-2xl">
                            <div className="h-full w-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                {name ? (
                                    <span className="text-4xl font-black text-blue-600">{name.charAt(0)}</span>
                                ) : (
                                    <User className="w-10 h-10 text-blue-300" />
                                )}
                            </div>
                        </div>
                        <div className="mb-2">
                            <h1 className="text-2xl font-bold text-slate-900 leading-none">
                                {name || 'Novo Colaborador'}
                            </h1>
                            <p className="text-sm font-semibold text-blue-600 mt-1">
                                {selectedRole?.title || 'Cargo não definido'}
                            </p>
                            {selectedRole?.department && (
                                <p className="text-xs text-slate-500 mt-0.5">{selectedRole.department}</p>
                            )}
                        </div>
                    </div>

                    {salary && (
                        <div className="mb-2 text-right">
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Salário Base</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(salary))}
                            </p>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Tab Navigation */}
                        <div className="border-b px-8 sticky top-0 bg-white/95 backdrop-blur z-10">
                            <TabsList className="w-full justify-start h-14 bg-transparent p-0 gap-6">
                                {tabs.map(tab => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className={cn(
                                            "flex items-center gap-2 h-full px-1 pb-3 border-b-2 border-transparent",
                                            "text-xs font-bold uppercase tracking-wider transition-all",
                                            "data-[state=active]:border-blue-600 data-[state=active]:text-blue-600",
                                            "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <form id="emp-form" onSubmit={handleSubmit} className="p-8 space-y-8 pb-32">

                            {/* DADOS PESSOAIS */}
                            <TabsContent value="pessoal" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                            Nome Completo *
                                        </Label>
                                        <Input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="h-12 border-slate-200 focus:border-blue-500"
                                            placeholder="Digite o nome completo"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">CPF</Label>
                                            <Input
                                                value={cpf}
                                                onChange={e => setCpf(e.target.value)}
                                                placeholder="000.000.000-00"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">RG</Label>
                                            <Input
                                                value={rg}
                                                onChange={e => setRg(e.target.value)}
                                                placeholder="00.000.000-0"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                Data de Nascimento
                                            </Label>
                                            <Input
                                                type="date"
                                                value={birthDate}
                                                onChange={e => setBirthDate(e.target.value)}
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">PIS/PASEP</Label>
                                            <Input
                                                value={pis}
                                                onChange={e => setPis(e.target.value)}
                                                placeholder="000.00000.00-0"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                                <Phone className="w-3 h-3 inline mr-1" />
                                                Telefone
                                            </Label>
                                            <Input
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                placeholder="(00) 00000-0000"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                                <Mail className="w-3 h-3 inline mr-1" />
                                                E-mail Pessoal
                                            </Label>
                                            <Input
                                                type="email"
                                                value={personalEmail}
                                                onChange={e => setPersonalEmail(e.target.value)}
                                                placeholder="email@exemplo.com"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ENDEREÇO */}
                            <TabsContent value="endereco" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1 space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">CEP</Label>
                                            <Input
                                                value={zipCode}
                                                onChange={e => setZipCode(e.target.value)}
                                                placeholder="00000-000"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Logradouro</Label>
                                            <Input
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                placeholder="Rua, Avenida..."
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div className="md:col-span-1 space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Número</Label>
                                            <Input
                                                value={number}
                                                onChange={e => setNumber(e.target.value)}
                                                placeholder="Nº"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="md:col-span-3 space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Complemento</Label>
                                            <Input
                                                value={complement}
                                                onChange={e => setComplement(e.target.value)}
                                                placeholder="Apto, Bloco..."
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Bairro</Label>
                                            <Input
                                                value={neighborhood}
                                                onChange={e => setNeighborhood(e.target.value)}
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Cidade</Label>
                                            <Input
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">UF</Label>
                                            <Input
                                                value={state}
                                                onChange={e => setState(e.target.value)}
                                                className="h-12 border-slate-200 uppercase"
                                                maxLength={2}
                                                placeholder="SP"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* CONTRATO / FINANCEIRO */}
                            <TabsContent value="contrato" className="space-y-8 mt-0">
                                {/* Regime de Contratação */}
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase font-semibold text-blue-600 tracking-wide flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" />
                                        Regime de Contratação
                                    </Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'CLT', label: 'CLT', desc: 'Consolidação das Leis do Trabalho', icon: ShieldCheck },
                                            { id: 'PJ', label: 'PJ', desc: 'Pessoa Jurídica', icon: Building2 }
                                        ].map(regime => (
                                            <div
                                                key={regime.id}
                                                className={cn(
                                                    "p-4 border-2 rounded-xl cursor-pointer transition-all flex items-center gap-4",
                                                    hiringType === regime.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                                onClick={() => setHiringType(regime.id)}
                                            >
                                                <div className={cn(
                                                    "p-3 rounded-xl",
                                                    hiringType === regime.id ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    <regime.icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <span className={cn(
                                                        "font-bold text-sm block",
                                                        hiringType === regime.id ? "text-blue-700" : "text-slate-600"
                                                    )}>{regime.label}</span>
                                                    <span className="text-xs text-slate-400">{regime.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cargo e Salário */}
                                <div className="space-y-4 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                                    <Label className="text-xs uppercase font-semibold text-emerald-700 tracking-wide flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Cargo e Remuneração
                                    </Label>

                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Cargo Oficial</Label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-emerald-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            value={jobRoleId}
                                            onChange={e => setJobRoleId(e.target.value)}
                                        >
                                            <option value="">Selecione um cargo...</option>
                                            {roles.map(r => (
                                                <option key={r.id} value={r.id}>
                                                    {r.title} {r.grade?.name ? `(${r.grade.name})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Gestor Responsável</Label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-emerald-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            value={managerId}
                                            onChange={e => setManagerId(e.target.value)}
                                        >
                                            <option value="">Sem gestor (Diretoria/Presidência)</option>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} {m.jobRole ? `- ${m.jobRole.title}` : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                                Salário Base (R$) *
                                            </Label>
                                            <Input
                                                type="number"
                                                value={salary}
                                                onChange={e => setSalary(e.target.value)}
                                                className="h-12 border-emerald-200 bg-white text-emerald-700 font-bold text-lg"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                Data de Admissão
                                            </Label>
                                            <Input
                                                type="date"
                                                value={admissionDate}
                                                onChange={e => setAdmissionDate(e.target.value)}
                                                className="h-12 border-emerald-200 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Benefícios */}
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase font-semibold text-purple-600 tracking-wide flex items-center gap-2">
                                        <Gift className="w-4 h-4" />
                                        Pacote de Benefícios
                                    </Label>

                                    {availableBenefits.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {availableBenefits.map(benefit => (
                                                <div
                                                    key={benefit.id}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 transition-all cursor-pointer",
                                                        benefitIds.includes(benefit.id)
                                                            ? "border-purple-500 bg-purple-50 shadow-sm"
                                                            : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                                                    )}
                                                    onClick={() => toggleBenefit(benefit.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-sm font-bold text-slate-700 block">{benefit.name}</span>
                                                            <span className="text-xs text-purple-600 font-semibold">
                                                                {benefit.type === 'FIXED'
                                                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(benefit.value)
                                                                    : `${benefit.value}%`
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                                            benefitIds.includes(benefit.id)
                                                                ? "bg-purple-600 border-purple-600"
                                                                : "border-slate-300"
                                                        )}>
                                                            {benefitIds.includes(benefit.id) && (
                                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-50 rounded-xl text-center">
                                            <Gift className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">Nenhum benefício cadastrado</p>
                                        </div>
                                    )}
                                </div>

                                {/* Dados Bancários */}
                                <div className="space-y-4">
                                    <Label className="text-xs uppercase font-semibold text-slate-600 tracking-wide flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Dados Bancários
                                    </Label>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Banco</Label>
                                            <Input
                                                value={bankName}
                                                onChange={e => setBankName(e.target.value)}
                                                placeholder="Ex: Itaú"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Agência</Label>
                                            <Input
                                                value={bankAgency}
                                                onChange={e => setBankAgency(e.target.value)}
                                                placeholder="0000"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Conta</Label>
                                            <Input
                                                value={bankAccount}
                                                onChange={e => setBankAccount(e.target.value)}
                                                placeholder="00000-0"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ACADÊMICO */}
                            <TabsContent value="academico" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
                                            <GraduationCap className="w-3 h-3 inline mr-1" />
                                            Nível de Escolaridade
                                        </Label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-blue-500"
                                            value={education}
                                            onChange={e => setEducation(e.target.value)}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="fundamental">Ensino Fundamental</option>
                                            <option value="medio">Ensino Médio</option>
                                            <option value="tecnico">Técnico</option>
                                            <option value="superior">Ensino Superior</option>
                                            <option value="pos">Pós-Graduação</option>
                                            <option value="mestrado">Mestrado</option>
                                            <option value="doutorado">Doutorado</option>
                                        </select>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Curso / Formação</Label>
                                            <Input
                                                value={course}
                                                onChange={e => setCourse(e.target.value)}
                                                placeholder="Ex: Administração"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-semibold text-slate-500 tracking-wide">Ano de Conclusão</Label>
                                            <Input
                                                type="number"
                                                value={graduationYear}
                                                onChange={e => setGraduationYear(e.target.value)}
                                                placeholder="2020"
                                                className="h-12 border-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </form>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex items-center justify-between bg-slate-50/80 backdrop-blur-sm shrink-0">
                    {initialData?.id ? (
                        <Button
                            variant="ghost"
                            className="text-rose-500 font-semibold hover:bg-rose-50 hover:text-rose-600"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover Colaborador
                        </Button>
                    ) : <div />}

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="font-semibold" disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('emp-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                            }}
                            disabled={loading || saveSuccess}
                            className={cn(
                                "font-bold px-8 shadow-lg",
                                saveSuccess
                                    ? "bg-emerald-600 hover:bg-emerald-600"
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : saveSuccess ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Salvo!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {initialData ? 'Salvar Alterações' : 'Cadastrar'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
