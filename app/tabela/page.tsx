import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, TrendingUp, DollarSign, Target, Award } from 'lucide-react';

export default async function TabelaSalariesPage() {
    // Buscar todos os cargos com seus grades e valores de matriz
    const jobRolesRaw = await prisma.jobRole.findMany({
        where: {
            gradeId: { not: null }
        },
        include: {
            grade: {
                include: {
                    values: {
                        include: {
                            step: true
                        },
                        orderBy: {
                            step: { name: 'asc' }
                        }
                    }
                }
            }
        },
        orderBy: { totalPoints: 'desc' } // Ordenar pelos mais complexos (maior pontuação)
    });

    // Converter Decimal para número para facilitar o uso no JS
    const jobRoles = jobRolesRaw.map(job => ({
        ...job,
        grade: job.grade ? {
            ...job.grade,
            values: job.grade.values.map(v => ({
                ...v,
                amount: Number(v.amount)
            }))
        } : null
    }));

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tabela Salarial Oficial</h2>
                    <p className="text-muted-foreground">Detalhamento técnico de faixas remuneratórias por complexidade de cargo.</p>
                </div>
            </div>

            <Card className="shadow-xl border-none ring-1 ring-slate-200 overflow-hidden">
                <CardHeader className="bg-white border-b py-6">
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <Award className="w-5 h-5 text-amber-500" />
                        Estrutura de Remuneração e Pontuação
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-[280px] font-bold text-slate-700">Cargo / Área</TableHead>
                                <TableHead className="text-center font-bold text-slate-700">Pontos</TableHead>
                                <TableHead className="text-center font-bold text-slate-700">Grade</TableHead>
                                <TableHead className="text-right font-bold text-slate-700">Piso (A)</TableHead>
                                <TableHead className="text-right font-bold text-slate-700 bg-blue-50/30">Midpoint (Alvo)</TableHead>
                                <TableHead className="text-right font-bold text-slate-700">Teto (Final)</TableHead>
                                <TableHead className="text-right font-bold text-slate-700">Amplitude</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobRoles.map((job) => {
                                const values = job.grade?.values || [];
                                const minVal = values[0]?.amount || 0;
                                const maxVal = values[values.length - 1]?.amount || 0;

                                // Calcular Midpoint (geralmente o step do meio, ex: Step E ou F)
                                const midIndex = Math.floor(values.length / 2);
                                const midVal = values[midIndex]?.amount || (minVal + maxVal) / 2;

                                const spread = minVal > 0 ? ((maxVal - minVal) / minVal) * 100 : 0;

                                return (
                                    <TableRow key={job.id} className="hover:bg-slate-50 transition-colors group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{job.department || 'Geral'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold border border-slate-200">
                                                {job.totalPoints} pts
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-mono text-[11px] bg-white border-slate-200">
                                                {job.grade?.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-slate-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(minVal)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm font-bold text-blue-700 bg-blue-50/20">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(midVal)}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm text-slate-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(maxVal)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1 text-slate-500 font-bold text-xs">
                                                {spread.toFixed(0)}%
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Cargos</p>
                            <p className="text-2xl font-bold">{jobRoles.length}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Pontos (Máx)</p>
                            <p className="text-2xl font-bold">{Math.max(...jobRoles.map(j => j.totalPoints), 0)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Amplitude Média</p>
                            <p className="text-2xl font-bold">45%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Step Alvo (Mid)</p>
                            <p className="text-sm font-bold text-slate-600">Referência Mercado</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
