'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { createJobRole, updateJobRole, deleteJobRole, getJobRoles } from "@/app/actions/jobs";
import { X, Briefcase, Network, UserPlus, Trash2 } from "lucide-react";

interface JobFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function JobForm({ onClose, onSuccess, initialData }: JobFormProps) {
    const [loading, setLoading] = useState(false);
    const [existingRoles, setExistingRoles] = useState<any[]>([]);

    // Form State
    const [title, setTitle] = useState(initialData?.title || '');
    const [department, setDepartment] = useState(initialData?.department || '');
    const [area, setArea] = useState(initialData?.area || '');
    const [cbo, setCbo] = useState(initialData?.cbo || '');
    const [reportsTo, setReportsTo] = useState(initialData?.reportsToId || 'none');

    // Sugestões (Mock - poderia vir do banco)
    const departments = ["Tecnologia", "Recursos Humanos", "Financeiro", "Operações", "Comercial", "A Classificar"];
    const areasByDept: Record<string, string[]> = {
        "Tecnologia": ["Desenvolvimento", "Infraestrutura", "Dados", "Suporte"],
        "Recursos Humanos": ["Recrutamento", "Departamento Pessoal", "T&D"],
    };

    useEffect(() => {
        getJobRoles().then(setExistingRoles);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title,
            department,
            area,
            cbo,
            reportsToId: reportsTo
        };

        if (initialData?.id) {
            await updateJobRole(initialData.id, payload);
        } else {
            await createJobRole(payload);
        }

        setLoading(false);
        onSuccess();
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        if (confirm("Tem certeza que deseja excluir este cargo? Todos os vínculos serão perdidos.")) {
            setLoading(true);
            await deleteJobRole(initialData.id);
            setLoading(false);
            onSuccess();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="h-full w-full max-w-md rounded-none border-l shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                <CardHeader className="border-b bg-muted/40">
                    <div className="flex items-center justify-between">
                        <CardTitle>{initialData ? 'Editar Cargo' : 'Novo Cargo'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título do Cargo</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="title"
                                placeholder="Ex: Analista de TI Pleno"
                                className="pl-9"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">O nome oficial que aparecerá na carteira de trabalho.</p>
                    </div>

                    {/* Departamento e Área */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="department">Departamento</Label>
                            <select
                                id="department"
                                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={department}
                                onChange={e => setDepartment(e.target.value)}
                                required
                            >
                                <option value="">Selecione...</option>
                                {departments.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area">Área</Label>
                            <Input
                                list="areas-list"
                                placeholder="Ex: Redes"
                                value={area}
                                onChange={e => setArea(e.target.value)}
                            />
                            <datalist id="areas-list">
                                {(areasByDept[department] || []).map(a => <option key={a} value={a} />)}
                            </datalist>
                        </div>
                    </div>

                    {/* Estrutura */}
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Network className="w-4 h-4" /> Estrutura & CBO
                        </h4>

                        <div className="space-y-2">
                            <Label htmlFor="reportsTo">Reporta a (Gestor Imediato)</Label>
                            <div className="relative">
                                <UserPlus className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <select
                                    id="reportsTo"
                                    className="w-full h-9 rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={reportsTo}
                                    onChange={e => setReportsTo(e.target.value)}
                                >
                                    <option value="none">Ninguém (Cargo de Topo)</option>
                                    {existingRoles.map(r => (
                                        <option key={r.id} value={r.id}>{r.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cbo">CBO (Opcional)</Label>
                            <Input
                                id="cbo"
                                placeholder="Ex: 2124-05"
                                value={cbo}
                                onChange={e => setCbo(e.target.value)}
                            />
                            <p className="text-[0.8rem] text-muted-foreground">Se preenchido, ajuda no enquadramento legal.</p>
                        </div>
                    </div>

                </form>

                <CardFooter className="border-t bg-muted/20 p-4 flex justify-between gap-2">
                    {initialData ? (
                        <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </Button>
                    ) : <div></div>}

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={loading || !title || !department}>
                            {loading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Cargo')}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
