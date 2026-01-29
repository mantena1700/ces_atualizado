'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    TrendingUp, Target, Award, ChevronRight,
    CheckCircle2, AlertTriangle, HelpCircle, Minus, ExternalLink
} from 'lucide-react';
import { NineBoxData, updatePotentialScore } from '@/app/actions/ninebox';
import { toast } from 'sonner';

interface Props {
    data: NineBoxData[];
}

// Configuração das 9 caixas com cores clássicas e elegantes
const BOXES = [
    {
        id: '1A',
        label: 'Enigma',
        sublabel: 'Alto Potencial • Baixo Desempenho',
        color: 'from-amber-50 to-amber-100/50',
        borderColor: 'border-amber-200',
        accentColor: 'text-amber-700',
        badgeColor: 'bg-amber-100 text-amber-800',
        icon: AlertTriangle,
        tooltip: 'Enigma representa colaboradores com alto potencial identificado mas que ainda não demonstram desempenho compatível. São casos que exigem investigação: pode haver barreiras organizacionais, falta de clareza nas expectativas, desmotivação ou desalinhamento de função. Requerem atenção especial da liderança.'
    },
    {
        id: '1B',
        label: 'Futuro Líder',
        sublabel: 'Alto Potencial • Médio Desempenho',
        color: 'from-emerald-50 to-emerald-100/50',
        borderColor: 'border-emerald-200',
        accentColor: 'text-emerald-700',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        icon: TrendingUp,
        tooltip: 'Futuro Líder identifica profissionais com alto potencial de crescimento que já demonstram desempenho sólido. São candidatos naturais para sucessão e posições de liderança. Devem receber investimento prioritário em desenvolvimento, exposição a projetos estratégicos e mentoria executiva.'
    },
    {
        id: '1C',
        label: 'Estrela',
        sublabel: 'Alto Potencial • Alto Desempenho',
        color: 'from-blue-50 to-indigo-100/50',
        borderColor: 'border-blue-300',
        accentColor: 'text-blue-700',
        badgeColor: 'bg-blue-100 text-blue-800',
        icon: Award,
        tooltip: 'Estrela representa o top 10% da organização: colaboradores que combinam alto desempenho atual com alto potencial futuro. São os talentos mais críticos e disputados no mercado. Requerem atenção constante da alta liderança, desafios estimulantes, crescimento acelerado e pacotes de retenção competitivos.'
    },
    {
        id: '2A',
        label: 'Questionável',
        sublabel: 'Médio Potencial • Baixo Desempenho',
        color: 'from-orange-50 to-orange-100/50',
        borderColor: 'border-orange-200',
        accentColor: 'text-orange-700',
        badgeColor: 'bg-orange-100 text-orange-800',
        icon: AlertTriangle,
        tooltip: 'Questionável indica colaboradores com potencial moderado que não estão entregando resultados esperados. Pode haver problemas de fit (pessoa-função ou pessoa-cultura), falta de capacitação ou questões de engajamento. Requerem avaliação criteriosa: PIP estruturado, realocação ou, em último caso, desligamento.'
    },
    {
        id: '2B',
        label: 'Mantenedor',
        sublabel: 'Médio Potencial • Médio Desempenho',
        color: 'from-slate-50 to-slate-100/50',
        borderColor: 'border-slate-200',
        accentColor: 'text-slate-700',
        badgeColor: 'bg-slate-100 text-slate-700',
        icon: Minus,
        tooltip: 'Mantenedor representa a espinha dorsal da organização: profissionais que entregam consistentemente o esperado, mantêm a operação funcionando e garantem estabilidade. Embora não sejam candidatos a crescimento acelerado, são essenciais para o negócio. Merecem reconhecimento, respeito e oportunidades de especialização horizontal.'
    },
    {
        id: '2C',
        label: 'Profissional Chave',
        sublabel: 'Médio Potencial • Alto Desempenho',
        color: 'from-teal-50 to-teal-100/50',
        borderColor: 'border-teal-200',
        accentColor: 'text-teal-700',
        badgeColor: 'bg-teal-100 text-teal-800',
        icon: CheckCircle2,
        tooltip: 'Profissional Chave identifica colaboradores de alto desempenho que são pilares da equipe, mesmo sem aspiração ou potencial para crescimento vertical significativo. São especialistas técnicos, referências em suas áreas e mentores naturais. Devem ser valorizados através de trilhas de carreira em Y (especialista) e reconhecimento por expertise.'
    },
    {
        id: '3A',
        label: 'Risco',
        sublabel: 'Baixo Potencial • Baixo Desempenho',
        color: 'from-red-50 to-red-100/50',
        borderColor: 'border-red-200',
        accentColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        tooltip: 'Risco representa a situação mais crítica: baixo desempenho combinado com baixo potencial de desenvolvimento. Requer ação imediata e decisiva. Pode indicar erro de contratação, mudança de perfil do colaborador ou desalinhamento profundo. Geralmente resulta em PIP com prazo curto ou processo de desligamento estruturado.'
    },
    {
        id: '3B',
        label: 'Eficaz',
        sublabel: 'Baixo Potencial • Médio Desempenho',
        color: 'from-yellow-50 to-yellow-100/50',
        borderColor: 'border-yellow-200',
        accentColor: 'text-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        icon: CheckCircle2,
        tooltip: 'Eficaz representa colaboradores que executam bem suas funções operacionais, entregam resultados consistentes, mas têm potencial limitado para crescimento ou mudança de função. São importantes para a operação diária e merecem reconhecimento e estabilidade na função atual, com ajustes salariais periódicos mas sem expectativa de promoção vertical.'
    },
    {
        id: '3C',
        label: 'Especialista',
        sublabel: 'Baixo Potencial • Alto Desempenho',
        color: 'from-violet-50 to-violet-100/50',
        borderColor: 'border-violet-200',
        accentColor: 'text-violet-700',
        badgeColor: 'bg-violet-100 text-violet-800',
        icon: Award,
        tooltip: 'Especialista identifica profissionais de altíssimo desempenho em suas funções específicas, mas com baixo potencial ou interesse em crescimento vertical/gerencial. São SMEs (Subject Matter Experts), referências técnicas e fontes de conhecimento crítico. Devem ser retidos através de trilhas de carreira técnica (carreira em Y) e reconhecimento como autoridades em suas áreas.'
    },
];

export function NineBoxMatrix({ data: initialData }: Props) {
    const router = useRouter();
    const [employees] = useState<NineBoxData[]>(initialData);

    const getBoxId = (finalScore: number, potentialScore: number | null) => {
        const perf = finalScore;
        const pot = potentialScore || 0;

        let row = 3;
        if (pot >= 66) row = 1;
        else if (pot >= 33) row = 2;

        let col = 'A';
        if (perf >= 4) col = 'C';
        else if (perf >= 2.5) col = 'B';

        return `${row}${col}`;
    };

    const getEmployeesInBox = (boxId: string) => {
        return employees.filter(e => getBoxId(e.finalScore, e.potentialScore) === boxId);
    };

    // Navegar para a página de detalhes
    const openDetails = (employeeId: string) => {
        router.push(`/ninebox/${employeeId}`);
    };

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex flex-col gap-6">
                {/* Matrix Container */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                    {/* Grid com Eixos */}
                    <div className="flex">
                        {/* Eixo Y - Potencial */}
                        <div className="w-12 lg:w-16 bg-slate-50 border-r border-slate-200 flex flex-col justify-center items-center py-8 shrink-0">
                            <div className="-rotate-90 whitespace-nowrap font-semibold text-slate-500 uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Potencial</span>
                            </div>
                        </div>

                        {/* Grid Content */}
                        <div className="flex-1 p-4 lg:p-6">
                            <div className="grid grid-cols-3 gap-3 lg:gap-4">
                                {BOXES.map((box) => {
                                    const BoxIcon = box.icon;
                                    const employeesInBox = getEmployeesInBox(box.id);

                                    return (
                                        <div
                                            key={box.id}
                                            className={`
                                                relative flex flex-col rounded-xl border overflow-hidden transition-all duration-200
                                                bg-gradient-to-br ${box.color} ${box.borderColor}
                                                hover:shadow-lg hover:scale-[1.01]
                                            `}
                                            style={{ minHeight: '180px' }}
                                        >
                                            {/* Header com Tooltip */}
                                            <div className="px-3 lg:px-4 py-3 border-b border-inherit bg-white/60 backdrop-blur-sm group/header">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <BoxIcon className={`w-4 h-4 ${box.accentColor} shrink-0`} />
                                                            <h3 className={`font-bold text-sm ${box.accentColor} truncate`}>
                                                                {box.label}
                                                            </h3>
                                                            {/* Tooltip no ícone de ajuda */}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        className="opacity-0 group-hover/header:opacity-100 transition-opacity shrink-0 hover:scale-110 active:scale-95"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent
                                                                    side="top"
                                                                    className="max-w-xs p-4 bg-slate-900 text-white border-slate-700"
                                                                >
                                                                    <p className="text-xs font-semibold mb-2">{box.label}</p>
                                                                    <p className="text-xs leading-relaxed opacity-90">
                                                                        {box.tooltip}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 mt-0.5 hidden lg:block">
                                                            {box.sublabel}
                                                        </p>
                                                    </div>
                                                    <Badge className={`${box.badgeColor} border-0 text-xs font-bold px-2 shrink-0`}>
                                                        {employeesInBox.length}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Lista de Colaboradores */}
                                            <div className="flex-1 p-2 lg:p-3 space-y-2 overflow-y-auto custom-scrollbar">
                                                {employeesInBox.map(emp => (
                                                    <motion.div
                                                        key={emp.id}
                                                        layoutId={emp.id}
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        onClick={() => openDetails(emp.id)}
                                                        className="
                                                            bg-white rounded-lg p-2.5 shadow-sm border border-slate-100/80
                                                            cursor-pointer group hover:shadow-md hover:border-slate-200 
                                                            transition-all active:scale-[0.98]
                                                        "
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar className="w-7 h-7 border border-white shadow-sm shrink-0">
                                                                <AvatarImage src={emp.photo} />
                                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-[9px]">
                                                                    {emp.employeeName.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
                                                                    {emp.employeeName}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[9px] text-slate-400">
                                                                        {emp.finalScore.toFixed(1)}
                                                                    </span>
                                                                    <span className="text-[8px] text-slate-300">•</span>
                                                                    <span className="text-[9px] text-slate-400 truncate">
                                                                        {emp.jobTitle}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Eixo X - Desempenho */}
                    <div className="h-10 bg-slate-50 border-t border-slate-200 flex items-center justify-center">
                        <div className="font-semibold text-slate-500 uppercase tracking-[0.2em] text-[11px] flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" />
                            <span>Desempenho</span>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
