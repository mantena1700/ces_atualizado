import { getBudgetPlans } from "@/app/actions/budget-plan";
import { getBudgetOverview } from "@/app/actions/budget";
import { BudgetPlanList } from "@/components/budget/budget-plan-list";
import { BudgetView } from "@/components/budget/budget-view";
import { Wallet, LayoutList, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function OrcamentoPage() {
    const year = new Date().getFullYear();

    // Carregar dados em paralelo
    const [plans, budgetOverview] = await Promise.all([
        getBudgetPlans(),
        getBudgetOverview(year)
    ]);

    return (
        <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-blue-600" />
                        Gestão Orçamentária
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Planejamento e acompanhamento do orçamento de pessoal.
                    </p>
                </div>
            </div>

            {/* Tabs de Navegação */}
            <Tabs defaultValue="plans" className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <LayoutList className="w-4 h-4 mr-2" />
                        Planos Orçamentários
                    </TabsTrigger>
                    <TabsTrigger value="realtime" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Visão em Tempo Real
                    </TabsTrigger>
                </TabsList>

                {/* Aba: Planos Orçamentários (Criar, Editar, Comparar) */}
                <TabsContent value="plans" className="mt-6">
                    <BudgetPlanList plans={plans} />
                </TabsContent>

                {/* Aba: Visão Tempo Real (Antigo Dashboard por Departamento) */}
                <TabsContent value="realtime" className="mt-6">
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <strong>Visão em Tempo Real:</strong> Este painel mostra o custo atual de cada departamento baseado na folha de pagamento ativa.
                        Para definir metas e acompanhar variâncias, crie um <strong>Plano Orçamentário</strong> na aba "Planos".
                    </div>
                    <BudgetView initialData={budgetOverview} year={year} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
