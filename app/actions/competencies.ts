'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ============================
// TIPOS
// ============================

export interface CompetencyDTO {
    id: string;
    name: string;
    description: string | null;
    category: 'TECHNICAL' | 'BEHAVIORAL' | 'ORGANIZATIONAL';
    critical: boolean;
    levels: {
        id: string;
        level: number;
        name: string;
        description: string | null;
        indicators: string | null;
    }[];
    usageCount: number; // Quantos cargos usam essa competência
    createdAt: Date;
    updatedAt: Date;
}

export interface CompetencyListItem {
    id: string;
    name: string;
    category: string;
    critical: boolean;
    levelsCount: number;
    usageCount: number;
}

export interface JobCompetencyMatrixItem {
    jobRoleId: string;
    jobTitle: string;
    department: string | null;
    grade: string | null;
    competencies: {
        competencyId: string;
        competencyName: string;
        category: string;
        levelId: string;
        levelName: string;
        levelNumber: number;
        required: boolean;
        weight: number;
    }[];
}

export interface CompetencyMatrixOverview {
    totalCompetencies: number;
    byCategory: {
        technical: number;
        behavioral: number;
        organizational: number;
    };
    criticalCount: number;
    rolesWithCompetencies: number;
    totalRoles: number;
    avgCompetenciesPerRole: number;
}

// ============================
// FUNÇÕES - COMPETÊNCIAS
// ============================

/**
 * Lista todas as competências
 */
export async function getCompetenciesList(): Promise<CompetencyListItem[]> {
    // @ts-ignore
    const competencies = await prisma.competency.findMany({
        include: {
            levels: true,
            jobCompetencies: true
        },
        orderBy: [
            { category: 'asc' },
            { name: 'asc' }
        ]
    });

    return competencies.map((c: any) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        critical: c.critical,
        levelsCount: c.levels?.length || 0,
        usageCount: c.jobCompetencies?.length || 0
    }));
}

/**
 * Obtém uma competência completa
 */
export async function getCompetency(id: string): Promise<CompetencyDTO | null> {
    // @ts-ignore
    const competency = await prisma.competency.findUnique({
        where: { id },
        include: {
            levels: { orderBy: { level: 'asc' } },
            jobCompetencies: true
        }
    });

    if (!competency) return null;

    return {
        id: competency.id,
        name: competency.name,
        description: competency.description,
        category: competency.category as any,
        critical: competency.critical,
        levels: competency.levels?.map((l: any) => ({
            id: l.id,
            level: l.level,
            name: l.name,
            description: l.description,
            indicators: l.indicators
        })) || [],
        usageCount: competency.jobCompetencies?.length || 0,
        createdAt: competency.createdAt,
        updatedAt: competency.updatedAt
    };
}

/**
 * Cria uma nova competência com níveis padrão
 */
export async function createCompetency(data: {
    name: string;
    description?: string;
    category: string;
    critical: boolean;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        // @ts-ignore
        const competency = await prisma.competency.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.category,
                critical: data.critical,
                levels: {
                    create: [
                        { level: 1, name: 'Básico', description: 'Conhecimento inicial, requer supervisão', indicators: '• Executa tarefas simples\n• Precisa de orientação frequente' },
                        { level: 2, name: 'Intermediário', description: 'Executa com autonomia parcial', indicators: '• Resolve problemas rotineiros\n• Orienta-se por procedimentos' },
                        { level: 3, name: 'Avançado', description: 'Domina a competência, trabalha sozinho', indicators: '• Resolve problemas complexos\n• Pode orientar outros' },
                        { level: 4, name: 'Expert', description: 'Referência na competência, ensina outros', indicators: '• É consultado por especialistas\n• Define padrões e metodologias' },
                        { level: 5, name: 'Master', description: 'Autoridade no tema, inovador', indicators: '• Desenvolve novos métodos\n• Reconhecimento externo' }
                    ]
                }
            }
        });

        revalidatePath('/competencias');
        return { success: true, id: competency.id };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza uma competência
 */
export async function updateCompetency(
    id: string,
    data: Partial<{ name: string; description: string; category: string; critical: boolean }>
): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.competency.update({
            where: { id },
            data
        });

        revalidatePath('/competencias');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza um nível de competência
 */
export async function updateCompetencyLevel(
    levelId: string,
    data: { name?: string; description?: string; indicators?: string }
): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.competencyLevel.update({
            where: { id: levelId },
            data
        });

        revalidatePath('/competencias');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Deleta uma competência
 */
export async function deleteCompetency(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.competency.delete({
            where: { id }
        });

        revalidatePath('/competencias');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ============================
// FUNÇÕES - MATRIZ DE COMPETÊNCIAS
// ============================

/**
 * Obtém a matriz completa de competências por cargo
 */
export async function getCompetencyMatrix(): Promise<JobCompetencyMatrixItem[]> {
    const roles = await prisma.jobRole.findMany({
        include: {
            grade: true,
            // @ts-ignore
            competencies: {
                include: {
                    competency: true,
                    competencyLevel: true
                }
            }
        },
        orderBy: [
            { department: 'asc' },
            { title: 'asc' }
        ]
    });

    return roles.map((role: any) => ({
        jobRoleId: role.id,
        jobTitle: role.title,
        department: role.department,
        grade: role.grade?.name || null,
        competencies: role.competencies?.map((jc: any) => ({
            competencyId: jc.competencyId,
            competencyName: jc.competency?.name || '',
            category: jc.competency?.category || 'TECHNICAL',
            levelId: jc.competencyLevelId,
            levelName: jc.competencyLevel?.name || '',
            levelNumber: jc.competencyLevel?.level || 1,
            required: jc.required,
            weight: jc.weight
        })) || []
    }));
}

/**
 * Obtém as competências de um cargo específico
 */
export async function getJobCompetencies(jobRoleId: string) {
    const role = await prisma.jobRole.findUnique({
        where: { id: jobRoleId },
        include: {
            grade: true,
            // @ts-ignore
            competencies: {
                include: {
                    competency: {
                        include: { levels: { orderBy: { level: 'asc' } } }
                    },
                    competencyLevel: true
                }
            }
        }
    });

    if (!role) return null;

    // @ts-ignore
    const allCompetencies = await prisma.competency.findMany({
        include: { levels: { orderBy: { level: 'asc' } } }
    });

    return {
        role: {
            id: role.id,
            title: role.title,
            department: role.department,
            grade: role.grade?.name || null
        },
        assignedCompetencies: (role as any).competencies?.map((jc: any) => ({
            id: jc.id,
            competencyId: jc.competencyId,
            competencyName: jc.competency?.name || '',
            category: jc.competency?.category || 'TECHNICAL',
            critical: jc.competency?.critical || false,
            levels: jc.competency?.levels || [],
            currentLevelId: jc.competencyLevelId,
            currentLevel: jc.competencyLevel?.level || 1,
            currentLevelName: jc.competencyLevel?.name || '',
            required: jc.required,
            weight: jc.weight
        })) || [],
        allCompetencies: allCompetencies.map((c: any) => ({
            id: c.id,
            name: c.name,
            category: c.category,
            critical: c.critical,
            levels: c.levels?.map((l: any) => ({
                id: l.id,
                level: l.level,
                name: l.name
            })) || []
        }))
    };
}

/**
 * Adiciona uma competência a um cargo
 */
export async function addCompetencyToJob(
    jobRoleId: string,
    competencyId: string,
    levelId: string,
    required: boolean = true,
    weight: number = 3
): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.jobCompetency.create({
            data: {
                jobRoleId,
                competencyId,
                competencyLevelId: levelId,
                required,
                weight
            }
        });

        revalidatePath('/competencias');
        revalidatePath(`/competencias/cargo/${jobRoleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza a competência de um cargo
 */
export async function updateJobCompetency(
    id: string,
    data: { levelId?: string; required?: boolean; weight?: number }
): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.jobCompetency.update({
            where: { id },
            data: {
                competencyLevelId: data.levelId,
                required: data.required,
                weight: data.weight
            }
        });

        revalidatePath('/competencias');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Remove uma competência de um cargo
 */
export async function removeCompetencyFromJob(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        await prisma.jobCompetency.delete({
            where: { id }
        });

        revalidatePath('/competencias');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Estatísticas gerais da matriz de competências
 */
export async function getCompetencyMatrixStats(): Promise<CompetencyMatrixOverview> {
    // @ts-ignore
    const competencies = await prisma.competency.findMany();
    const totalRoles = await prisma.jobRole.count();
    // @ts-ignore
    const jobCompetencies = await prisma.jobCompetency.findMany();

    const rolesWithCompetencies = new Set(jobCompetencies.map((jc: any) => jc.jobRoleId)).size;

    return {
        totalCompetencies: competencies.length,
        byCategory: {
            technical: competencies.filter((c: any) => c.category === 'TECHNICAL').length,
            behavioral: competencies.filter((c: any) => c.category === 'BEHAVIORAL').length,
            organizational: competencies.filter((c: any) => c.category === 'ORGANIZATIONAL').length
        },
        criticalCount: competencies.filter((c: any) => c.critical).length,
        rolesWithCompetencies,
        totalRoles,
        avgCompetenciesPerRole: rolesWithCompetencies > 0
            ? Math.round(jobCompetencies.length / rolesWithCompetencies * 10) / 10
            : 0
    };
}

/**
 * Gera competências padrão baseado na categoria do cargo
 * Não duplica competências que já existem
 */
export async function generateDefaultCompetencies(): Promise<{ success: boolean; created: number; error?: string }> {
    try {
        const defaultCompetencies = [
            // Técnicas
            { name: 'Conhecimento Técnico', category: 'TECHNICAL', critical: true, description: 'Domínio das ferramentas e métodos da área de atuação' },
            { name: 'Análise de Dados', category: 'TECHNICAL', critical: false, description: 'Capacidade de coletar, interpretar e apresentar dados' },
            { name: 'Gestão de Projetos', category: 'TECHNICAL', critical: false, description: 'Planejamento, execução e monitoramento de projetos' },
            { name: 'Tecnologia da Informação', category: 'TECHNICAL', critical: false, description: 'Uso de sistemas e ferramentas digitais' },

            // Comportamentais
            { name: 'Comunicação', category: 'BEHAVIORAL', critical: true, description: 'Capacidade de transmitir informações de forma clara e efetiva' },
            { name: 'Trabalho em Equipe', category: 'BEHAVIORAL', critical: true, description: 'Colaboração e relacionamento interpessoal' },
            { name: 'Liderança', category: 'BEHAVIORAL', critical: false, description: 'Capacidade de influenciar e desenvolver pessoas' },
            { name: 'Resolução de Problemas', category: 'BEHAVIORAL', critical: true, description: 'Identificar causas e propor soluções eficazes' },
            { name: 'Adaptabilidade', category: 'BEHAVIORAL', critical: false, description: 'Flexibilidade para lidar com mudanças' },

            // Organizacionais
            { name: 'Visão Estratégica', category: 'ORGANIZATIONAL', critical: false, description: 'Compreensão do negócio e alinhamento estratégico' },
            { name: 'Orientação a Resultados', category: 'ORGANIZATIONAL', critical: true, description: 'Foco em entregas e metas' },
            { name: 'Inovação', category: 'ORGANIZATIONAL', critical: false, description: 'Proposição de melhorias e novas ideias' }
        ];

        // Buscar competências existentes
        // @ts-ignore
        const existing = await prisma.competency.findMany({
            select: { name: true }
        });
        const existingNames = new Set(existing.map((c: any) => c.name.toLowerCase()));

        let created = 0;
        for (const comp of defaultCompetencies) {
            // Verifica se já existe (case insensitive)
            if (!existingNames.has(comp.name.toLowerCase())) {
                await createCompetency(comp);
                created++;
            }
        }

        revalidatePath('/competencias');
        return { success: true, created };
    } catch (error: any) {
        return { success: false, created: 0, error: error.message };
    }
}

// ============================
// FUNÇÕES - SUGESTÃO IA
// ============================

export interface AICompetencySuggestion {
    competencyId: string;
    competencyName: string;
    category: string;
    suggestedLevel: number;
    suggestedLevelId: string;
    suggestedLevelName: string;
    required: boolean;
    weight: number;
    reason: string;
    confidence: number; // 0-100
}

/**
 * Sistema de IA para sugerir competências baseado no cargo
 * Analisa: título, departamento, CBO, hierarquia e tendências 2026
 */
export async function suggestCompetenciesWithAI(jobRoleId: string): Promise<{
    suggestions: AICompetencySuggestion[];
    analysis: {
        title: string;
        department: string | null;
        cbo: string | null;
        isLeadership: boolean;
        seniority: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'SPECIALIST' | 'LEADERSHIP';
    };
}> {
    // Buscar dados do cargo
    const role = await prisma.jobRole.findUnique({
        where: { id: jobRoleId },
        include: {
            grade: true,
            reportsTo: true,
            // @ts-ignore
            subordinates: true,
            // @ts-ignore
            competencies: true
        }
    });

    if (!role) {
        return { suggestions: [], analysis: { title: '', department: null, cbo: null, isLeadership: false, seniority: 'PLENO' } };
    }

    // Buscar todas as competências disponíveis
    // @ts-ignore
    const allCompetencies = await prisma.competency.findMany({
        include: { levels: { orderBy: { level: 'asc' } } }
    });

    // IDs das competências já atribuídas
    const assignedIds = new Set((role as any).competencies?.map((c: any) => c.competencyId) || []);

    // Filtrar competências não atribuídas
    const availableCompetencies = allCompetencies.filter((c: any) => !assignedIds.has(c.id));

    // ===== ANÁLISE DO CARGO =====
    const titleLower = role.title.toLowerCase();
    const deptLower = (role.department || '').toLowerCase();
    const hasSubordinates = (role as any).subordinates?.length > 0;

    // Detectar senioridade pelo título
    let seniority: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'SPECIALIST' | 'LEADERSHIP' = 'PLENO';
    if (titleLower.includes('junior') || titleLower.includes('júnior') || titleLower.includes('trainee') || titleLower.includes('estagiário') || titleLower.includes('assistente')) {
        seniority = 'JUNIOR';
    } else if (titleLower.includes('senior') || titleLower.includes('sênior') || titleLower.includes('sr.') || titleLower.includes('sr ')) {
        seniority = 'SENIOR';
    } else if (titleLower.includes('especialista') || titleLower.includes('consultant') || titleLower.includes('arquiteto')) {
        seniority = 'SPECIALIST';
    } else if (titleLower.includes('gerente') || titleLower.includes('diretor') || titleLower.includes('coordenador') || titleLower.includes('supervisor') || titleLower.includes('líder') || titleLower.includes('chefe') || titleLower.includes('head') || hasSubordinates) {
        seniority = 'LEADERSHIP';
    }

    const isLeadership = seniority === 'LEADERSHIP';

    // Mapear senioridade para nível base
    const seniorityLevelMap = {
        'JUNIOR': 1,
        'PLENO': 2,
        'SENIOR': 3,
        'SPECIALIST': 4,
        'LEADERSHIP': 3
    };
    const baseLevel = seniorityLevelMap[seniority];

    // ===== REGRAS DE SUGESTÃO BASEADAS EM IA/MERCADO 2026 =====
    const suggestions: AICompetencySuggestion[] = [];

    // Palavras-chave por área
    const techKeywords = ['ti', 'tecnologia', 'sistemas', 'desenvolvimento', 'software', 'dados', 'analytics', 'dev', 'programador', 'analista de sistemas', 'infraestrutura', 'suporte', 'cloud'];
    const financeKeywords = ['financeiro', 'contábil', 'fiscal', 'controladoria', 'tesouraria', 'auditoria', 'custos', 'orçamento'];
    const hrKeywords = ['rh', 'recursos humanos', 'gente', 'pessoas', 'dp', 'recrutamento', 'treinamento', 'benefícios'];
    const salesKeywords = ['comercial', 'vendas', 'sales', 'negócios', 'relacionamento', 'cliente', 'account'];
    const operationsKeywords = ['operações', 'produção', 'logística', 'supply', 'qualidade', 'processos', 'industrial'];
    const marketingKeywords = ['marketing', 'comunicação', 'brand', 'mkt', 'digital', 'conteúdo', 'social'];
    const adminKeywords = ['administrativo', 'escritório', 'secretária', 'recepção', 'office'];

    // Detectar área do cargo
    const isInTech = techKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));
    const isInFinance = financeKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));
    const isInHR = hrKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));
    const isInSales = salesKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));
    const isInOperations = operationsKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));
    const isInMarketing = marketingKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));
    const isInAdmin = adminKeywords.some(k => titleLower.includes(k) || deptLower.includes(k));

    // Função auxiliar para criar sugestão
    const addSuggestion = (
        competencyName: string,
        levelAdjust: number,
        required: boolean,
        weight: number,
        reason: string,
        confidence: number
    ) => {
        const comp = availableCompetencies.find((c: any) => c.name.toLowerCase().includes(competencyName.toLowerCase()));
        if (comp) {
            const level = Math.max(1, Math.min(5, baseLevel + levelAdjust));
            const levelObj = comp.levels?.find((l: any) => l.level === level) || comp.levels?.[0];
            if (levelObj) {
                suggestions.push({
                    competencyId: comp.id,
                    competencyName: comp.name,
                    category: comp.category,
                    suggestedLevel: level,
                    suggestedLevelId: levelObj.id,
                    suggestedLevelName: levelObj.name,
                    required,
                    weight,
                    reason,
                    confidence
                });
            }
        }
    };

    // ===== COMPETÊNCIAS UNIVERSAIS (2026) =====
    // Todas as posições em 2026 precisam dessas competências
    addSuggestion('Comunicação', 0, true, 4, 'Essencial para todas as posições em 2026 - trabalho híbrido exige comunicação clara', 95);
    addSuggestion('Tecnologia da Informação', isInTech ? 1 : -1, true, 3, 'Literacia digital é mandatória no mercado 2026', 90);
    addSuggestion('Adaptabilidade', 0, true, 4, 'Mudanças rápidas no mercado exigem flexibilidade - tendência forte 2026', 88);

    // ===== COMPETÊNCIAS POR SENIORIDADE =====
    if (isLeadership) {
        addSuggestion('Liderança', 1, true, 5, 'Cargo de liderança exige competência avançada em gestão de pessoas', 98);
        addSuggestion('Visão Estratégica', 1, true, 5, 'Líderes precisam alinhar equipes aos objetivos organizacionais', 95);
        addSuggestion('Gestão de Projetos', 0, true, 4, 'Coordenação de iniciativas e recursos', 85);
    }

    if (seniority === 'SENIOR' || seniority === 'SPECIALIST') {
        addSuggestion('Resolução de Problemas', 1, true, 5, 'Profissionais experientes são referência na solução de problemas complexos', 92);
        addSuggestion('Inovação', 0, true, 4, 'Expectativa de propor melhorias e novas abordagens', 80);
    }

    // ===== COMPETÊNCIAS POR ÁREA =====
    if (isInTech) {
        addSuggestion('Conhecimento Técnico', 1, true, 5, 'Core skill para área de tecnologia', 98);
        addSuggestion('Análise de Dados', 0, true, 4, 'Dados são fundamentais em TI em 2026', 90);
        addSuggestion('Inovação', 0, true, 4, 'Tech requer mindset inovador constante', 85);
    }

    if (isInFinance) {
        addSuggestion('Análise de Dados', 1, true, 5, 'Finanças depende de análise precisa de dados', 95);
        addSuggestion('Conhecimento Técnico', 0, true, 4, 'Domínio de ferramentas contábeis/financeiras', 90);
        addSuggestion('Orientação a Resultados', 0, true, 5, 'Foco em metas e indicadores financeiros', 88);
    }

    if (isInHR) {
        addSuggestion('Trabalho em Equipe', 1, true, 5, 'RH é sobre pessoas e relacionamentos', 95);
        addSuggestion('Comunicação', 1, true, 5, 'Comunicação é core em Recursos Humanos', 98);
        addSuggestion('Adaptabilidade', 0, true, 4, 'Políticas e práticas de RH evoluem constantemente', 85);
    }

    if (isInSales) {
        addSuggestion('Comunicação', 1, true, 5, 'Vendas exige comunicação persuasiva', 98);
        addSuggestion('Orientação a Resultados', 1, true, 5, 'Foco em metas de vendas', 95);
        addSuggestion('Trabalho em Equipe', 0, true, 4, 'Vendas complexas precisam de colaboração', 82);
    }

    if (isInOperations) {
        addSuggestion('Gestão de Projetos', 0, true, 4, 'Operações envolve gerenciar múltiplos processos', 88);
        addSuggestion('Resolução de Problemas', 0, true, 5, 'Operações lida com problemas diários', 92);
        addSuggestion('Orientação a Resultados', 0, true, 4, 'Foco em eficiência e produtividade', 85);
    }

    if (isInMarketing) {
        addSuggestion('Inovação', 1, true, 5, 'Marketing precisa de criatividade constante', 95);
        addSuggestion('Comunicação', 1, true, 5, 'Core skill de Marketing', 98);
        addSuggestion('Análise de Dados', 0, true, 4, 'Marketing data-driven é padrão em 2026', 90);
    }

    if (isInAdmin) {
        addSuggestion('Trabalho em Equipe', 0, true, 4, 'Suporte a diversas áreas', 85);
        addSuggestion('Comunicação', 0, true, 4, 'Interface com múltiplos stakeholders', 88);
    }

    // ===== COMPETÊNCIAS COMPORTAMENTAIS BASE =====
    if (!suggestions.find(s => s.competencyName.includes('Trabalho em Equipe'))) {
        addSuggestion('Trabalho em Equipe', 0, true, 3, 'Colaboração é essencial em ambientes modernos', 80);
    }
    if (!suggestions.find(s => s.competencyName.includes('Orientação a Resultados'))) {
        addSuggestion('Orientação a Resultados', 0, true, 3, 'Todas as posições devem contribuir para resultados', 75);
    }

    // Ordenar por confiança
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Limitar a 8 sugestões mais relevantes
    const topSuggestions = suggestions.slice(0, 8);

    return {
        suggestions: topSuggestions,
        analysis: {
            title: role.title,
            department: role.department,
            cbo: role.cbo,
            isLeadership,
            seniority
        }
    };
}

/**
 * Aplica as sugestões de IA selecionadas ao cargo
 */
export async function applyAISuggestions(
    jobRoleId: string,
    selectedSuggestions: {
        competencyId: string;
        levelId: string;
        required: boolean;
        weight: number;
    }[]
): Promise<{ success: boolean; added: number; error?: string }> {
    try {
        let added = 0;
        for (const suggestion of selectedSuggestions) {
            const result = await addCompetencyToJob(
                jobRoleId,
                suggestion.competencyId,
                suggestion.levelId,
                suggestion.required,
                suggestion.weight
            );
            if (result.success) added++;
        }

        revalidatePath('/competencias');
        revalidatePath(`/competencias/cargo/${jobRoleId}`);
        return { success: true, added };
    } catch (error: any) {
        return { success: false, added: 0, error: error.message };
    }
}
