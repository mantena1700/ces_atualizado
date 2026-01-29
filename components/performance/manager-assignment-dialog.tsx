'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Search, Mail, Briefcase, Link2, Copy, Check } from 'lucide-react';
import { assignManagerToEvaluation, getAvailableManagers } from '@/app/actions/performance';

interface Props {
    evaluationId: string;
    employeeName: string;
    isOpen: boolean;
    onClose: () => void;
    onAssigned?: (token: string) => void;
}

export function ManagerAssignmentDialog({ evaluationId, employeeName, isOpen, onClose, onAssigned }: Props) {
    const [managers, setManagers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [selectedManager, setSelectedManager] = useState<any>(null);
    const [customManager, setCustomManager] = useState({ name: '', email: '' });
    const [useCustom, setUseCustom] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadManagers();
        }
    }, [isOpen]);

    const loadManagers = async () => {
        setLoading(true);
        const data = await getAvailableManagers();
        setManagers(data);
        setLoading(false);
    };

    const filteredManagers = managers.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.role?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = async () => {
        setAssigning(true);

        const manager = useCustom ? customManager : selectedManager;
        if (!manager?.name || !manager?.email) {
            setAssigning(false);
            return;
        }

        const result = await assignManagerToEvaluation(evaluationId, {
            name: manager.name,
            email: manager.email,
            id: useCustom ? undefined : selectedManager?.id
        });

        if (result.success && result.accessToken) {
            setAccessToken(result.accessToken);
            onAssigned?.(result.accessToken);
        }

        setAssigning(false);
    };

    const copyLink = () => {
        if (accessToken) {
            const link = `${window.location.origin}/portal-gestor/${accessToken}`;
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const resetForm = () => {
        setSelectedManager(null);
        setCustomManager({ name: '', email: '' });
        setAccessToken(null);
        setUseCustom(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        Atribuir Gestor Avaliador
                    </DialogTitle>
                    <DialogDescription>
                        Selecione o gestor responsável por avaliar <strong>{employeeName}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {accessToken ? (
                    // Link gerado
                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="flex items-center gap-2 text-emerald-800 font-medium mb-2">
                                <Check className="w-5 h-5" />
                                Gestor atribuído com sucesso!
                            </div>
                            <p className="text-sm text-emerald-700">
                                Um link exclusivo foi gerado para {useCustom ? customManager.name : selectedManager?.name}.
                            </p>
                        </div>

                        <div>
                            <Label className="text-sm text-slate-600">Link de Acesso</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    readOnly
                                    value={`${window.location.origin}/portal-gestor/${accessToken}`}
                                    className="text-xs"
                                />
                                <Button onClick={copyLink} variant="outline" size="sm">
                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Envie este link para o gestor. Ele poderá acessar e preencher a avaliação diretamente.
                            </p>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={handleClose}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Seleção de gestor
                    <div className="space-y-4">
                        {/* Toggle entre lista e manual */}
                        <div className="flex gap-2">
                            <Button
                                variant={!useCustom ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setUseCustom(false)}
                                className="flex-1"
                            >
                                Selecionar da lista
                            </Button>
                            <Button
                                variant={useCustom ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setUseCustom(true)}
                                className="flex-1"
                            >
                                Informar manualmente
                            </Button>
                        </div>

                        {!useCustom ? (
                            // Lista de gestores
                            <>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar gestor..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {loading ? (
                                        <div className="text-center py-4 text-slate-500">Carregando...</div>
                                    ) : filteredManagers.length === 0 ? (
                                        <div className="text-center py-4 text-slate-500">
                                            Nenhum gestor encontrado
                                        </div>
                                    ) : (
                                        filteredManagers.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => setSelectedManager(m)}
                                                className={`w-full p-3 rounded-lg border text-left transition-all ${selectedManager?.id === m.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-slate-800">{m.name}</p>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Briefcase className="w-3 h-3" />
                                                                {m.role}
                                                            </span>
                                                            {m.email && (
                                                                <span className="flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {m.email}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectedManager?.id === m.id && (
                                                        <Check className="w-5 h-5 text-blue-600" />
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </>
                        ) : (
                            // Formulário manual
                            <div className="space-y-4">
                                <div>
                                    <Label>Nome do Gestor</Label>
                                    <Input
                                        placeholder="Ex: João Silva"
                                        value={customManager.name}
                                        onChange={(e) => setCustomManager({ ...customManager, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>E-mail do Gestor</Label>
                                    <Input
                                        type="email"
                                        placeholder="gestor@empresa.com"
                                        value={customManager.email}
                                        onChange={(e) => setCustomManager({ ...customManager, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 justify-end pt-4 border-t">
                            <Button variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={assigning || (!useCustom && !selectedManager) || (useCustom && (!customManager.name || !customManager.email))}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {assigning ? (
                                    <span className="animate-pulse">Atribuindo...</span>
                                ) : (
                                    <>
                                        <Link2 className="w-4 h-4 mr-2" />
                                        Gerar Link de Acesso
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
