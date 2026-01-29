'use client';

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveJobEvaluation } from "@/app/actions/evaluation";
import { Save, AlertCircle } from "lucide-react";

interface GridProps {
    jobRoles: any[];
    factors: any[];
    onUpdate: () => void;
}

export function EvaluationGrid({ jobRoles, factors, onUpdate }: GridProps) {
    const [changes, setChanges] = useState<{ [key: string]: string }>({}); // Chave: "roleId_factorId", Valor: levelId
    const [saving, setSaving] = useState(false);

    // Função auxiliar para pegar o valor atual (banco ou mudança local) (mudança local tem prioridade)
    const getValue = (role: any, factorId: string) => {
        const key = `${role.id}_${factorId}`;
        if (changes[key]) return changes[key];

        // Buscar no banco
        const score = role.scores.find((s: any) => s.factorLevel.factorId === factorId);
        return score ? score.factorLevelId : "";
    };

    const handleChange = (roleId: string, factorId: string, levelId: string) => {
        setChanges(prev => ({
            ...prev,
            [`${roleId}_${factorId}`]: levelId
        }));
    };

    const hasChanges = Object.keys(changes).length > 0;

    const handleSaveAll = async () => {
        setSaving(true);

        // Agrupar mudanças por cargo para salvar em lote
        const updatesByRole: any = {};

        Object.keys(changes).forEach(key => {
            const [roleId, factorId] = key.split('_');
            const levelId = changes[key];

            if (!updatesByRole[roleId]) updatesByRole[roleId] = {};
            updatesByRole[roleId][factorId] = levelId;
        });

        // Como o saveJobEvaluation substitui TUDO, precisamos garantir que enviamos TAMBÉM o que não mudou mas já existia
        // Isso complica a Grid se salvarmos por cargo.
        // Melhor estratégia: 
        // Para cada cargo alterado:
        // 1. Pegar estado atual completo (mistura de banco + mudanças)
        // 2. Enviar tudo.

        const promises = Object.keys(updatesByRole).map(async (roleId) => {
            const role = jobRoles.find(r => r.id === roleId);
            const roleScores: any = {};

            // Preenche com o que já tinha
            role.scores.forEach((s: any) => {
                roleScores[s.factorLevel.factorId] = s.factorLevelId;
            });

            // Sobrescreve com as mudanças
            const changedFactors = updatesByRole[roleId];
            Object.keys(changedFactors).forEach(fId => {
                roleScores[fId] = changedFactors[fId];
            });

            return saveJobEvaluation(roleId, roleScores);
        });

        await Promise.all(promises);
        setChanges({});
        setSaving(false);
        onUpdate(); // Recarrega dados
    };

    return (
        <div className="space-y-4">
            {hasChanges && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center justify-between animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Você tem alterações não salvas.</span>
                    </div>
                    <Button onClick={handleSaveAll} disabled={saving} className="bg-yellow-600 hover:bg-yellow-700 text-white border-none">
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            )}

            <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="p-4 text-left font-medium text-muted-foreground w-[250px]">Cargo</th>
                            {factors.map(f => (
                                <th key={f.id} className="p-4 text-center font-medium text-muted-foreground min-w-[140px]">
                                    {f.name} (Peso {Math.round(f.weight * 100)}%)
                                </th>
                            ))}
                            <th className="p-4 text-right font-medium text-muted-foreground w-[100px]">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {jobRoles.map(role => (
                            <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 align-middle">
                                    <div className="font-medium">{role.title}</div>
                                    {role.grade ? (
                                        <Badge variant="secondary" className="mt-1 text-[10px]">{role.grade.name}</Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic block mt-1">Sem classificação</span>
                                    )}
                                </td>
                                {factors.map(f => (
                                    <td key={f.id} className="p-2 align-middle text-center">
                                        <select
                                            className="w-full max-w-[180px] rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={getValue(role, f.id)}
                                            onChange={(e) => handleChange(role.id, f.id, e.target.value)}
                                        >
                                            <option value="">Selecione...</option>
                                            {f.levels.map((lvl: any) => (
                                                <option key={lvl.id} value={lvl.id}>
                                                    Nível {lvl.level} ({lvl.points}pts)
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                ))}
                                <td className="p-4 text-right font-bold text-foreground">
                                    {role.totalPoints} pts
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
