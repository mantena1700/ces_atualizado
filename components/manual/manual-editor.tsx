'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Se existir, senão uso input normal
import { saveManualSection, deleteSection } from "@/app/actions/manual";
import { X, Save, Trash2, Loader2, FileCode, Type, FileText } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ManualEditorProps {
    section?: any;
    versionId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function ManualEditor({ section, versionId, onClose, onSuccess }: ManualEditorProps) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(section?.title || '');
    const [content, setContent] = useState(section?.content || '');
    const [order, setOrder] = useState(section?.order?.toString() || '1');
    const [type, setType] = useState(section?.type || 'TEXT');

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            title,
            content,
            order: parseInt(order),
            type,
            parentId: section?.parentId
        };

        const result = await saveManualSection(section?.id || null, versionId, payload);

        setLoading(false);
        if (result.success) {
            onSuccess();
        } else {
            alert("Erro ao salvar: " + result.error);
        }
    };

    const handleDelete = async () => {
        if (confirm("Tem certeza que deseja excluir este capítulo?")) {
            setLoading(true);
            await deleteSection(section.id);
            setLoading(false);
            onSuccess(); // Na verdade devia fechar e recarregar
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">
                        {section ? 'Editar Capítulo' : 'Novo Capítulo'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-200 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </Button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <form id="editor-form" onSubmit={handleSave} className="space-y-6 max-w-3xl mx-auto">

                        <div className="grid grid-cols-4 gap-6">
                            <div className="col-span-3 space-y-2">
                                <Label>Título do Capítulo</Label>
                                <Input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ex: 1. Introdução"
                                    className="text-lg font-bold h-12"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ordem</Label>
                                <Input
                                    type="number"
                                    value={order}
                                    onChange={e => setOrder(e.target.value)}
                                    className="h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Conteúdo</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEXT">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-500" />
                                            <span>Texto Livre (HTML)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="DYNAMIC_JOBLIST">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-blue-500" />
                                            <span>Catálogo Dinâmico de Cargos</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="DYNAMIC_SALARY_TABLE">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-emerald-500" />
                                            <span>Tabela Salarial Dinâmica</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 pl-1">
                                Componentes dinâmicos puxam dados automaticamente do sistema e ignoram o campo de conteúdo abaixo.
                            </p>
                        </div>

                        {type === 'TEXT' && (
                            <div className="space-y-2">
                                <Label className="flex justify-between">
                                    Conteúdo
                                    <span className="text-xs font-normal text-slate-400">Suporta HTML básico</span>
                                </Label>
                                <div className="relative">
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full min-h-[400px] p-6 rounded-xl border border-slate-200 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                        placeholder="<p>Escreva seu conteúdo aqui...</p>"
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center">
                    {section ? (
                        <Button variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={handleDelete} type="button">
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </Button>
                    ) : <div />}

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button
                            type="submit"
                            form="editor-form"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 px-8"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
