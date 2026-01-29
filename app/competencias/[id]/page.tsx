import { getCompetency } from "@/app/actions/competencies";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Essa página seria para editar detalhes de uma competência
// Por ora, redireciona para a lista
export default async function CompetencyDetailPage({ params }: PageProps) {
    const { id } = await params;

    const competency = await getCompetency(id);

    if (!competency) {
        notFound();
    }

    // Por agora redireciona - poderia ser uma página de detalhes
    redirect('/competencias');
}
