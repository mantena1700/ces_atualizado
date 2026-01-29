'use client';

import { useState } from 'react';
import { Settings2, Save, Calculator, Wand2 } from 'lucide-react';
import { updateMatrixCell, updateGradeRow } from '@/app/actions/matrix';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MatrixProps {
    grades: any[];
    steps: any[];
    matrix: Record<string, number>;
    roleCount: Record<string, number>;
}

export function MatrixTable({ grades, steps, matrix, roleCount }: MatrixProps) {
    const [editingCell, setEditingCell] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState('');
    const [loadingRow, setLoadingRow] = useState<string | null>(null);

    const handleCellClick = (gradeId: string, stepId: string, currentVal: number) => {
        setEditingCell(`${gradeId}_${stepId}`);
        setTempValue(currentVal ? currentVal.toString() : '');
    };

    const handleCellBlur = async (gradeId: string, stepId: string) => {
        if (!editingCell) return;

        // Se mudou, salva
        const newVal = parseFloat(tempValue);
        if (!isNaN(newVal)) {
            // Otimisticamente poderíamos atualizar o estado local, mas o revalidatePath cuidará disso
            await updateMatrixCell(gradeId, stepId, newVal);
        }
        setEditingCell(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, gradeId: string, stepId: string) => {
        if (e.key === 'Enter') {
            handleCellBlur(gradeId, stepId);
        }
    };

    const handleAutoCalculate = async (gradeId: string) => {
        // Pega o valor do Step A (primeiro step)
        const firstStepId = steps[0].id; // Assumindo ordenado
        const baseVal = matrix[`${gradeId}_${firstStepId}`]; // Valor atual no banco ou UI

        if (!baseVal) {
            alert("Preencha o Step A primeiro.");
            return;
        }

        setLoadingRow(gradeId);
        await updateGradeRow(gradeId, baseVal, 5); // 5% fixo por enquanto
        setLoadingRow(null);
    };

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-muted/50 border-b">
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[220px]">
                                Grade / Nível
                            </th>
                            <th className="h-12 px-2 text-center align-middle font-medium text-muted-foreground w-[80px]">
                                Cargos
                            </th>
                            {steps.map((step) => (
                                <th key={step.id} className="h-12 px-2 text-center align-middle font-medium text-muted-foreground min-w-[110px]">
                                    Step {step.name}
                                </th>
                            ))}
                            <th className="h-12 px-2 text-center align-middle w-[60px]">
                                <Settings2 className="w-4 h-4 mx-auto text-muted-foreground" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.map((grade) => (
                            <tr key={grade.id} className="border-b transition-colors hover:bg-muted/50">
                                <td className="p-4 align-middle font-semibold text-foreground">
                                    <div className="flex flex-col">
                                        <span>{grade.name}</span>
                                        <span className="text-[10px] text-muted-foreground font-normal">
                                            {grade.minPoints} - {grade.maxPoints} pts
                                        </span>
                                    </div>
                                </td>
                                <td className="p-2 text-center align-middle">
                                    {roleCount[grade.id] ? (
                                        <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 hover:bg-blue-200">
                                            {roleCount[grade.id]}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                </td>
                                {steps.map((step) => {
                                    const key = `${grade.id}_${step.id}`;
                                    const isEditing = editingCell === key;
                                    const amount = matrix[key] || 0;

                                    return (
                                        <td
                                            key={step.id}
                                            className="p-2 align-middle text-center cursor-pointer relative group"
                                            onClick={() => !isEditing && handleCellClick(grade.id, step.id, amount)}
                                        >
                                            {isEditing ? (
                                                <Input
                                                    autoFocus
                                                    className="h-8 w-24 text-center px-1 mx-auto font-mono text-xs"
                                                    value={tempValue}
                                                    onChange={e => setTempValue(e.target.value)}
                                                    onBlur={() => handleCellBlur(grade.id, step.id)}
                                                    onKeyDown={(e) => handleKeyDown(e, grade.id, step.id)}
                                                    type="number"
                                                />
                                            ) : (
                                                <div className="hover:bg-slate-100 rounded py-1 px-2 -mx-2 transition-colors">
                                                    <span className={`font-mono ${amount > 0 ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                                                        {amount > 0 ?
                                                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(amount)
                                                            : 'R$ 0'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                                <td className="p-2 text-center align-middle">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        title="Calcular linha inteira (Step A + 5%)"
                                        onClick={() => handleAutoCalculate(grade.id)}
                                        disabled={loadingRow === grade.id}
                                    >
                                        {loadingRow === grade.id ? (
                                            <span className="animate-spin text-xs">↻</span>
                                        ) : (
                                            <Wand2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t bg-muted/20 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                    <Wand2 className="w-3 h-3" />
                    Botão mágico preenche a linha (5% a cada step)
                </span>
                <span>* Clique nos valores para editar</span>
            </div>
        </div>
    );
}
