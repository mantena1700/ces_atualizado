'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export interface TaxSetting {
    key: string;
    label: string;
    value: number; // Percentual
    description: string;
    category: 'CLT' | 'PJ';
    isCustom?: boolean;
}

const DEFAULT_TAXES: TaxSetting[] = [
    { key: 'TAX_CLT_FGTS', label: 'FGTS', value: 8.0, description: 'Fundo de Garantia por Tempo de Serviço', category: 'CLT' },
    { key: 'TAX_CLT_INSS', label: 'INSS Patronal', value: 20.0, description: 'Contribuição Previdenciária Patronal', category: 'CLT' },
    { key: 'TAX_CLT_VACATION', label: 'Férias + 1/3', value: 11.11, description: 'Provisão de Férias e Terço Constitucional', category: 'CLT' },
    { key: 'TAX_CLT_13TH', label: '13º Salário', value: 8.33, description: 'Provisão de Décimo Terceiro', category: 'CLT' },
    { key: 'TAX_CLT_OTHER', label: 'Outros Encargos (RAT/FAP/Sistema S)', value: 5.8, description: 'Outras contribuições obrigatórias', category: 'CLT' },
    { key: 'TAX_PJ_EXTRA', label: 'Custo Operacional PJ', value: 0.0, description: 'Custos extras de gestão de PJ', category: 'PJ' }
];

export async function getTaxSettings(): Promise<TaxSetting[]> {
    try {
        // @ts-ignore
        const configs = await prisma.systemConfig.findMany({
            where: {
                OR: [
                    { category: 'TAXES' },
                    { key: { startsWith: 'TAX_' } }
                ]
            }
        });

        // Mapeia o que veio do banco
        const dbTaxes: TaxSetting[] = configs.map((c: any) => {
            // Tenta inferir a categoria pela chave se não estiver explícito
            const category = c.key.includes('_PJ_') ? 'PJ' : 'CLT';
            const parts = c.description ? c.description.split('|') : [];
            const label = parts.length > 1 ? parts[0] : (category === 'PJ' ? 'Taxa Adicional' : c.key);
            const description = parts.length > 1 ? parts[1] : (c.description || '');

            return {
                key: c.key,
                label: label,
                description: description,
                value: Number(c.value),
                category: category as 'CLT' | 'PJ',
                isCustom: !DEFAULT_TAXES.find(d => d.key === c.key)
            };
        });

        // Adiciona os defaults que NÃO estão no banco ainda
        const finalTaxes = [...dbTaxes];
        DEFAULT_TAXES.forEach(def => {
            if (!finalTaxes.find(t => t.key === def.key)) {
                finalTaxes.push({ ...def, isCustom: false });
            }
        });

        return finalTaxes;
    } catch (error) {
        console.error("Erro ao buscar taxas:", error);
        return DEFAULT_TAXES;
    }
}

export async function saveTax(tax: TaxSetting) {
    try {
        // Guarda Label e Description juntos no campo description do banco, separados por pipe
        const descriptionValue = `${tax.label}|${tax.description}`;

        // @ts-ignore
        await prisma.systemConfig.upsert({
            where: { key: tax.key },
            update: {
                value: String(tax.value),
                description: descriptionValue,
                category: 'TAXES'
            },
            create: {
                key: tax.key,
                value: String(tax.value),
                description: descriptionValue,
                category: 'TAXES'
            }
        });

        revalidatePath('/configuracoes');
        revalidatePath('/colaboradores');
        return { success: true };
    } catch (error) {
        console.error("Erro ao salvar taxa:", error);
        return { success: false, error: "Erro ao salvar." };
    }
}

export async function deleteTax(key: string) {
    try {
        // @ts-ignore
        await prisma.systemConfig.delete({
            where: { key }
        });
        revalidatePath('/configuracoes');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// Mantido para compatibilidade, mas redireciona para saveTax individual
export async function saveTaxSettings(settings: { key: string, value: number }[]) {
    // Apenas atualiza valores de existentes
    try {
        for (const s of settings) {
            // @ts-ignore
            await prisma.systemConfig.updateMany({
                where: { key: s.key },
                data: { value: String(s.value) }
            });

            // Se não existe, ignora, pois esta função simplificada era só para update em massa dos defaults
        }
        revalidatePath('/configuracoes');
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
