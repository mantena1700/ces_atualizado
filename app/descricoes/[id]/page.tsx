import { getJobDescription } from "@/app/actions/job-descriptions";
import { getJobCompetencies } from "@/app/actions/competencies";
import { JobDescriptionEditor } from "@/components/job-descriptions/job-description-editor";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface RawCompetency {
    id: string;
    competencyName: string;
    category: string;
    critical: boolean;
    currentLevel: number;
    currentLevelName: string;
    required: boolean;
    weight: number;
}

export default async function JobDescriptionPage({ params }: PageProps) {
    const { id } = await params;

    // Buscar dados em paralelo
    const [data, competenciesData] = await Promise.all([
        getJobDescription(id),
        getJobCompetencies(id)
    ]);

    if (!data) {
        notFound();
    }

    // Formatar competências para o componente
    const competencies = (competenciesData?.assignedCompetencies || []).map((c: RawCompetency) => ({
        id: c.id,
        name: c.competencyName,
        category: c.category,
        critical: c.critical,
        levelNumber: c.currentLevel,
        levelName: c.currentLevelName,
        required: c.required,
        weight: c.weight
    }));

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 animate-in fade-in duration-500">
            <JobDescriptionEditor data={data} competencies={competencies} />
        </div>
    );
}
