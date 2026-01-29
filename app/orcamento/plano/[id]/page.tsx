import { getBudgetPlanDetails, getAvailableDepartments } from "@/app/actions/budget-plan";
import { BudgetPlanDetail } from "@/components/budget/budget-plan-detail";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function BudgetPlanPage({ params }: PageProps) {
    const { id } = await params;

    // Carregar dados em paralelo
    const [plan, departments] = await Promise.all([
        getBudgetPlanDetails(id),
        getAvailableDepartments()
    ]);

    if (!plan) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 animate-in fade-in duration-500">
            <BudgetPlanDetail plan={plan} availableDepartments={departments} />
        </div>
    );
}
