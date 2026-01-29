'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, Settings2, AlertTriangle } from 'lucide-react';
import { applyGeneralIncrease } from '@/app/actions/matrix-bulk';
import { GradesConfigModal } from '@/components/grades-config-modal';

interface ToolbarProps {
    grades?: any[];
    steps?: any[];
}

export function MatrixToolbar({ grades = [], steps = [] }: ToolbarProps) {
    const [showReajuste, setShowReajuste] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [percent, setPercent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReajuste = async () => {
        setLoading(true);
        await applyGeneralIncrease(Number(percent));
        setLoading(false);
        setShowReajuste(false);
        setPercent('');
        // Forçar reload hard para garantir atualização da tabela e gráficos
        window.location.reload();
    };

    return (
        <div className="flex gap-2">
            <Button variant="secondary" className="gap-2" onClick={() => setShowConfig(true)}>
                <Settings2 className="w-4 h-4" />
                Configurar Grades
            </Button>

            <Button className="gap-2" onClick={() => setShowReajuste(true)}>
                <Calculator className="w-4 h-4" />
                Simular Reajuste Geral
            </Button>

            {/* Modal de Configuração de Grades e Steps */}
            {showConfig && (
                <GradesConfigModal
                    grades={grades}
                    steps={steps}
                    onClose={() => {
                        setShowConfig(false);
                        window.location.reload();
                    }}
                />
            )}

            {/* Modal de Reajuste */}
            {showReajuste && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-card border rounded-lg shadow-xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full text-primary">
                                <Calculator className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Reajuste Geral</h3>
                                <p className="text-muted-foreground text-sm">Aplique uma porcentagem de aumento (ou redução) em TODA a tabela salarial.</p>
                            </div>
                        </div>

                        <div className="py-4">
                            <label className="text-sm font-medium mb-2 block">Porcentagem de Reajuste (%)</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Ex: 5.0"
                                    value={percent}
                                    onChange={e => setPercent(e.target.value)}
                                    className="text-lg font-bold"
                                    autoFocus
                                />
                                <span className="text-muted-foreground font-bold">%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                Atenção: Isso alterará todos os valores permanentemente.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button variant="ghost" onClick={() => setShowReajuste(false)}>Cancelar</Button>
                            <Button onClick={handleReajuste} disabled={loading || !percent}>
                                {loading ? 'Aplicando...' : 'Confirmar Reajuste'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
