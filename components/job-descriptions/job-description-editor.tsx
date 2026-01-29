'use client';

import { useState } from 'react';
import { JobDescriptionDTO, saveJobDescription, updateDescriptionStatus } from '@/app/actions/job-descriptions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CompetenciesSection } from '@/components/competencies/competency-card';
import {
    ArrowLeft, Save, Send, CheckCircle2, Printer, FileText,
    Building2, Users, Award, Briefcase, GraduationCap, Target,
    ClipboardList, MessageSquare, Clock, MapPin, Plane,
    User, ChevronDown, ChevronRight, Edit2, Eye, Brain
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CompetencyItem {
    id: string;
    name: string;
    category: string;
    critical?: boolean;
    levelNumber: number;
    levelName: string;
    required?: boolean;
    weight?: number;
}

interface JobDescriptionEditorProps {
    data: JobDescriptionDTO;
    competencies?: CompetencyItem[];
}

const statusConfig = {
    'APPROVED': { label: 'Aprovado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    'REVIEW': { label: 'Em Revisão', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    'DRAFT': { label: 'Rascunho', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText }
};

export function JobDescriptionEditor({ data, competencies = [] }: JobDescriptionEditorProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(!data.id); // Se não existe, inicia em modo edição
    const [loading, setLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['summary', 'requirements', 'responsibilities', 'context', 'conditions'])
    );

    // Form state
    const [form, setForm] = useState({
        summary: data.summary || '',
        objective: data.objective || '',
        education: data.education || '',
        experience: data.experience || '',
        certifications: data.certifications || '',
        technicalSkills: data.technicalSkills || '',
        softSkills: data.softSkills || '',
        languages: data.languages || '',
        responsibilities: data.responsibilities || '',
        activities: data.activities || '',
        kpis: data.kpis || '',
        subordinatesDesc: data.subordinatesDesc || '',
        interactions: data.interactions || '',
        decisions: data.decisions || '',
        workRegime: data.workRegime || '',
        workHours: data.workHours || '',
        travelRequired: data.travelRequired || '',
        physicalDemands: data.physicalDemands || ''
    });

    const toggleSection = (id: string) => {
        const newSet = new Set(expandedSections);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedSections(newSet);
    };

    const handleSave = async () => {
        setLoading(true);
        const result = await saveJobDescription(data.jobRoleId, form);
        if (result.success) {
            setIsEditing(false);
            router.refresh();
        } else {
            alert('Erro ao salvar: ' + result.error);
        }
        setLoading(false);
    };

    const handleStatusChange = async (status: 'DRAFT' | 'REVIEW' | 'APPROVED') => {
        const result = await updateDescriptionStatus(data.jobRoleId, status, 'Admin');
        if (result.success) {
            router.refresh();
        } else {
            alert('Erro ao atualizar status: ' + result.error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const SectionHeader = ({ id, icon: Icon, title }: { id: string; icon: any; title: string }) => (
        <button
            onClick={() => toggleSection(id)}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-blue-50 hover:to-white transition-all border-b"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800">{title}</h3>
            </div>
            {expandedSections.has(id) ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
                <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
        </button>
    );

    const TextArea = ({
        label,
        value,
        onChange,
        placeholder,
        rows = 4
    }: {
        label: string;
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
        rows?: number;
    }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">{label}</Label>
            {isEditing ? (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={rows}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap min-h-[60px]">
                    {value || <span className="text-slate-400 italic">Não informado</span>}
                </div>
            )}
        </div>
    );

    const statusInfo = statusConfig[data.status as keyof typeof statusConfig] || statusConfig['DRAFT'];
    const StatusIcon = statusInfo.icon;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 print:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/descricoes">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Descrição de Cargo</h1>
                        <p className="text-sm text-slate-500">{data.jobRole.title}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? 'Salvando...' : 'Salvar'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimir
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Editar
                            </Button>
                            {data.status === 'DRAFT' && (
                                <Button
                                    className="bg-amber-500 hover:bg-amber-600"
                                    onClick={() => handleStatusChange('REVIEW')}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar para Revisão
                                </Button>
                            )}
                            {data.status === 'REVIEW' && (
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => handleStatusChange('APPROVED')}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Aprovar
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Cabeçalho do Documento */}
            <Card className="overflow-hidden border-none shadow-2xl print:shadow-none print:border print:border-slate-200">
                {/* Título */}
                <div className="p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white print:bg-white print:text-slate-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-blue-200 text-sm mb-2 print:text-slate-500">
                                <Building2 className="w-4 h-4" />
                                {data.jobRole.department || 'Sem Departamento'}
                                {data.jobRole.area && ` • ${data.jobRole.area}`}
                            </div>
                            <h1 className="text-3xl font-black tracking-tight mb-2">{data.jobRole.title}</h1>
                            <p className="text-blue-200 print:text-slate-600">
                                {data.jobRole.cbo && `CBO: ${data.jobRole.cbo}`}
                            </p>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase border ${statusInfo.color} print:bg-slate-100`}>
                            <span className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200">
                    <div className="p-4 bg-white text-center">
                        <Award className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Grade</p>
                        <p className="font-bold text-slate-800">{data.jobRole.grade?.name || '-'}</p>
                    </div>
                    <div className="p-4 bg-white text-center">
                        <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Pontuação</p>
                        <p className="font-bold text-slate-800">{data.jobRole.totalPoints} pts</p>
                    </div>
                    <div className="p-4 bg-white text-center">
                        <Users className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Ocupantes</p>
                        <p className="font-bold text-slate-800">{data.jobRole.employees.length}</p>
                    </div>
                    <div className="p-4 bg-white text-center">
                        <User className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Reporta a</p>
                        <p className="font-bold text-slate-800 text-sm">{data.jobRole.reportsTo?.title || 'Diretoria'}</p>
                    </div>
                </div>
            </Card>

            {/* Seções do Documento */}
            <Card className="overflow-hidden border-none shadow-xl print:shadow-none print:border">
                {/* Sumário */}
                <SectionHeader id="summary" icon={FileText} title="Sumário e Objetivo" />
                {expandedSections.has('summary') && (
                    <div className="p-6 space-y-6">
                        <TextArea
                            label="Resumo do Cargo"
                            value={form.summary}
                            onChange={v => setForm({ ...form, summary: v })}
                            placeholder="Descreva em 1-2 parágrafos o que este cargo faz..."
                            rows={3}
                        />
                        <TextArea
                            label="Objetivo / Missão"
                            value={form.objective}
                            onChange={v => setForm({ ...form, objective: v })}
                            placeholder="Qual é o objetivo principal deste cargo?"
                            rows={2}
                        />
                    </div>
                )}

                {/* Requisitos */}
                <SectionHeader id="requirements" icon={GraduationCap} title="Requisitos e Competências" />
                {expandedSections.has('requirements') && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextArea
                                label="Escolaridade Mínima"
                                value={form.education}
                                onChange={v => setForm({ ...form, education: v })}
                                placeholder="Ex: Ensino Superior em Administração"
                                rows={2}
                            />
                            <TextArea
                                label="Experiência Mínima"
                                value={form.experience}
                                onChange={v => setForm({ ...form, experience: v })}
                                placeholder="Ex: 3 anos em cargos similares"
                                rows={2}
                            />
                        </div>
                        <TextArea
                            label="Certificações Obrigatórias"
                            value={form.certifications}
                            onChange={v => setForm({ ...form, certifications: v })}
                            placeholder="Ex: CPA-20, PMP, etc."
                            rows={2}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextArea
                                label="Habilidades Técnicas"
                                value={form.technicalSkills}
                                onChange={v => setForm({ ...form, technicalSkills: v })}
                                placeholder="• Excel avançado&#10;• Conhecimento em SAP&#10;• Programação Python"
                            />
                            <TextArea
                                label="Habilidades Comportamentais"
                                value={form.softSkills}
                                onChange={v => setForm({ ...form, softSkills: v })}
                                placeholder="• Comunicação&#10;• Liderança&#10;• Resolução de problemas"
                            />
                        </div>
                        <TextArea
                            label="Idiomas"
                            value={form.languages}
                            onChange={v => setForm({ ...form, languages: v })}
                            placeholder="Ex: Inglês avançado, Espanhol intermediário"
                            rows={2}
                        />
                    </div>
                )}

                {/* Responsabilidades */}
                <SectionHeader id="responsibilities" icon={ClipboardList} title="Responsabilidades e Atividades" />
                {expandedSections.has('responsibilities') && (
                    <div className="p-6 space-y-6">
                        <TextArea
                            label="Principais Responsabilidades"
                            value={form.responsibilities}
                            onChange={v => setForm({ ...form, responsibilities: v })}
                            placeholder="• Responsabilidade 1&#10;• Responsabilidade 2&#10;• Responsabilidade 3"
                            rows={6}
                        />
                        <TextArea
                            label="Atividades do Dia a Dia"
                            value={form.activities}
                            onChange={v => setForm({ ...form, activities: v })}
                            placeholder="Descreva as atividades rotineiras..."
                            rows={4}
                        />
                        <TextArea
                            label="Indicadores de Desempenho (KPIs)"
                            value={form.kpis}
                            onChange={v => setForm({ ...form, kpis: v })}
                            placeholder="• KPI 1&#10;• KPI 2&#10;• KPI 3"
                            rows={3}
                        />
                    </div>
                )}

                {/* Contexto Organizacional */}
                <SectionHeader id="context" icon={MessageSquare} title="Contexto Organizacional" />
                {expandedSections.has('context') && (
                    <div className="p-6 space-y-6">
                        <TextArea
                            label="Subordinados Diretos"
                            value={form.subordinatesDesc}
                            onChange={v => setForm({ ...form, subordinatesDesc: v })}
                            placeholder="Descreva a equipe sob responsabilidade..."
                            rows={2}
                        />
                        <TextArea
                            label="Interações (Internas e Externas)"
                            value={form.interactions}
                            onChange={v => setForm({ ...form, interactions: v })}
                            placeholder="Com quem este cargo interage regularmente?"
                            rows={3}
                        />
                        <TextArea
                            label="Nível de Autonomia e Decisões"
                            value={form.decisions}
                            onChange={v => setForm({ ...form, decisions: v })}
                            placeholder="Qual o nível de autonomia para tomada de decisões?"
                            rows={2}
                        />
                    </div>
                )}

                {/* Condições de Trabalho */}
                <SectionHeader id="conditions" icon={MapPin} title="Condições de Trabalho" />
                {expandedSections.has('conditions') && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextArea
                                label="Regime de Trabalho"
                                value={form.workRegime}
                                onChange={v => setForm({ ...form, workRegime: v })}
                                placeholder="Presencial, Híbrido ou Remoto"
                                rows={2}
                            />
                            <TextArea
                                label="Horário de Trabalho"
                                value={form.workHours}
                                onChange={v => setForm({ ...form, workHours: v })}
                                placeholder="Ex: Segunda a Sexta, 08h às 17h"
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextArea
                                label="Viagens"
                                value={form.travelRequired}
                                onChange={v => setForm({ ...form, travelRequired: v })}
                                placeholder="Frequência e tipo de viagens necessárias"
                                rows={2}
                            />
                            <TextArea
                                label="Demandas Físicas"
                                value={form.physicalDemands}
                                onChange={v => setForm({ ...form, physicalDemands: v })}
                                placeholder="Se aplicável, descreva as demandas físicas"
                                rows={2}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Metadados */}
            <Card className="p-4 border-none shadow-lg bg-slate-50 print:hidden">
                <div className="flex flex-wrap gap-6 text-sm text-slate-500">
                    <div>
                        <span className="font-medium">Versão:</span> {data.version}
                    </div>
                    <div>
                        <span className="font-medium">Atualizado:</span> {new Date(data.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                    {data.approvedBy && (
                        <div>
                            <span className="font-medium">Aprovado por:</span> {data.approvedBy}
                        </div>
                    )}
                    {data.approvedAt && (
                        <div>
                            <span className="font-medium">Data aprovação:</span> {new Date(data.approvedAt).toLocaleDateString('pt-BR')}
                        </div>
                    )}
                </div>
            </Card>

            {/* Lista de ocupantes */}
            {data.jobRole.employees.length > 0 && (
                <Card className="overflow-hidden border-none shadow-lg print:hidden">
                    <div className="p-4 bg-slate-50 border-b flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-slate-700">Ocupantes Atuais ({data.jobRole.employees.length})</h3>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {data.jobRole.employees.map(emp => (
                                <span key={emp.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {emp.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Seção de Competências - INTEGRAÇÃO */}
            <Card className="overflow-hidden border-none shadow-lg">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Brain className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Matriz de Competências</h3>
                        <p className="text-xs text-slate-500">Competências exigidas para este cargo</p>
                    </div>
                </div>
                <div className="p-6">
                    <CompetenciesSection
                        competencies={competencies}
                        jobRoleId={data.jobRoleId}
                        editable={true}
                    />
                </div>
            </Card>
        </div>
    );
}
