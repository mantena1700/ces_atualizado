import { getCompetenciesList, getCompetencyMatrix, getCompetencyMatrixStats } from "@/app/actions/competencies";
import { CompetenciesList } from "@/components/competencies/competencies-list";
import { CompetencyMatrix } from "@/components/competencies/competency-matrix";
import { Card } from "@/components/ui/card";
import { Brain, Grid3X3, List } from "lucide-react";
import Link from "next/link";

export default async function CompetenciasPage({
    searchParams
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const params = await searchParams;
    const view = params.view || 'lista';

    const [competencies, matrix, stats] = await Promise.all([
        getCompetenciesList(),
        getCompetencyMatrix(),
        getCompetencyMatrixStats()
    ]);

    return (
        <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Brain className="w-8 h-8 text-indigo-600" />
                        Matriz de Competências
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Gerencie as competências organizacionais e mapeie os requisitos de cada cargo.
                    </p>
                </div>

                {/* Toggle de Visualização */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <Link
                        href="/competencias?view=lista"
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'lista'
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        Competências
                    </Link>
                    <Link
                        href="/competencias?view=matriz"
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'matriz'
                                ? 'bg-white shadow text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Grid3X3 className="w-4 h-4" />
                        Matriz por Cargo
                    </Link>
                </div>
            </div>

            {/* Conteúdo baseado na view */}
            {view === 'lista' ? (
                <CompetenciesList items={competencies} stats={stats} />
            ) : (
                <CompetencyMatrix matrix={matrix} stats={stats} />
            )}
        </div>
    );
}
