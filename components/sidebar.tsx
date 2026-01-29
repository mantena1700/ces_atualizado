'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    TrendingUp,
    Calculator,
    Table,
    Settings,
    ChevronRight,
    ChevronDown,
    FileText,
    Clock,
    Import,
    Network,
    Wallet,
    Book,
    BookOpen,
    ClipboardList,
    Brain,
    Building2,
    PieChart,
    Target
} from 'lucide-react';

// Estrutura do Menu Reorganizada (Fluxo Lógico PCCS)
const menuStructure = [
    {
        section: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        label: 'Visão Geral'
    },
    {
        section: 'Estrutura & Pessoas',
        icon: Building2,
        items: [
            { href: '/organograma', icon: Network, label: 'Organograma' },
            { href: '/colaboradores', icon: Users, label: 'Colaboradores' },
            { href: '/importar', icon: Import, label: 'Importação de Dados' },
        ]
    },
    {
        section: 'Cargos & Competências',
        icon: Briefcase,
        items: [
            { href: '/cargos', icon: Target, label: 'Avaliação de Cargos' },
            { href: '/descricoes', icon: ClipboardList, label: 'Descrições de Cargos' },
            { href: '/competencias', icon: Brain, label: 'Matriz de Competências' },
            { href: '/carreira', icon: TrendingUp, label: 'Trilhas de Carreira' },
        ]
    },
    {
        section: 'Remuneração',
        icon: Wallet,
        items: [
            { href: '/matriz', icon: Calculator, label: 'Matriz Salarial' },
            { href: '/tabela', icon: Table, label: 'Tabela Oficial' },
            { href: '/orcamento', icon: PieChart, label: 'Orçamento' },
            { href: '/simulacoes', icon: FileText, label: 'Simulações de Impacto' },
        ]
    },
    {
        section: 'Avaliação de Desempenho',
        href: '/avaliacao',
        icon: Target,
        label: 'Avaliação de Desempenho'
    },
    {
        section: 'Documentação Oficial',
        icon: BookOpen,
        items: [
            { href: '/manual', icon: Book, label: 'Manual de Cargos e Salários' },
            { href: '/politica', icon: FileText, label: 'Política e Anexos' },
            { href: '/cronograma', icon: Clock, label: 'Cronograma de Implementação' },
        ]
    },
    {
        section: 'Configurações',
        href: '/configuracoes',
        icon: Settings,
        label: 'Configurações do Sistema'
    }
];

export function Sidebar() {
    const pathname = usePathname();
    // Estado para controlar quais grupos estão abertos
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        'Cargos & Competências': true // Padrão aberto
    });

    // Efeito para abrir automaticamente o grupo do item ativo
    useEffect(() => {
        menuStructure.forEach(group => {
            if (group.items) {
                const hasActive = group.items.some(item => item.href === pathname);
                if (hasActive) {
                    setOpenGroups(prev => ({ ...prev, [group.section]: true }));
                }
            }
        });
    }, [pathname]);

    const toggleGroup = (section: string) => {
        setOpenGroups(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white text-slate-600">
            {/* Logo */}
            <div className="flex h-20 items-center px-6 border-b bg-white">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                        7
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PCCS</span>
                        <span className="text-lg font-black tracking-tighter text-slate-900">
                            DOM<span className="text-blue-600">SEVEN</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                {menuStructure.map((group) => {
                    // Item Único (sem submenu)
                    if (!group.items) {
                        const isActive = pathname === group.href;
                        const Icon = group.icon;
                        return (
                            <Link
                                key={group.section}
                                href={group.href!}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-700 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-slate-400")} />
                                {group.label}
                            </Link>
                        );
                    }

                    // Grupo com Submenu
                    const isOpen = openGroups[group.section];
                    const GroupIcon = group.icon;
                    const hasActiveChild = group.items.some(item => item.href === pathname);

                    return (
                        <div key={group.section} className="space-y-1 pt-2 first:pt-0">
                            <button
                                onClick={() => toggleGroup(group.section)}
                                className={cn(
                                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50",
                                    hasActiveChild ? "text-blue-700" : "text-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <GroupIcon className={cn("h-4 w-4", hasActiveChild ? "text-blue-600" : "text-slate-400")} />
                                    <span>{group.section}</span>
                                </div>
                                <ChevronDown
                                    className={cn(
                                        "h-3 w-3 text-slate-400 transition-transform duration-200",
                                        isOpen ? "rotate-180" : ""
                                    )}
                                />
                            </button>

                            {/* Subitens */}
                            {isOpen && (
                                <div className="space-y-1 px-2 animate-in slide-in-from-top-2 duration-200">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        const ItemIcon = item.icon;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-md pl-9 pr-3 py-2 text-sm transition-colors",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-700 font-medium"
                                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                                )}
                                            >
                                                {/* <ItemIcon className={cn("h-3.5 w-3.5", isActive ? "text-blue-600" : "text-slate-400")} /> */}
                                                <span>{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer Usuário */}
            <div className="border-t p-4 bg-slate-50/50">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
                        A
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">Admin</span>
                        <span className="text-xs text-slate-500">admin@domseven.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
