'use client';

import { useState, useEffect } from 'react';
import { getJobRoles } from '@/app/actions/jobs';
import { JobForm } from '@/components/job-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Pencil, Brain } from 'lucide-react';
import Link from 'next/link';

export default function CargosPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        const data = await getJobRoles();
        setRoles(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredRoles = roles.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department && r.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEdit = (role: any) => {
        setEditingRole(role);
        setShowForm(true);
    };

    const handleNew = () => {
        setEditingRole(null);
        setShowForm(true);
    };

    return (
        <div className="p-8 space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestão de Cargos</h2>
                    <p className="text-muted-foreground">Cadastre e gerencie o inventário de funções da empresa.</p>
                </div>
                <Button onClick={handleNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Cargo
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    placeholder="Buscar por cargo ou departamento..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Button size="icon" variant="ghost"><Search className="w-4 h-4" /></Button>
            </div>

            {/* Tabela de Cargos */}
            <div className="border rounded-lg overflow-hidden flex-1 bg-white shadow-sm">
                <div className="overflow-auto max-h-[600px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-muted-foreground">Cargo</th>
                                <th className="p-4 font-medium text-muted-foreground">Departamento</th>
                                <th className="p-4 font-medium text-muted-foreground">CBO</th>
                                <th className="p-4 font-medium text-muted-foreground">Pontuação</th>
                                <th className="p-4 font-medium text-muted-foreground text-center">Competências</th>
                                <th className="p-4 font-medium text-muted-foreground text-center">Avaliação</th>
                                <th className="p-4 font-medium text-muted-foreground text-center w-[80px]">Editar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
                            ) : filteredRoles.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum cargo encontrado.</td></tr>
                            ) : (
                                filteredRoles.map(role => (
                                    <tr key={role.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="p-4 font-semibold text-slate-800">{role.title}</td>
                                        <td className="p-4 text-slate-600">{role.department || '-'}</td>
                                        <td className="p-4 font-mono text-xs text-slate-500">{role.cbo || '-'}</td>
                                        <td className="p-4">
                                            {role.totalPoints > 0 ? (
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {role.totalPoints} pts
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Não avaliado</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link href={`/competencias/cargo/${role.id}`}>
                                                <Button variant="ghost" size="sm" className="hover:bg-purple-50 text-purple-600">
                                                    <Brain className="w-4 h-4 mr-1" />
                                                    Ver
                                                </Button>
                                            </Link>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Link href={`/avaliacao?cargo=${role.id}`}>
                                                <Button variant="ghost" size="sm" className="hover:bg-blue-50 text-blue-600">
                                                    <FileText className="w-4 h-4 mr-1" /> Avaliar
                                                </Button>
                                            </Link>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showForm && (
                <JobForm
                    initialData={editingRole}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        setShowForm(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
