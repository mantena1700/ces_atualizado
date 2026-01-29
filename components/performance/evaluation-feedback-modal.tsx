'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MessageSquare, History, Edit3, Save, CheckCircle2,
    AlertTriangle, Sparkles, Send, Mail, Clock
} from 'lucide-react';
import {
    getEmployeeEvaluationHistory,
    updateEvaluationFeedback
} from '@/app/actions/performance';

interface Props {
    evaluation: any;
    isOpen: boolean;
    onClose: () => void;
    canEdit: boolean;
}

export function EvaluationFeedbackModal({ evaluation, isOpen, onClose, canEdit }: Props) {
    const [activeTab, setActiveTab] = useState('feedback');
    const [history, setHistory] = useState<any[]>([]);

    // Editable States
    const [feedback, setFeedback] = useState(evaluation.feedback || '');
    const [strengths, setStrengths] = useState(evaluation.strengths || '');
    const [improvements, setImprovements] = useState(evaluation.improvements || '');

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen]);

    const loadHistory = async () => {
        const res = await getEmployeeEvaluationHistory(evaluation.employeeId);
        if (res.success) {
            setHistory(res.history.filter((h: any) => h.id !== evaluation.id));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateEvaluationFeedback(evaluation.id, {
            feedback,
            strengths,
            improvements
        });
        setIsSaving(false);
        setIsEditing(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        Feedback e Histórico - {evaluation.employee.name}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="feedback">Feedback do Ciclo Atual</TabsTrigger>
                        <TabsTrigger value="history">Histórico de Avaliações</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 p-4">
                        <TabsContent value="feedback" className="space-y-6 mt-0">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-slate-500">
                                        Gerado por IA com base nas competências
                                    </span>
                                </div>
                                {canEdit && !isEditing && (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Editar Feedback
                                    </Button>
                                )}
                                {isEditing && (
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                            Cancelar
                                        </Button>
                                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Feedback Geral */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Feedback Geral
                                    </h4>
                                    {isEditing ? (
                                        <Textarea
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-lg text-slate-700 text-sm whitespace-pre-wrap">
                                            {feedback || 'Nenhum feedback registrado.'}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Pontos Fortes */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-emerald-700 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Pontos Fortes
                                        </h4>
                                        {isEditing ? (
                                            <Textarea
                                                value={strengths}
                                                onChange={e => setStrengths(e.target.value)}
                                                className="min-h-[150px] border-emerald-200 focus:ring-emerald-500"
                                            />
                                        ) : (
                                            <div className="p-4 bg-emerald-50 rounded-lg text-emerald-800 text-sm whitespace-pre-wrap border border-emerald-100">
                                                {strengths || 'Nenhum ponto forte registrado.'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Pontos a Melhorar */}
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Pontos de Melhoria
                                        </h4>
                                        {isEditing ? (
                                            <Textarea
                                                value={improvements}
                                                onChange={e => setImprovements(e.target.value)}
                                                className="min-h-[150px] border-amber-200 focus:ring-amber-500"
                                            />
                                        ) : (
                                            <div className="p-4 bg-amber-50 rounded-lg text-amber-800 text-sm whitespace-pre-wrap border border-amber-100">
                                                {improvements || 'Nenhum ponto de melhoria registrado.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            {history.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    Nenhum histórico anterior encontrado.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((h, idx) => (
                                        <div key={idx} className="p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{h.cycleName}</h4>
                                                    <span className="text-xs text-slate-500">
                                                        Realizada em {new Date(h.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <Badge variant={h.finalScore >= 4 ? "default" : "secondary"}>
                                                    Nota: {h.finalScore?.toFixed(1)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-3">
                                                {h.feedback}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </ScrollArea>

                    {/* Footer com Status de Notificação */}
                    <div className="p-4 border-t bg-slate-50 flex justify-between items-center text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Status do Email:
                                <strong className={
                                    evaluation.emailStatus === 'SENT' ? 'text-emerald-600 ml-1' : 'text-amber-600 ml-1'
                                }>
                                    {evaluation.emailStatus === 'SENT' ? 'Enviado' : 'Pendente'}
                                </strong>
                            </span>
                            {evaluation.lastEmailSentAt && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Enviado em: {new Date(evaluation.lastEmailSentAt).toLocaleString('pt-BR')}
                                </span>
                            )}
                        </div>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
