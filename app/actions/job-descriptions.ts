'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================
// TIPOS
// ============================

export interface JobDescriptionDTO {
    id: string;
    jobRoleId: string;
    jobRole: {
        id: string;
        title: string;
        department: string | null;
        area: string | null;
        cbo: string | null;
        totalPoints: number;
        grade: { name: string } | null;
        reportsTo: { title: string } | null;
        employees: { id: string; name: string }[];
    };

    // Sumário
    summary: string | null;
    objective: string | null;

    // Requisitos
    education: string | null;
    experience: string | null;
    certifications: string | null;
    technicalSkills: string | null;
    softSkills: string | null;
    languages: string | null;

    // Responsabilidades
    responsibilities: string | null;
    activities: string | null;
    kpis: string | null;

    // Contexto
    subordinatesDesc: string | null;
    interactions: string | null;
    decisions: string | null;

    // Condições
    workRegime: string | null;
    workHours: string | null;
    travelRequired: string | null;
    physicalDemands: string | null;

    // Metadata
    version: number;
    status: string;
    approvedBy: string | null;
    approvedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface JobDescriptionListItem {
    id: string;
    jobRoleId: string;
    title: string;
    department: string | null;
    cbo: string | null;
    grade: string | null;
    headcount: number;
    status: string;
    completeness: number; // Percentual de campos preenchidos
    updatedAt: Date;
}

// ============================
// FUNÇÕES
// ============================

/**
 * Lista todos os cargos com informações básicas de descrição
 */
export async function getJobDescriptionsList(): Promise<JobDescriptionListItem[]> {
    const roles = await prisma.jobRole.findMany({
        include: {
            grade: true,
            employees: true,
            // @ts-ignore
            jobDescription: true
        },
        orderBy: [
            { department: 'asc' },
            { title: 'asc' }
        ]
    });

    return roles.map((role: any) => {
        // Calcular completude da descrição
        let completeness = 0;
        const desc = role.jobDescription;

        if (desc) {
            const fields = [
                desc.summary, desc.objective, desc.education, desc.experience,
                desc.responsibilities, desc.activities, desc.technicalSkills,
                desc.softSkills, desc.kpis, desc.interactions
            ];
            const filled = fields.filter(f => f && f.trim().length > 0).length;
            completeness = Math.round((filled / fields.length) * 100);
        }

        return {
            id: desc?.id || '',
            jobRoleId: role.id,
            title: role.title,
            department: role.department,
            cbo: role.cbo,
            grade: role.grade?.name || null,
            headcount: role.employees?.length || 0,
            status: desc?.status || 'EMPTY',
            completeness,
            updatedAt: desc?.updatedAt || role.updatedAt
        };
    });
}

/**
 * Obtém a descrição completa de um cargo
 */
export async function getJobDescription(jobRoleId: string): Promise<JobDescriptionDTO | null> {
    const role = await prisma.jobRole.findUnique({
        where: { id: jobRoleId },
        include: {
            grade: true,
            reportsTo: true,
            employees: { select: { id: true, name: true } },
            // @ts-ignore
            jobDescription: true
        }
    });

    if (!role) return null;

    const desc = (role as any).jobDescription;

    return {
        id: desc?.id || '',
        jobRoleId: role.id,
        jobRole: {
            id: role.id,
            title: role.title,
            department: role.department,
            area: role.area,
            cbo: role.cbo,
            totalPoints: role.totalPoints,
            grade: role.grade ? { name: role.grade.name } : null,
            reportsTo: role.reportsTo ? { title: role.reportsTo.title } : null,
            employees: role.employees?.map((e: any) => ({
                id: e.id,
                name: e.name
            })) || []
        },
        summary: desc?.summary || null,
        objective: desc?.objective || null,
        education: desc?.education || null,
        experience: desc?.experience || null,
        certifications: desc?.certifications || null,
        technicalSkills: desc?.technicalSkills || null,
        softSkills: desc?.softSkills || null,
        languages: desc?.languages || null,
        responsibilities: desc?.responsibilities || null,
        activities: desc?.activities || null,
        kpis: desc?.kpis || null,
        subordinatesDesc: desc?.subordinatesDesc || null,
        interactions: desc?.interactions || null,
        decisions: desc?.decisions || null,
        workRegime: desc?.workRegime || null,
        workHours: desc?.workHours || null,
        travelRequired: desc?.travelRequired || null,
        physicalDemands: desc?.physicalDemands || null,
        version: desc?.version || 1,
        status: desc?.status || 'DRAFT',
        approvedBy: desc?.approvedBy || null,
        approvedAt: desc?.approvedAt || null,
        createdAt: desc?.createdAt || new Date(),
        updatedAt: desc?.updatedAt || new Date()
    };
}

/**
 * Salva ou atualiza a descrição de um cargo
 */
export async function saveJobDescription(
    jobRoleId: string,
    data: Partial<Omit<JobDescriptionDTO, 'id' | 'jobRoleId' | 'jobRole' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        // Verificar se já existe descrição
        // @ts-ignore
        const existing = await prisma.jobDescription.findUnique({
            where: { jobRoleId }
        });

        // @ts-ignore
        const result = await prisma.jobDescription.upsert({
            where: { jobRoleId },
            create: {
                jobRoleId,
                summary: data.summary,
                objective: data.objective,
                education: data.education,
                experience: data.experience,
                certifications: data.certifications,
                technicalSkills: data.technicalSkills,
                softSkills: data.softSkills,
                languages: data.languages,
                responsibilities: data.responsibilities,
                activities: data.activities,
                kpis: data.kpis,
                subordinatesDesc: data.subordinatesDesc,
                interactions: data.interactions,
                decisions: data.decisions,
                workRegime: data.workRegime,
                workHours: data.workHours,
                travelRequired: data.travelRequired,
                physicalDemands: data.physicalDemands,
                status: data.status || 'DRAFT',
                version: 1
            },
            update: {
                summary: data.summary,
                objective: data.objective,
                education: data.education,
                experience: data.experience,
                certifications: data.certifications,
                technicalSkills: data.technicalSkills,
                softSkills: data.softSkills,
                languages: data.languages,
                responsibilities: data.responsibilities,
                activities: data.activities,
                kpis: data.kpis,
                subordinatesDesc: data.subordinatesDesc,
                interactions: data.interactions,
                decisions: data.decisions,
                workRegime: data.workRegime,
                workHours: data.workHours,
                travelRequired: data.travelRequired,
                physicalDemands: data.physicalDemands,
                status: data.status,
                version: existing ? existing.version + 1 : 1
            }
        });

        revalidatePath('/descricoes');
        revalidatePath(`/descricoes/${jobRoleId}`);

        return { success: true, id: result.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza o status da descrição (DRAFT -> REVIEW -> APPROVED)
 */
export async function updateDescriptionStatus(
    jobRoleId: string,
    status: 'DRAFT' | 'REVIEW' | 'APPROVED',
    approvedBy?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.jobDescription.update({
            where: { jobRoleId },
            data: {
                status,
                approvedBy: status === 'APPROVED' ? approvedBy : null,
                approvedAt: status === 'APPROVED' ? new Date() : null
            }
        });

        revalidatePath('/descricoes');
        revalidatePath(`/descricoes/${jobRoleId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Gera um template inicial para a descrição de um cargo
 */
export async function generateDescriptionTemplate(jobRoleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const role = await prisma.jobRole.findUnique({
            where: { id: jobRoleId },
            include: {
                grade: true,
                reportsTo: true,
                subordinates: true,
                scores: {
                    include: { factorLevel: { include: { factor: true } } }
                }
            }
        });

        if (!role) {
            return { success: false, error: 'Cargo não encontrado' };
        }

        // Gerar template baseado nos dados existentes
        const subordinatesCount = role.subordinates?.length || 0;
        const supervisorTitle = role.reportsTo?.title || 'Diretoria';

        // Extrair níveis de fatores para requisitos
        let educationLevel = '';
        let experienceLevel = '';

        role.scores?.forEach((score: any) => {
            const factorName = score.factorLevel?.factor?.name?.toLowerCase() || '';
            if (factorName.includes('escolaridade') || factorName.includes('educação')) {
                educationLevel = score.factorLevel?.description || '';
            }
            if (factorName.includes('experiência')) {
                experienceLevel = score.factorLevel?.description || '';
            }
        });

        const template = {
            summary: `O ${role.title} é responsável por ${role.description || 'atividades estratégicas'} no departamento de ${role.department || 'sua área'}.`,
            objective: `Garantir a excelência na execução das atividades de ${role.area || role.department || 'sua área'}, contribuindo para os objetivos estratégicos da organização.`,
            education: educationLevel || 'Ensino Superior Completo',
            experience: experienceLevel || 'Experiência mínima de 2 anos na área ou função similar',
            technicalSkills: '• Conhecimento em ferramentas da área\n• Domínio de processos e metodologias\n• Habilidades analíticas',
            softSkills: '• Comunicação efetiva\n• Trabalho em equipe\n• Proatividade\n• Organização',
            responsibilities: `• Executar as atividades relacionadas à ${role.area || 'área'}\n• Reportar resultados ao ${supervisorTitle}\n• Garantir qualidade nas entregas\n• Colaborar com equipes multidisciplinares`,
            activities: '• Atividades do dia a dia\n• Reuniões e alinhamentos\n• Elaboração de relatórios\n• Acompanhamento de indicadores',
            kpis: '• Qualidade das entregas\n• Cumprimento de prazos\n• Satisfação dos stakeholders',
            subordinatesDesc: subordinatesCount > 0
                ? `Gestão de ${subordinatesCount} subordinado(s) direto(s)`
                : 'Não possui subordinados diretos',
            interactions: `• Interno: ${supervisorTitle}, pares e demais departamentos\n• Externo: Fornecedores e parceiros (conforme necessidade)`,
            decisions: role.totalPoints > 500
                ? 'Alto nível de autonomia para decisões técnicas e estratégicas'
                : role.totalPoints > 300
                    ? 'Autonomia para decisões técnicas dentro da alçada definida'
                    : 'Decisões operacionais com supervisão do gestor',
            workRegime: 'Presencial/Híbrido',
            workHours: 'Segunda a Sexta, horário comercial',
            status: 'DRAFT'
        };

        return await saveJobDescription(jobRoleId, template);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Estatísticas gerais das descrições de cargos
 */
export async function getJobDescriptionsStats() {
    // @ts-ignore
    const descriptions = await prisma.jobDescription.findMany();
    const totalRoles = await prisma.jobRole.count();

    const stats = {
        totalRoles,
        withDescription: descriptions.length,
        withoutDescription: totalRoles - descriptions.length,
        byStatus: {
            draft: descriptions.filter((d: any) => d.status === 'DRAFT').length,
            review: descriptions.filter((d: any) => d.status === 'REVIEW').length,
            approved: descriptions.filter((d: any) => d.status === 'APPROVED').length
        }
    };

    return stats;
}
