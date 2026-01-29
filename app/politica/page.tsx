import { getPolicyOverview } from "@/app/actions/policy";
import { PolicyDocument } from "@/components/policy/policy-document";

export default async function PoliticaPage() {
    const data = await getPolicyOverview();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-10 animate-in fade-in duration-500">
            <PolicyDocument data={data} />
        </div>
    );
}
