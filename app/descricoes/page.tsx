import { getJobDescriptionsList, getJobDescriptionsStats } from "@/app/actions/job-descriptions";
import { JobDescriptionsList } from "@/components/job-descriptions/job-descriptions-list";
import { FileText } from "lucide-react";

export default async function DescricoesPage() {
    const [items, stats] = await Promise.all([
        getJobDescriptionsList(),
        getJobDescriptionsStats()
    ]);

    return (
        <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        Descrições de Cargos
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Gerencie as descrições detalhadas de cada cargo da organização.
                    </p>
                </div>
            </div>

            {/* Lista */}
            <JobDescriptionsList items={items} stats={stats} />
        </div>
    );
}
