import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Link as LinkIcon, AlertCircle, CheckCircle2, Copy, Users } from 'lucide-react';
import { batchAssignManagers } from '@/app/actions/performance';

interface Props {
    evaluationIds: string[];
    onClose: () => void;
    onSuccess: () => void;
}

export function BatchManagerAssignmentDialog({ evaluationIds, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<'SELECT' | 'CONFIRM' | 'SUCCESS'>('SELECT');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedManager, setSelectedManager] = useState<any>(null);
    const [manualManager, setManualManager] = useState({ name: '', email: '' });
    const [assigning, setAssigning] = useState(false);
    const [result, setResult] = useState<{ count: number; errors: any[] } | null>(null);

    // Mock de gestores - na prática viria de uma prop ou server action
    // Seria ideal buscar via server action getAvailableManagers
    const suggestedManagers = [
        { id: 'rel_1', name: 'Roberto Almeida', email: 'roberto.almeida@empresa.com', department: 'TI' },
        { id: 'rel_2', name: 'Carla Dias', email: 'carla.dias@empresa.com', department: 'RH' },
        { id: 'rel_3', name: 'Fernando Souza', email: 'fernando.souza@empresa.com', department: 'Vendas' },
    ];

    const filteredManagers = suggestedManagers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssign = async () => {
        setAssigning(true);

        const managerData = selectedManager || manualManager;

        const res = await batchAssignManagers(evaluationIds, {
            name: managerData.name,
            email: managerData.email,
            id: managerData.id,
        });

        if (res.success && typeof res.count === 'number') {
            setResult({ count: res.count, errors: res.errors || [] });
            setStep('SUCCESS');
        } else {
            alert('Erro ao atribuir: ' + (typeof res.error === 'string' ? res.error : 'Erro desconhecido'));
        }

        setAssigning(false);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-rose-600" />
                        Atribuição em Lote ({evaluationIds.length})
                    </DialogTitle>
                    <DialogDescription>
                        Selecione o gestor que será responsável por estas {evaluationIds.length} avaliações.
                    </DialogDescription>
                </DialogHeader>

                {step === 'SELECT' && (
                    <div className="space-y-6 py-4">
                        {/* Busca de Gestor Existente */}
                        <div className="space-y-4">
                            <Label>Buscar Gestor Existente</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="Nome ou departamento..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {searchTerm && (
                                <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                                    {filteredManagers.map(manager => (
                                        <div
                                            key={manager.id}
                                            onClick={() => {
                                                setSelectedManager(manager);
                                                setStep('CONFIRM');
                                            }}
                                            className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors"
                                        >
                                            <div>
                                                <p className="font-medium text-sm text-slate-700">{manager.name}</p>
                                                <p className="text-xs text-slate-500">{manager.department}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {filteredManagers.length === 0 && (
                                        <div className="p-4 text-center text-sm text-slate-500">
                                            Nenhum gestor encontrado.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-slate-500">Ou informe manualmente</span>
                            </div>
                        </div>

                        {/* Cadastro Manual */}
                        <div className="grid gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nome do Gestor</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: João Silva"
                                    value={manualManager.name}
                                    onChange={(e) => setManualManager({ ...manualManager, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Corporativo</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="gestor@empresa.com"
                                    value={manualManager.email}
                                    onChange={(e) => setManualManager({ ...manualManager, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button
                                onClick={() => {
                                    setSelectedManager(null); // Clear selected
                                    setStep('CONFIRM');
                                }}
                                disabled={!manualManager.name || !manualManager.email}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                Continuar
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'CONFIRM' && (
                    <div className="space-y-6 py-4">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold mb-1">Confirmação</p>
                                <p>
                                    Você está prestes a atribuir <strong>{selectedManager?.name || manualManager.name}</strong> ({selectedManager?.email || manualManager.email})
                                    como gestor de <strong>{evaluationIds.length} colaboradores</strong>.
                                </p>
                                <p className="mt-2 text-amber-700/80 text-xs">
                                    Isso removerá quaisquer gestores atribuídos anteriormente a estas avaliações.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setStep('SELECT')}>Voltar</Button>
                            <Button
                                onClick={handleAssign}
                                disabled={assigning}
                                className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
                            >
                                {assigning ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Confirmar Atribuição'
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="space-y-6 py-4 text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Atribuição Concluída!</h3>
                            <p className="text-slate-600">
                                O gestor foi atribuído a <strong>{result?.count}</strong> avaliações com sucesso.
                            </p>
                            {result?.errors && result.errors.length > 0 && (
                                <p className="text-rose-600 text-sm mt-2">
                                    {result.errors.length} falhas ocorreram.
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left">
                            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Atenção</p>
                            <p className="text-sm text-slate-600">
                                Cada avaliação tem seu próprio <strong>link de acesso exclusivo</strong>.
                                Você precisará copiar os links individualmente na página de cada avaliação ou enviar por email.
                                (Futuramente implementaremos envio em massa por email).
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={onSuccess}
                                className="w-full bg-slate-900 text-white hover:bg-slate-800"
                            >
                                Concluir
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
