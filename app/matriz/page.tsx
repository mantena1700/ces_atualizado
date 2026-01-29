import { getSalaryMatrix } from '@/app/actions/matrix';
import { MatrixTable } from '@/components/matrix-table';
import { MatrixToolbar } from '@/components/matrix-toolbar';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

export default async function MatrizPage() {
    const data = await getSalaryMatrix();

    // Preparar dados para o gráfico (Curva do Midpoint/Step A)
    // Assumindo Step A é o primeiro.
    const stepAId = data.steps[0]?.id;
    const chartPoints = data.grades.map((g, i) => {
        const val = data.matrix[`${g.id}_${stepAId}`] || 0;
        return { name: g.name, value: val };
    });

    // Normalização simples para SVG (0-100 height)
    const maxVal = Math.max(...chartPoints.map(p => p.value), 1000);

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Matriz Salarial</h2>
                    <p className="text-muted-foreground">Gerencie as faixas salariais e progressões horizontais.</p>
                </div>
                <div className="flex gap-2">
                    <MatrixToolbar grades={data.grades} steps={data.steps} />
                </div>
            </div>

            {/* Gráfico de Curva Salarial Simplificado */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Curva Salarial (Step Inicial)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[150px] w-full flex items-end gap-2 px-2 pt-4 relative border-b border-l">
                        {chartPoints.map((p, i) => {
                            const height = (p.value / maxVal) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative">
                                    {p.value > 0 && (
                                        <div className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 bg-background border px-1 rounded shadow-sm">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(p.value)}
                                        </div>
                                    )}
                                    <div
                                        className="w-full bg-primary/20 hover:bg-primary/50 transition-colors rounded-t-sm relative"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute top-0 w-full h-1 bg-primary/50"></div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">{p.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <MatrixTable
                grades={data.grades}
                steps={data.steps}
                matrix={data.matrix}
                roleCount={data.roleCount}
            />

            <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground bg-muted/20 p-6 rounded-lg border">
                <div>
                    <h4 className="font-semibold text-foreground mb-2">Como funciona o cálculo automático?</h4>
                    <p>Ao definir o valor do primeiro step e clicar no botão de "varinha mágica", o sistema preenche os demais steps aplicando 5% de progressão sobre o anterior.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-2">Dica de Gestão</h4>
                    <p>Mantenha uma curva suave entre as grades (linhas verticais no gráfico) para evitar sobreposição excessiva entre níveis hierárquicos.</p>
                </div>
            </div>
        </div>
    );
}
