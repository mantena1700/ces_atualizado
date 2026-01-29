
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Limpar banco (opcional, cuidado em prod)
  // await prisma.factor.deleteMany()
  // await prisma.salaryGrade.deleteMany()

  // 1. Criar Fatores e Níveis
  
  // FATOR 1: CONHECIMENTO (Peso 40%)
  const knowledge = await prisma.factor.create({
    data: {
      name: 'Conhecimento (Know-How)',
      description: 'Conjunto de conhecimentos e habilidades técnicas.',
      weight: 0.4,
      levels: {
        create: [
          { level: 1, description: 'Fundamental', points: 10 },
          { level: 2, description: 'Médio', points: 25 },
          { level: 3, description: 'Técnico/Médio Completo', points: 45 },
          { level: 4, description: 'Superior Incompleto', points: 70 },
          { level: 5, description: 'Superior Completo', points: 100 },
          { level: 6, description: 'Pós-Graduação', points: 135 },
          { level: 7, description: 'Mestrado/MBA', points: 175 },
        ]
      }
    }
  })

  // FATOR 2: RESOLUÇÃO DE PROBLEMAS (Peso 30%)
  const problemSolving = await prisma.factor.create({
    data: {
      name: 'Resolução de Problemas',
      description: 'Complexidade do pensamento exigido.',
      weight: 0.3,
      levels: {
        create: [
          { level: 1, description: 'Repetitiva', points: 10 },
          { level: 2, description: 'Padronizada', points: 25 },
          { level: 3, description: 'Semi-padronizada', points: 45 },
          { level: 4, description: 'Adaptativa', points: 70 },
          { level: 5, description: 'Criativa/Estratégica', points: 100 },
        ]
      }
    }
  })

  // FATOR 3: RESPONSABILIDADE (Peso 30%)
  // Vou criar dois sub-fatores aqui para "Autonomia" e "Impacto" como fatores separados para simplificar a visualização
  // Ou criar um único fator "Responsabilidade" e somar os conceitos. Vou criar dois para ficar mais granular.
  
  const autonomy = await prisma.factor.create({
    data: {
      name: 'Responsabilidade - Autonomia',
      description: 'Nível de supervisão recebida.',
      weight: 0.15, // Metade do peso de Responsabilidade
      levels: {
        create: [
          { level: 1, description: 'Controlada', points: 10 },
          { level: 2, description: 'Padronizada', points: 25 },
          { level: 3, description: 'Orientada', points: 50 },
          { level: 4, description: 'Diretiva', points: 80 },
          { level: 5, description: 'Estratégica', points: 120 },
        ]
      }
    }
  })

  const impact = await prisma.factor.create({
    data: {
      name: 'Responsabilidade - Impacto',
      description: 'Impacto financeiro e do erro.',
      weight: 0.15,
      levels: {
        create: [
          { level: 1, description: 'Mínimo', points: 10 },
          { level: 2, description: 'Pequeno', points: 30 },
          { level: 3, description: 'Médio', points: 60 },
          { level: 4, description: 'Grande', points: 100 },
          { level: 5, description: 'Crítico', points: 150 },
        ]
      }
    }
  })

  // 2. Criar Grades Salariais (Ranges de Pontos)
  const grades = [
    { name: 'G-01 (Operacional I)', min: 45, max: 80 },
    { name: 'G-02 (Operacional II)', min: 81, max: 130 },
    { name: 'G-03 (Tático I)', min: 131, max: 190 },
    { name: 'G-04 (Tático II)', min: 191, max: 260 },
    { name: 'G-05 (Tático III)', min: 261, max: 340 },
    { name: 'G-06 (Estratégico I)', min: 341, max: 450 },
    { name: 'G-07 (Estratégico II)', min: 451, max: 9999 },
  ]

  for (const g of grades) {
    await prisma.salaryGrade.create({
      data: {
        name: g.name,
        minPoints: g.min,
        maxPoints: g.max
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
