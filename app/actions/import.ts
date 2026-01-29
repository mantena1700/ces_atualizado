
'use server';

import { prisma } from '@/lib/prisma';

export async function importEmployees(csvData: string) {
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    const results = {
        success: 0,
        errors: [] as string[],
        total: lines.length
    };

    // Pular cabeçalho se existir
    const startIndex = lines[0].toLowerCase().includes('nome') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const parts = line.split(',').map(p => p.trim());

        if (parts.length < 2) {
            results.errors.push(`Linha ${i + 1}: Formato inválido (${line})`);
            continue;
        }

        const [nome, cargoTitulo, salarioStr] = parts;
        const salario = salarioStr ? parseFloat(salarioStr.replace('R$', '').replace('.', '').replace(',', '.')) : 0;

        try {
            // 1. Tentar achar o cargo
            let jobRole = await prisma.jobRole.findFirst({
                where: { title: { equals: cargoTitulo } } // Case sensitive warning in SQLite? Usually ok.
            });

            // Se não achar, cria um cargo "Não Classificado" ou tenta achar aproximado?
            // Por simplicidade, se não achar, cria o cargo novo para classificar depois.
            if (!jobRole) {
                jobRole = await prisma.jobRole.create({
                    data: {
                        title: cargoTitulo,
                        description: 'Importado automaticamente',
                        department: 'A Classificar'
                    }
                });
            }

            // 2. Criar funcionário
            await prisma.employee.create({
                data: {
                    name: nome,
                    salary: salario,
                    jobRoleId: jobRole.id
                }
            });

            results.success++;

        } catch (error: any) {
            console.error(error);
            results.errors.push(`Linha ${i + 1}: Erro ao salvar (${error.message})`);
        }
    }

    return results;
}
