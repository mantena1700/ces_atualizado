'use client';

import { useState } from 'react';
import { CompetencyListItem, createCompetency, deleteCompetency, generateDefaultCompetencies, CompetencyMatrixOverview } from '@/app/actions/competencies';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GenerateCompetenciesButton } from './generate-competencies-button';
import {
    Search, Plus, Brain, Users, Building2, Star, Trash2, Eye,
    Sparkles, Code, Heart, Target, BarChart3, Edit2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CompetenciesListProps {
    items: CompetencyListItem[];
    stats: CompetencyMatrixOverview;
}

const categoryConfig = {
    'TECHNICAL': { label: 'Técnica', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Code },
    'BEHAVIORAL': { label: 'Comportamental', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Heart },
    'ORGANIZATIONAL': { label: 'Organizacional', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Building2 }
};

export function CompetenciesList({ items, stats }: CompetenciesListProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newCompetency, setNewCompetency] = useState({
        name: '',
        description: '',
        category: 'TECHNICAL',
        critical: false
    });

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Agrupar por categoria
    const groupedByCategory = filteredItems.reduce((acc, item) => {
        const cat = item.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, CompetencyListItem[]>);

    const handleCreate = async () => {
        if (!newCompetency.name.trim()) return;
        setLoading(true);
        const result = await createCompetency(newCompetency);
        if (result.success) {
            setIsCreating(false);
            setNewCompetency({ name: '', description: '', category: 'TECHNICAL', critical: false });
            router.refresh();
        } else {
            alert('Erro: ' + result.error);
        }
        setLoading(false);
    };

    const handleGenerateDefaults = async () => {
        if (!confirm('Isso adicionará as competências padrão (não duplica as existentes). Continuar?')) return;
        setLoading(true);
        const result = await generateDefaultCompetencies();
        if (result.success) {
            if (result.created > 0) {
                alert(`✅ ${result.created} competências criadas com sucesso!`);
            } else {
                alert('Todas as competências padrão já existem.');
            }
            router.refresh();
        } else {
            alert('Erro: ' + result.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Excluir a competência "${name}"? Isso removerá de todos os cargos.`)) return;
        const result = await deleteCompetency(id);
        if (result.success) {
            router.refresh();
        } else {
            alert('Erro: ' + result.error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-5 h-5 text-indigo-200" />
                        <span className="text-sm text-indigo-100 font-medium">Total</span>
                    </div>
                    <p className="text-3xl font-black">{stats.totalCompetencies}</p>
                    <p className="text-xs text-indigo-200 mt-1">competências</p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Code className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-slate-500 font-medium">Técnicas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.byCategory.technical}</p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Heart className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-slate-500 font-medium">Comportamentais</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.byCategory.behavioral}</p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-amber-500" />
                        <span className="text-sm text-slate-500 font-medium">Organizacionais</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.byCategory.organizational}</p>
                </Card>

                <Card className="p-5 bg-white border-none shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-rose-500" />
                        <span className="text-sm text-slate-500 font-medium">Críticas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.criticalCount}</p>
                </Card>
            </div>

            {/* Cobertura da Matriz */}
            <Card className="p-6 border-none shadow-lg bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                            Cobertura da Matriz
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            {stats.rolesWithCompetencies} de {stats.totalRoles} cargos têm competências mapeadas
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-indigo-600">
                            {stats.totalRoles > 0 ? Math.round((stats.rolesWithCompetencies / stats.totalRoles) * 100) : 0}%
                        </p>
                        <p className="text-xs text-slate-500">cobertura</p>
                    </div>
                </div>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                        style={{ width: `${stats.totalRoles > 0 ? (stats.rolesWithCompetencies / stats.totalRoles) * 100 : 0}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                    Média de {stats.avgCompetenciesPerRole} competências por cargo
                </p>
            </Card>

            {/* Barra de Ações */}
            <Card className="p-4 border-none shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Buscar competência..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                        >
                            <option value="all">Todas as Categorias</option>
                            <option value="TECHNICAL">Técnicas</option>
                            <option value="BEHAVIORAL">Comportamentais</option>
                            <option value="ORGANIZATIONAL">Organizacionais</option>
                        </select>

                        <Button
                            variant="outline"
                            onClick={handleGenerateDefaults}
                            disabled={loading}
                            title="Adiciona 12 competências padrão para uso com IA"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            + Padrões
                        </Button>

                        <Dialog open={isCreating} onOpenChange={setIsCreating}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Competência
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Nova Competência</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label>Nome</Label>
                                        <Input
                                            value={newCompetency.name}
                                            onChange={e => setNewCompetency({ ...newCompetency, name: e.target.value })}
                                            placeholder="Ex: Liderança"
                                        />
                                    </div>
                                    <div>
                                        <Label>Descrição</Label>
                                        <textarea
                                            value={newCompetency.description}
                                            onChange={e => setNewCompetency({ ...newCompetency, description: e.target.value })}
                                            placeholder="Descreva a competência..."
                                            className="w-full px-3 py-2 border rounded-md text-sm"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Categoria</Label>
                                        <select
                                            value={newCompetency.category}
                                            onChange={e => setNewCompetency({ ...newCompetency, category: e.target.value })}
                                            className="w-full h-10 px-3 border rounded-md"
                                        >
                                            <option value="TECHNICAL">Técnica</option>
                                            <option value="BEHAVIORAL">Comportamental</option>
                                            <option value="ORGANIZATIONAL">Organizacional</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={newCompetency.critical}
                                            onChange={e => setNewCompetency({ ...newCompetency, critical: e.target.checked })}
                                            className="rounded"
                                        />
                                        <Label className="!mb-0">Competência Crítica</Label>
                                    </div>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={loading || !newCompetency.name.trim()}
                                        className="w-full"
                                    >
                                        {loading ? 'Criando...' : 'Criar Competência'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </Card>

            {/* Lista por Categoria */}
            {Object.entries(groupedByCategory).map(([cat, comps]) => {
                const catConfig = categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig['TECHNICAL'];
                const CatIcon = catConfig.icon;

                return (
                    <div key={cat} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <CatIcon className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-700">{catConfig.label}</h3>
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                {comps.length} competências
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {comps.map(comp => (
                                <Card key={comp.id} className="p-5 border-none shadow-lg hover:shadow-xl transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${catConfig.color.split(' ')[0]}`}>
                                                <CatIcon className={`w-5 h-5 ${catConfig.color.split(' ')[1]}`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {comp.name}
                                                    {comp.critical && (
                                                        <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                                                    )}
                                                </h4>
                                                <p className="text-xs text-slate-500">{comp.levelsCount} níveis</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <Link href={`/competencias/${comp.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit2 className="w-4 h-4 text-slate-500" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDelete(comp.id, comp.name)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Usado em {comp.usageCount} cargos</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${catConfig.color}`}>
                                            {catConfig.label}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}

            {filteredItems.length === 0 && items.length === 0 && (
                <GenerateCompetenciesButton />
            )}

            {filteredItems.length === 0 && items.length > 0 && (
                <div className="text-center py-16 text-slate-400">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhuma competência encontrada</p>
                    <p className="text-sm">Tente alterar os filtros de busca</p>
                </div>
            )}
        </div>
    );
}
