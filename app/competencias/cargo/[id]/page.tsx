import { getJobCompetencies } from "@/app/actions/competencies";
import { JobCompetenciesEditor } from "@/components/competencies/job-competencies-editor";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobCompetenciesPage({ params }: PageProps) {
    const { id } = await params;

    const data = await getJobCompetencies(id);

    if (!data) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 animate-in fade-in duration-500">
            <JobCompetenciesEditor data={data} />
        </div>
    );
}
