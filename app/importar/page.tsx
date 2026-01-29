'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { importEmployees } from '@/app/actions/import';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function ImportPage() {
    const [csvData, setCsvData] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null);

    async function handleImport() {
        if (!csvData) return;
        setStatus('loading');

        try {
            const res = await importEmployees(csvData);
            setResult(res);
            setStatus('success');
        } catch (e) {
            setStatus('error');
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Importação de Funcionários</h2>
                <p className="text-muted-foreground">Importe sua folha de pagamentos atual para conectar ao PCCS.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Dados de Origem (CSV)</CardTitle>
                        <CardDescription>
                            Cole os dados do Excel aqui. Formato esperado: <br />
                            <code className="bg-muted px-1 rounded">Nome Completo, Cargo Atual, Salário (R$)</code>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <textarea
                            className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                            placeholder={`Exemplo:\nJoão da Silva, Analista Junior, 3500.00\nMaria Oliveira, Gerente de RH, 12000.50`}
                            value={csvData}
                            onChange={(e) => setCsvData(e.target.value)}
                        />

                        <div className="flex justify-end">
                            <Button
                                onClick={handleImport}
                                className="w-full md:w-auto"
                                disabled={status === 'loading' || !csvData}
                            >
                                {status === 'loading' ? 'Processando...' : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Processar Importação
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="md:col-span-2 border-2 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Relatório de Processamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3 mb-6">
                                <div className="bg-background p-4 rounded-lg border text-center">
                                    <div className="text-2xl font-bold text-slate-700">{result.total}</div>
                                    <div className="text-xs text-muted-foreground">Linhas Lidas</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{result.success}</div>
                                    <div className="text-xs text-muted-foreground">Importados</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border text-center">
                                    <div className="text-2xl font-bold text-rose-600">{result.errors.length}</div>
                                    <div className="text-xs text-muted-foreground">Falhas</div>
                                </div>
                            </div>

                            {result.errors.length > 0 && (
                                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md max-h-[150px] overflow-y-auto">
                                    <p className="font-semibold mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Erros Encontrados:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {result.errors.map((err: string, idx: number) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.success > 0 && (
                                <div className="mt-4 p-4 bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle className="w-5 h-5" />
                                    Tudo pronto! Os funcionários foram adicionados à base.
                                    <Button variant="link" className="ml-auto text-emerald-900" onClick={() => setCsvData('')}>
                                        Limpar
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
