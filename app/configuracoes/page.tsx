import { Settings, Save, AlertTriangle, ShieldCheck, Gift, Percent } from 'lucide-react';
import { FactorsManager } from '@/components/factors-manager';
import { BenefitsManager } from '@/components/benefits-manager';
import { TaxManager } from '@/components/settings/tax-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ConfigPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">Configurações</h2>
                    <p className="text-muted-foreground mt-2">Personalize os parâmetros de RH e benefícios da empresa.</p>
                </div>
            </div>

            <Tabs defaultValue="geral" className="w-full">
                <TabsList className="bg-slate-100 p-1 mb-8">
                    <TabsTrigger value="geral" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Geral & Fatores
                    </TabsTrigger>
                    <TabsTrigger value="encargos" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Percent className="w-4 h-4 mr-2" /> Encargos
                    </TabsTrigger>
                    <TabsTrigger value="beneficios" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Gift className="w-4 h-4 mr-2" /> Benefícios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-6">
                            <div className="rounded-xl border bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                                    <Settings className="w-5 h-5 text-slate-400" />
                                    Parâmetros do Plano
                                </h3>

                                <div className="space-y-4 text-sm text-slate-600">
                                    <p>O PCCS DOM Seven utiliza uma base de 220 horas mensais para cálculos de salário/hora, configurada no setup inicial.</p>
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700">
                                        <ShieldCheck className="w-5 h-5" />
                                        <span className="font-medium">Legislação Brasileira 2026</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-white p-6 shadow-sm">
                                <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-red-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    Manutenção
                                </h3>
                                <p className="text-sm text-muted-foreground mb-6">Ações críticas para reset da estrutura.</p>

                                <button className="w-full rounded-lg border-2 border-red-100 text-red-600 hover:bg-red-50 p-3 text-sm font-bold transition-all">
                                    Redefinir Pontuações e Fatores
                                </button>
                            </div>
                        </div>

                        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                            <FactorsManager />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="encargos" className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <TaxManager />
                </TabsContent>

                <TabsContent value="beneficios" className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <BenefitsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
