'use client';

import { useState } from 'react';
import { generateDefaultCompetencies } from '@/app/actions/competencies';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Loader2, CheckCircle2, Zap, Code, Heart, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GenerateCompetenciesButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        const result = await generateDefaultCompetencies();
        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.refresh();
            }, 1000);
        } else {
            alert('Erro: ' + result.error);
        }
        setLoading(false);
    };

    if (success) {
        return (
            <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-emerald-50 to-white text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
                <h3 className="text-xl font-bold text-emerald-800 mb-2">Competências Criadas!</h3>
                <p className="text-emerald-600">12 competências padrão foram geradas com sucesso.</p>
            </Card>
        );
    }

    return (
        <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="text-center max-w-xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Brain className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-black text-slate-800 mb-3">
                    Nenhuma Competência Cadastrada
                </h2>
                <p className="text-slate-500 mb-6">
                    Para usar o sistema de sugestão com IA, você precisa primeiro criar as competências base.
                    Clique no botão abaixo para gerar automaticamente 12 competências padrão.
                </p>

                {/* Preview das competências */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Code className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-blue-700">4 Técnicas</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <Heart className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-purple-700">5 Comportamentais</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                        <p className="text-xs font-medium text-amber-700">3 Organizacionais</p>
                    </div>
                </div>

                <div className="text-left mb-6 p-4 bg-white rounded-xl border">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Competências incluídas:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span>• Conhecimento Técnico</span>
                        <span>• Comunicação</span>
                        <span>• Análise de Dados</span>
                        <span>• Trabalho em Equipe</span>
                        <span>• Gestão de Projetos</span>
                        <span>• Liderança</span>
                        <span>• Tecnologia da Informação</span>
                        <span>• Resolução de Problemas</span>
                        <span>• Visão Estratégica</span>
                        <span>• Adaptabilidade</span>
                        <span>• Orientação a Resultados</span>
                        <span>• Inovação</span>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Gerando Competências...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Gerar Competências Padrão
                        </>
                    )}
                </Button>

                <p className="text-xs text-slate-400 mt-4">
                    Cada competência será criada com 5 níveis de proficiência (Básico → Master)
                </p>
            </div>
        </Card>
    );
}
