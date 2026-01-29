import { getOrCreateEvaluation, getActiveCycle } from '@/app/actions/performance';
import { EvaluationPage } from '@/components/performance/evaluation-page';
import { redirect } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AvaliacaoFuncionarioPage({ params }: Props) {
    const { id: employeeId } = await params;

    // Buscar ciclo ativo
    const activeCycle = await getActiveCycle();

    if (!activeCycle) {
        redirect('/avaliacao');
    }

    // Buscar ou criar avaliação
    const evaluation = await getOrCreateEvaluation(employeeId, activeCycle.id);

    if (!evaluation) {
        redirect('/avaliacao');
    }

    return <EvaluationPage evaluation={evaluation} />;
}
