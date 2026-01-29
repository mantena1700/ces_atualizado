'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
    const data = await prisma.employee.findMany({
        include: {
            jobRole: true,
            phase: true,
            benefits: { include: { benefit: true } }
        },
        orderBy: { name: 'asc' }
    });

    return data.map(emp => ({
        ...emp,
        salary: Number(emp.salary),
        benefits: emp.benefits.map(eb => ({
            ...eb,
            benefit: {
                ...eb.benefit,
                value: Number(eb.benefit.value)
            }
        }))
    }));
}

export async function createEmployee(data: {
    name: string;
    salary: number;
    jobRoleId: string | null;
    hiringType?: string;
    benefitIds?: string[];
    admissionDate?: string;
    cpf?: string;
    birthDate?: string;
    personalEmail?: string;
    phone?: string;
    zipCode?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}) {
    try {
        const employee = await prisma.employee.create({
            data: {
                name: data.name,
                salary: data.salary,
                hiringType: data.hiringType || "CLT",
                jobRoleId: data.jobRoleId || null,
                admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
                cpf: data.cpf,
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                personalEmail: data.personalEmail,
                phone: data.phone,
                zipCode: data.zipCode,
                address: data.address,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                // Inserção direta de benefícios se fornecidos
                benefits: {
                    create: data.benefitIds?.map(id => ({
                        benefit: { connect: { id } }
                    }))
                }
            }
        });
        revalidatePath('/colaboradores');
        revalidatePath('/simulacoes');
        revalidatePath('/cronograma');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateEmployee(id: string, data: {
    name: string;
    salary: number;
    jobRoleId: string | null;
    hiringType?: string;
    benefitIds?: string[];
    admissionDate?: string;
    cpf?: string;
    birthDate?: string;
    personalEmail?: string;
    phone?: string;
    zipCode?: string;
    address?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
}) {
    try {
        await prisma.employee.update({
            where: { id },
            data: {
                name: data.name,
                salary: data.salary,
                hiringType: data.hiringType || "CLT",
                jobRoleId: data.jobRoleId || null,
                admissionDate: data.admissionDate ? new Date(data.admissionDate) : undefined,
                cpf: data.cpf,
                birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                personalEmail: data.personalEmail,
                phone: data.phone,
                zipCode: data.zipCode,
                address: data.address,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state
            }
        });

        // Sincronizar benefícios (remover antigos e colocar novos)
        if (data.benefitIds !== undefined) {
            await prisma.employeeBenefit.deleteMany({
                where: { employeeId: id }
            });

            if (data.benefitIds.length > 0) {
                // Usando Promise.all com create individual para garantir compatibilidade e melhor debug
                try {
                    await Promise.all(
                        data.benefitIds.map(bid =>
                            prisma.employeeBenefit.create({
                                data: {
                                    employeeId: id,
                                    benefitId: bid
                                }
                            })
                        )
                    );
                } catch (err: any) {
                    console.error("Erro ao vincular benefícios individualmente:", err);
                    throw new Error(`Erro ao vincular benefícios: ${err.message}`);
                }
            }
        }

        revalidatePath('/colaboradores');
        revalidatePath('/simulacoes');
        revalidatePath('/cronograma');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteEmployee(id: string) {
    try {
        await prisma.employee.delete({ where: { id } });
        revalidatePath('/colaboradores');
        revalidatePath('/simulacoes');
        revalidatePath('/cronograma');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
