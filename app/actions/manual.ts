'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Tipos
export interface ManualSectionInput {
    title: string;
    content: string;
    order: number;
    type?: string;
    parentId?: string;
}

// =========================================================
// VERSÕES DO MANUAL
// =========================================================

export async function getManualVersions() {
    try {
        const versions = await prisma.manualVersion.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { sections: true }
                }
            }
        });
        return versions;
    } catch (error) {
        console.error("Erro ao buscar versões do manual:", error);
        return [];
    }
}

export async function getActiveManual() {
    try {
        // Tenta pegar o último publicado
        const published = await prisma.manualVersion.findFirst({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            include: {
                sections: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (published) return published;

        // Se não tiver, pega o rascunho mais recente
        const draft = await prisma.manualVersion.findFirst({
            orderBy: { createdAt: 'desc' },
            include: {
                sections: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        return draft;
    } catch (error) {
        console.error("Erro ao buscar manual ativo:", error);
        return null;
    }
}

export async function createManualVersion(title: string) {
    try {
        const version = await prisma.manualVersion.create({
            data: {
                title,
                status: 'DRAFT'
            }
        });
        revalidatePath('/manual');
        return { success: true, data: version };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function publishManualVersion(id: string) {
    try {
        await prisma.manualVersion.updateMany({
            where: { status: 'PUBLISHED' },
            data: { status: 'ARCHIVED' }
        });

        const version = await prisma.manualVersion.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                publishedAt: new Date(),
                effectiveDate: new Date()
            }
        });
        revalidatePath('/manual');
        return { success: true, data: version };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =========================================================
// SEÇÕES
// =========================================================

export async function getManualSections(versionId: string) {
    try {
        const sections = await prisma.manualSection.findMany({
            where: { manualVersionId: versionId },
            orderBy: { order: 'asc' }
        });
        return sections;
    } catch (error) {
        return [];
    }
}

export async function saveManualSection(id: string | null, versionId: string, data: ManualSectionInput) {
    try {
        let section;
        if (id) {
            section = await prisma.manualSection.update({
                where: { id },
                data: {
                    title: data.title,
                    content: data.content,
                    order: data.order,
                    type: data.type || 'TEXT',
                    parentId: data.parentId
                }
            });
        } else {
            section = await prisma.manualSection.create({
                data: {
                    manualVersionId: versionId,
                    title: data.title,
                    content: data.content,
                    order: data.order,
                    type: data.type || 'TEXT',
                    parentId: data.parentId
                }
            });
        }
        revalidatePath('/manual');
        return { success: true, data: section };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteSection(id: string) {
    try {
        await prisma.manualSection.delete({ where: { id } });
        revalidatePath('/manual');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// =========================================================
// GERADORES AUTOMÁTICOS
// =========================================================

export async function generateDefaultStructure(versionId: string) {
    try {
        // Apaga seções existentes para evitar duplicação se for chamado no início
        await prisma.manualSection.deleteMany({ where: { manualVersionId: versionId } });

        const structure = [
            {
                title: "1. Introdução e Objetivos",
                order: 1,
                content: `
                    <h2>1.1 Objetivo</h2>
                    <p>O Plano de Cargos e Salários tem como objetivo estabelecer uma estrutura clara e justa de remuneração...</p>
                    <h2>1.2 Abrangência</h2>
                    <p>Este manual aplica-se a todos os colaboradores...</p>
                `
            },
            {
                title: "2. Estrutura de Cargos",
                order: 2,
                content: `<p>A estrutura de cargos é organizada em Níveis Hierárquicos e Famílias...</p>`,
                type: 'TEXT'
            },
            {
                title: "3. Catálogo de Cargos",
                order: 3,
                content: "Lista detalhada de todos os cargos, requisitos e responsabilidades.",
                type: 'DYNAMIC_JOBLIST' // Flag para renderizar componente de lista
            },
            {
                title: "4. Política Salarial",
                order: 4,
                content: `
                    <h2>4.1 Tabela Salarial</h2>
                    <p>A tabela abaixo detalha as faixas salariais atuais:</p>
                `,
                type: 'DYNAMIC_SALARY_TABLE'
            },
            {
                title: "5. Avaliação de Desempenho",
                order: 5,
                content: `<p>A avaliação de desempenho ocorre anualmente...</p>`
            }
        ];

        for (const item of structure) {
            await prisma.manualSection.create({
                data: {
                    manualVersionId: versionId,
                    title: item.title,
                    content: item.content,
                    order: item.order,
                    type: item.type || 'TEXT'
                }
            });
        }

        revalidatePath('/manual');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
