'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Book, Plus, Settings, Printer, Download, ChevronRight, FileText,
    LayoutList, DollarSign, CheckCircle, Building2, Users, Award,
    TrendingUp, Target, Scale, Calendar, BookOpen, List, Eye, Edit3,
    ArrowLeft, ArrowRight, Menu, X, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Estrutura completa do Manual - Hardcoded para garantir funcionamento
const MANUAL_STRUCTURE = [
    {
        id: 'capa',
        chapter: 0,
        title: 'Capa',
        type: 'COVER'
    },
    {
        id: 'indice',
        chapter: 0,
        title: 'Índice',
        type: 'INDEX'
    },
    {
        id: 'cap1',
        chapter: 1,
        title: 'Introdução e Objetivos',
        type: 'TEXT',
        content: `
            <h2>1.1 Apresentação</h2>
            <p>O presente Manual de Cargos e Salários estabelece as diretrizes, políticas e procedimentos que regem a gestão de pessoas no que tange à estrutura de cargos, remuneração e desenvolvimento de carreira.</p>
            
            <h2>1.2 Objetivos</h2>
            <ul>
                <li><strong>Transparência:</strong> Garantir clareza nas regras de remuneração e progressão.</li>
                <li><strong>Equidade Interna:</strong> Assegurar que cargos de mesma complexidade recebam remuneração equivalente.</li>
                <li><strong>Competitividade Externa:</strong> Manter salários alinhados ao mercado para atrair e reter talentos.</li>
                <li><strong>Meritocracia:</strong> Valorizar o desempenho e as competências dos colaboradores.</li>
            </ul>

            <h2>1.3 Abrangência</h2>
            <p>Este manual aplica-se a todos os colaboradores contratados sob regime CLT, bem como serve de referência para contratações PJ quando aplicável.</p>

            <h2>1.4 Vigência</h2>
            <p>O presente manual entra em vigor na data de sua aprovação e permanece válido até que seja formalmente substituído por nova versão.</p>
        `
    },
    {
        id: 'cap2',
        chapter: 2,
        title: 'Metodologia de Avaliação de Cargos',
        type: 'TEXT',
        content: `
            <h2>2.1 Sistema de Pontos por Fatores</h2>
            <p>A avaliação de cargos é realizada através do método de <strong>Pontos por Fatores</strong>, que considera múltiplas dimensões do trabalho para estabelecer hierarquias justas.</p>

            <h2>2.2 Fatores de Avaliação</h2>
            <p>Os fatores utilizados na avaliação são:</p>
            <table class="manual-table">
                <thead>
                    <tr>
                        <th>Fator</th>
                        <th>Descrição</th>
                        <th>Peso</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Escolaridade</strong></td>
                        <td>Nível de formação acadêmica exigido</td>
                        <td>25%</td>
                    </tr>
                    <tr>
                        <td><strong>Experiência</strong></td>
                        <td>Tempo de prática profissional necessário</td>
                        <td>20%</td>
                    </tr>
                    <tr>
                        <td><strong>Complexidade</strong></td>
                        <td>Grau de dificuldade das tarefas</td>
                        <td>20%</td>
                    </tr>
                    <tr>
                        <td><strong>Responsabilidade</strong></td>
                        <td>Impacto das decisões e supervisão</td>
                        <td>20%</td>
                    </tr>
                    <tr>
                        <td><strong>Autonomia</strong></td>
                        <td>Nível de independência na execução</td>
                        <td>15%</td>
                    </tr>
                </tbody>
            </table>

            <h2>2.3 Processo de Pontuação</h2>
            <p>Cada cargo é avaliado em todos os fatores, recebendo uma pontuação que, somada, determina seu posicionamento na estrutura salarial (Grade).</p>
        `
    },
    {
        id: 'cap3',
        chapter: 3,
        title: 'Estrutura de Cargos',
        type: 'TEXT',
        content: `
            <h2>3.1 Nomenclatura e Hierarquia</h2>
            <p>Os cargos são organizados em níveis hierárquicos que refletem a progressão de carreira:</p>

            <div class="hierarchy-box">
                <div class="hierarchy-level level-1">Diretoria / C-Level</div>
                <div class="hierarchy-level level-2">Gerência</div>
                <div class="hierarchy-level level-3">Coordenação / Supervisão</div>
                <div class="hierarchy-level level-4">Especialistas / Analistas Sênior</div>
                <div class="hierarchy-level level-5">Analistas Pleno</div>
                <div class="hierarchy-level level-6">Analistas Júnior / Assistentes</div>
                <div class="hierarchy-level level-7">Auxiliares / Estagiários</div>
            </div>

            <h2>3.2 Famílias de Cargos</h2>
            <p>Os cargos estão agrupados em famílias funcionais:</p>
            <ul>
                <li><strong>Administrativa:</strong> Suporte, Finanças, RH, Jurídico</li>
                <li><strong>Operacional:</strong> Produção, Logística, Qualidade</li>
                <li><strong>Comercial:</strong> Vendas, Marketing, Atendimento</li>
                <li><strong>Técnica:</strong> TI, Engenharia, P&D</li>
            </ul>

            <h2>3.3 Descrição de Cargos</h2>
            <p>Cada cargo possui uma ficha descritiva contendo:</p>
            <ul>
                <li>Missão e objetivo do cargo</li>
                <li>Principais responsabilidades</li>
                <li>Requisitos mínimos (escolaridade, experiência)</li>
                <li>Competências técnicas e comportamentais</li>
                <li>Subordinação e supervisão</li>
            </ul>
        `
    },
    {
        id: 'cap4',
        chapter: 4,
        title: 'Tabela Salarial',
        type: 'SALARY_TABLE',
        content: `
            <h2>4.1 Estrutura de Grades e Steps</h2>
            <p>A tabela salarial é composta por <strong>Grades</strong> (faixas verticais baseadas na pontuação do cargo) e <strong>Steps</strong> (faixas horizontais para progressão por mérito).</p>

            <h2>4.2 Tabela Vigente</h2>
            <p>Os valores abaixo representam a remuneração base mensal (salário bruto):</p>
        `
    },
    {
        id: 'cap5',
        chapter: 5,
        title: 'Política de Progressão',
        type: 'TEXT',
        content: `
            <h2>5.1 Progressão Horizontal (Step)</h2>
            <p>A progressão horizontal ocorre dentro da mesma Grade, avançando de Step. Critérios:</p>
            <ul>
                <li>Tempo mínimo de <strong>12 meses</strong> no Step atual</li>
                <li>Avaliação de desempenho mínima de <strong>3.5</strong> (escala 1-5)</li>
                <li>Disponibilidade orçamentária</li>
            </ul>

            <h2>5.2 Progressão Vertical (Promoção)</h2>
            <p>A promoção para cargo de Grade superior requer:</p>
            <ul>
                <li>Vaga disponível na estrutura</li>
                <li>Cumprimento dos requisitos do novo cargo</li>
                <li>Aprovação em processo seletivo interno (quando aplicável)</li>
                <li>Histórico de desempenho consistente</li>
            </ul>

            <h2>5.3 Reajustes Coletivos</h2>
            <p>Anualmente, a tabela salarial é revisada considerando:</p>
            <ul>
                <li>Índices inflacionários (INPC/IPCA)</li>
                <li>Acordos coletivos sindicais</li>
                <li>Pesquisas de mercado</li>
            </ul>
        `
    },
    {
        id: 'cap6',
        chapter: 6,
        title: 'Benefícios',
        type: 'TEXT',
        content: `
            <h2>6.1 Pacote de Benefícios</h2>
            <p>Além da remuneração fixa, a empresa oferece:</p>

            <table class="manual-table">
                <thead>
                    <tr>
                        <th>Benefício</th>
                        <th>Descrição</th>
                        <th>Elegibilidade</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Vale Refeição</strong></td>
                        <td>Crédito mensal para alimentação</td>
                        <td>Todos CLT</td>
                    </tr>
                    <tr>
                        <td><strong>Vale Transporte</strong></td>
                        <td>Custeio de deslocamento casa-trabalho</td>
                        <td>Todos CLT</td>
                    </tr>
                    <tr>
                        <td><strong>Plano de Saúde</strong></td>
                        <td>Cobertura médica e hospitalar</td>
                        <td>Todos CLT</td>
                    </tr>
                    <tr>
                        <td><strong>Plano Odontológico</strong></td>
                        <td>Cobertura odontológica</td>
                        <td>Todos CLT</td>
                    </tr>
                    <tr>
                        <td><strong>Seguro de Vida</strong></td>
                        <td>Cobertura em caso de sinistro</td>
                        <td>Todos CLT</td>
                    </tr>
                    <tr>
                        <td><strong>PLR</strong></td>
                        <td>Participação nos Lucros e Resultados</td>
                        <td>Conforme acordo</td>
                    </tr>
                </tbody>
            </table>
        `
    },
    {
        id: 'cap7',
        chapter: 7,
        title: 'Avaliação de Desempenho',
        type: 'TEXT',
        content: `
            <h2>7.1 Ciclo de Avaliação</h2>
            <p>A avaliação de desempenho ocorre <strong>anualmente</strong>, com feedback contínuo ao longo do ano.</p>

            <h2>7.2 Dimensões Avaliadas</h2>
            <ul>
                <li><strong>Metas e Resultados:</strong> Atingimento dos objetivos estabelecidos</li>
                <li><strong>Competências Técnicas:</strong> Domínio das habilidades do cargo</li>
                <li><strong>Competências Comportamentais:</strong> Alinhamento aos valores da empresa</li>
            </ul>

            <h2>7.3 Escala de Avaliação</h2>
            <table class="manual-table compact">
                <tbody>
                    <tr><td><strong>5 - Excepcional</strong></td><td>Supera consistentemente as expectativas</td></tr>
                    <tr><td><strong>4 - Acima do Esperado</strong></td><td>Frequentemente supera as expectativas</td></tr>
                    <tr><td><strong>3 - Atende às Expectativas</strong></td><td>Entrega conforme esperado</td></tr>
                    <tr><td><strong>2 - Parcialmente Atende</strong></td><td>Necessita desenvolvimento</td></tr>
                    <tr><td><strong>1 - Não Atende</strong></td><td>Desempenho insatisfatório</td></tr>
                </tbody>
            </table>

            <h2>7.4 Consequências</h2>
            <p>A avaliação influencia diretamente nas decisões de progressão salarial, promoções e planos de desenvolvimento individual.</p>
        `
    },
    {
        id: 'cap8',
        chapter: 8,
        title: 'Disposições Finais',
        type: 'TEXT',
        content: `
            <h2>8.1 Casos Omissos</h2>
            <p>Situações não previstas neste manual serão analisadas pela área de Recursos Humanos em conjunto com a Diretoria.</p>

            <h2>8.2 Revisões</h2>
            <p>Este manual será revisado anualmente ou sempre que houver alterações significativas na estratégia organizacional.</p>

            <h2>8.3 Aprovação</h2>
            <div class="signature-box">
                <div class="signature-line">
                    <span class="signature-name">_______________________________</span>
                    <span class="signature-role">Diretor(a) de RH</span>
                </div>
                <div class="signature-line">
                    <span class="signature-name">_______________________________</span>
                    <span class="signature-role">Diretor(a) Geral</span>
                </div>
                <p class="signature-date">Data de Aprovação: ____/____/________</p>
            </div>
        `
    }
];

export default function ManualPage() {
    const [currentSection, setCurrentSection] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState<'read' | 'edit'>('read');

    const section = MANUAL_STRUCTURE[currentSection];
    const totalSections = MANUAL_STRUCTURE.length;

    const goToSection = (index: number) => {
        if (index >= 0 && index < totalSections) {
            setCurrentSection(index);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderCover = () => (
        <div className="min-h-[800px] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-16 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 text-blue-300 text-sm font-bold uppercase tracking-[0.3em] mb-4">
                    <Building2 className="w-5 h-5" />
                    Documento Oficial
                </div>
            </div>

            <div className="relative z-10 text-center py-20">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                    <Book className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
                    Manual de Cargos<br />e Salários
                </h1>
                <p className="text-xl text-blue-200 font-medium">
                    Política de Remuneração e Carreira
                </p>
            </div>

            <div className="relative z-10 flex justify-between items-end text-sm text-blue-300">
                <div>
                    <p className="font-bold text-white">Versão 2026.1</p>
                    <p>Vigência: Janeiro de 2026</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-white">CONFIDENCIAL</p>
                    <p>Uso Interno</p>
                </div>
            </div>
        </div>
    );

    const renderIndex = () => (
        <div className="space-y-8">
            <h1 className="text-4xl font-black text-slate-900 border-b-4 border-blue-600 pb-4 inline-block">
                Índice
            </h1>

            <div className="space-y-3">
                {MANUAL_STRUCTURE.filter(s => s.chapter > 0).map((s, idx) => (
                    <button
                        key={s.id}
                        onClick={() => goToSection(MANUAL_STRUCTURE.findIndex(x => x.id === s.id))}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-blue-50 transition-colors group text-left"
                    >
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {s.chapter}
                            </span>
                            <span className="text-lg font-semibold text-slate-700 group-hover:text-blue-700">
                                {s.title}
                            </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSalaryTable = () => (
        <div className="space-y-8">
            <div dangerouslySetInnerHTML={{ __html: section.content || '' }} className="prose prose-slate max-w-none" />

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left font-bold">Grade</th>
                            <th className="px-4 py-4 text-center font-bold">Step A</th>
                            <th className="px-4 py-4 text-center font-bold">Step B</th>
                            <th className="px-4 py-4 text-center font-bold">Step C</th>
                            <th className="px-4 py-4 text-center font-bold">Step D</th>
                            <th className="px-4 py-4 text-center font-bold">Step E</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { grade: '10 - Diretoria', base: 25000 },
                            { grade: '9 - Gerência Sr', base: 18000 },
                            { grade: '8 - Gerência', base: 14000 },
                            { grade: '7 - Coordenação', base: 10000 },
                            { grade: '6 - Especialista', base: 8000 },
                            { grade: '5 - Analista Sr', base: 6500 },
                            { grade: '4 - Analista Pl', base: 5000 },
                            { grade: '3 - Analista Jr', base: 3800 },
                            { grade: '2 - Assistente', base: 2800 },
                            { grade: '1 - Auxiliar', base: 2000 },
                        ].map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="px-6 py-4 font-bold text-slate-800">{row.grade}</td>
                                {[0, 1, 2, 3, 4].map(step => {
                                    const val = row.base * (1 + step * 0.05);
                                    return (
                                        <td key={step} className="px-4 py-4 text-center font-mono text-slate-700">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Nota:</strong> Valores vigentes a partir de Janeiro/2026. Sujeito a reajustes conforme política e acordos coletivos.
            </div>
        </div>
    );

    const renderContent = () => {
        if (section.type === 'COVER') return renderCover();
        if (section.type === 'INDEX') return renderIndex();
        if (section.type === 'SALARY_TABLE') return renderSalaryTable();

        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                    <span className="text-6xl font-black text-blue-600">{section.chapter}</span>
                    <h1 className="text-3xl font-bold text-slate-900">{section.title}</h1>
                </div>
                <div
                    className="prose prose-slate prose-lg max-w-none
                        prose-headings:font-bold prose-headings:text-slate-800
                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-800
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-li:text-slate-600
                        prose-strong:text-slate-800
                        prose-table:border prose-table:border-slate-200
                        prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-bold
                        prose-td:p-3 prose-td:border-t prose-td:border-slate-100
                    "
                    dangerouslySetInnerHTML={{ __html: section.content || '' }}
                />
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden">

            {/* Sidebar */}
            <div className={cn(
                "bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300 shadow-xl z-20",
                sidebarOpen ? "w-80" : "w-0 overflow-hidden"
            )}>
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                            <Book className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg">Manual PCCS</h1>
                            <p className="text-xs text-slate-300">Versão 2026.1</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {MANUAL_STRUCTURE.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => goToSection(idx)}
                            className={cn(
                                "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3",
                                currentSection === idx
                                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <span className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
                                currentSection === idx ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                            )}>
                                {s.chapter || '•'}
                            </span>
                            <span className="truncate flex-1">{s.title}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-slate-100 space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2">
                        <Printer className="w-4 h-4" /> Exportar PDF
                    </Button>
                </div>
            </div>

            {/* Toggle Sidebar */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-30 bg-white shadow-lg rounded-full p-2 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-100">
                <div className="max-w-4xl mx-auto py-12 px-8">
                    {/* Document Container */}
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-12 md:p-16">
                            {renderContent()}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 px-4">
                        <Button
                            variant="ghost"
                            onClick={() => goToSection(currentSection - 1)}
                            disabled={currentSection === 0}
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Anterior
                        </Button>

                        <span className="text-sm text-slate-400">
                            {currentSection + 1} de {totalSections}
                        </span>

                        <Button
                            variant="ghost"
                            onClick={() => goToSection(currentSection + 1)}
                            disabled={currentSection === totalSections - 1}
                            className="gap-2"
                        >
                            Próximo <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
