import { getNineBoxData } from '@/app/actions/ninebox';
import { NineBoxMatrix } from '@/components/ninebox/nine-box-matrix';
import { Grid3X3, Info } from 'lucide-react';

export default async function NineBoxPage() {
    const { success, data } = await getNineBoxData();

    if (!success || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                Erro ao carregar dados da Matriz Nine Box.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="p-8 space-y-8">
                {/* Header Premium */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Grid3X3 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm">
                                Gestão de Talentos
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Matriz Nine Box
                        </h1>
                        <p className="text-slate-500 max-w-2xl">
                            Ferramenta estratégica para análise de desempenho vs potencial.
                            Utilize esta matriz para calibrar a equipe e identificar talentos chave.
                        </p>
                    </div>
                </div>

                {/* Matrix Component */}
                <NineBoxMatrix data={data} />

                {/* Legend / Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-500 mt-8">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <strong className="block text-slate-800 mb-1">Como Funciona?</strong>
                        O eixo horizontal representa o Desempenho (Nota Final) e o vertical o Potencial.
                        Arraste ou use os controles nos cards para ajustar a classificação de potencial.
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <strong className="block text-slate-800 mb-1">Eixos</strong>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                            <li>X: Desempenho (0 a 5)</li>
                            <li>Y: Potencial (Baixo, Médio, Alto)</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <strong className="block text-slate-800 mb-1">Calibração</strong>
                        As alterações feitas aqui são salvas automaticamente no perfil do colaborador
                        e refletem no histórico de avaliações.
                    </div>
                </div>
            </div>
        </div>
    );
}
