'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { saveJobEvaluation } from "@/app/actions/evaluation";

interface WizardProps {
    jobRole: any;
    factors: any[];
    onComplete: () => void;
    onCancel: () => void;
}

export function EvaluationWizard({ jobRole, factors, onComplete, onCancel }: WizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState<{ [factorId: string]: string }>({});
    const [saving, setSaving] = useState(false);

    // Carregar notas existentes se houver
    useEffect(() => {
        if (jobRole.scores && jobRole.scores.length > 0) {
            const initial: any = {};
            jobRole.scores.forEach((s: any) => {
                // Encontrar o factorId através do level
                // O meu backend retorna scores.factorLevel, e factorLevel tem factorId?
                // O include no backend foi: score -> include factorLevel. Preciso garantir que factorLevel traga o factorId. 
                // O schema diz que FactorLevel tem factorId. Então ok.
                initial[s.factorLevel.factorId] = s.factorLevelId;
            });
            setSelections(initial);
        }
    }, [jobRole]);

    const currentFactor = factors[currentStep];
    const isLastStep = currentStep === factors.length - 1;

    const handleSelect = (levelId: string) => {
        setSelections(prev => ({ ...prev, [currentFactor.id]: levelId }));
    };

    const handleNext = () => {
        if (isLastStep) {
            handleSave();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSave = async () => {
        setSaving(true);
        await saveJobEvaluation(jobRole.id, selections);
        setSaving(false);
        onComplete();
    };

    // Processo de renderização dos passos
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <Card className="w-full max-w-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <CardHeader className="border-b bg-muted/20 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl">Avaliando: {jobRole.title}</CardTitle>
                            <CardDescription>Defina a pontuação passo a passo</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-base px-3 py-1">
                            Fator {currentStep + 1} de {factors.length}
                        </Badge>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / factors.length) * 100}%` }}
                        ></div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-2 text-primary">{currentFactor.name}</h3>
                    <p className="text-muted-foreground mb-6">{currentFactor.description}</p>

                    <div className="space-y-3">
                        {currentFactor.levels.map((level: any) => {
                            const isSelected = selections[currentFactor.id] === level.id;
                            return (
                                <div
                                    key={level.id}
                                    onClick={() => handleSelect(level.id)}
                                    className={`
                    cursor-pointer p-4 rounded-lg border-2 transition-all hover:bg-muted/50
                    flex items-center justify-between
                    ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-transparent bg-slate-50 hover:border-slate-300'}
                  `}
                                >
                                    <div>
                                        <span className="font-bold text-sm block mb-1 text-foreground">Nível {level.level}: {level.description}</span>
                                        <span className="text-xs text-muted-foreground">Exigência detalhada para este nível.</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-lg text-primary">{level.points} pts</span>
                                        {isSelected && <CheckCircle className="w-5 h-5 text-primary inline-block ml-2" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t bg-muted/20 p-4 flex-shrink-0">
                    <Button variant="ghost" onClick={currentStep === 0 ? onCancel : handleBack}>
                        {currentStep === 0 ? 'Cancelar' : 'Voltar'}
                    </Button>

                    <Button
                        onClick={handleNext}
                        disabled={!selections[currentFactor.id] || saving}
                        className="w-32"
                    >
                        {saving ? 'Salvando...' : isLastStep ? 'Concluir' : 'Próximo'}
                        {!saving && !isLastStep && <ChevronRight className="ml-2 w-4 h-4" />}
                        {!saving && isLastStep && <Save className="ml-2 w-4 h-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
