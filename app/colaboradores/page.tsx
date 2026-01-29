'use client';

import { useState, useEffect } from 'react';
import { getEmployees } from '@/app/actions/employees';
import { getTaxSettings, TaxSetting } from '@/app/actions/settings';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search, Pencil, Plus, Users, ChevronRight, Briefcase,
    Mail, Phone, Calendar, TrendingUp, Award, Filter,
    UserCircle2, Building2, Star, MoreHorizontal
} from 'lucide-react';
import { EmployeeForm } from '@/components/employee-form';
import { EmployeeDetails } from '@/components/employee-details';
import Link from 'next/link';

export default function ColaboradoresPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [taxSettings, setTaxSettings] = useState<TaxSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');

    // Modal State
    const [showForm, setShowForm] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

    async function loadData() {
        setLoading(true);
        const [empData, taxData] = await Promise.all([
            getEmployees(),
            getTaxSettings()
        ]);
        setEmployees(empData);
        setTaxSettings(taxData);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateClick = () => {
        setEditingEmployee(null);
        setShowForm(true);
    };

    const handleEditClick = (emp: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setEditingEmployee(emp);
        setShowForm(true);
        setSelectedEmployee(null);
    };

    const handleRowClick = (emp: any) => {
        setSelectedEmployee(emp);
    };

    const handleSuccess = () => {
        setShowForm(false);
        loadData();
    };

    // Filtros
    const departments = [...new Set(employees.map(e => e.jobRole?.department).filter(Boolean))];

    const filteredEmployees = employees.filter(e => {
        const matchSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (e.jobRole?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchDept = filterDepartment === 'all' || e.jobRole?.department === filterDepartment;
        return matchSearch && matchDept;
    });

    // Estatísticas
    const stats = {
        total: employees.length,
        withRole: employees.filter(e => e.jobRoleId).length,
        avgSalary: employees.length > 0
            ? employees.reduce((acc, e) => acc + Number(e.salary || 0), 0) / employees.length
            : 0,
        departments: departments.length
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="p-8 space-y-8">
                {/* Header Premium */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Users className="w-6 h-6" />
                                </div>
                                <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">
                                    Capital Humano
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">
                                Gestão de Colaboradores
                            </h1>
                            <p className="text-blue-100 max-w-lg">
                                Prontuário completo, cargos e salários da equipe. Gerencie sua força de trabalho com inteligência.
                            </p>
                        </div>

                        <Button
                            onClick={handleCreateClick}
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg px-6"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Novo Colaborador
                        </Button>
                    </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Total</p>
                                <h3 className="text-3xl font-bold mt-1 text-slate-800">
                                    {stats.total}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">colaboradores</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Com Cargo</p>
                                <h3 className="text-3xl font-bold mt-1 text-emerald-600">
                                    {stats.withRole}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">posicionados</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Salário Médio</p>
                                <h3 className="text-2xl font-bold mt-1 text-purple-600">
                                    {formatCurrency(stats.avgSalary)}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">base mensal</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Departamentos</p>
                                <h3 className="text-3xl font-bold mt-1 text-amber-600">
                                    {stats.departments}
                                </h3>
                                <p className="text-slate-400 text-xs mt-1">áreas ativas</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filtros e Busca */}
                <Card className="p-4 bg-white border-0 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Buscar por nome ou cargo..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10"
                                />
                            </div>

                            <select
                                value={filterDepartment}
                                onChange={e => setFilterDepartment(e.target.value)}
                                className="h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todos os Departamentos</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid'
                                            ? 'bg-white shadow-sm text-slate-800'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                            ? 'bg-white shadow-sm text-slate-800'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    Lista
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Lista de Colaboradores */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <Card className="p-16 text-center bg-white border-0 shadow-lg">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">
                            Nenhum colaborador encontrado
                        </h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Adicione o primeiro colaborador para começar.'}
                        </p>
                        <Button onClick={handleCreateClick}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Colaborador
                        </Button>
                    </Card>
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredEmployees.map(emp => (
                            <Card
                                key={emp.id}
                                onClick={() => handleRowClick(emp)}
                                className="group p-5 bg-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer hover:border-blue-200 border-2 border-transparent"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-xl font-bold text-blue-600 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                                            {emp.name?.charAt(0) || <UserCircle2 className="w-7 h-7" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {emp.name}
                                            </h3>
                                            {emp.jobRole ? (
                                                <span className="text-xs text-slate-500 line-clamp-1">
                                                    {emp.jobRole.title}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-500 italic">Sem cargo</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleEditClick(emp, e)}
                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {emp.jobRole?.department && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span className="truncate">{emp.jobRole.department}</span>
                                        </div>
                                    )}
                                    {emp.personalEmail && (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{emp.personalEmail}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-lg font-bold text-slate-800">
                                        {formatCurrency(Number(emp.salary || 0))}
                                    </span>
                                    {emp.jobRole?.grade && (
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                            {emp.jobRole.grade.name}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    // List View
                    <Card className="overflow-hidden bg-white border-0 shadow-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-slate-600">Colaborador</th>
                                    <th className="p-4 text-left font-semibold text-slate-600">Cargo</th>
                                    <th className="p-4 text-left font-semibold text-slate-600">Departamento</th>
                                    <th className="p-4 text-right font-semibold text-slate-600">Salário</th>
                                    <th className="p-4 text-right font-semibold text-slate-600"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map(emp => (
                                    <tr
                                        key={emp.id}
                                        onClick={() => handleRowClick(emp)}
                                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-bold text-blue-600">
                                                    {emp.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{emp.name}</div>
                                                    {emp.personalEmail && (
                                                        <div className="text-xs text-slate-400">{emp.personalEmail}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {emp.jobRole ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                                                    {emp.jobRole.title}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">Não definido</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-600">
                                            {emp.jobRole?.department || '-'}
                                        </td>
                                        <td className="p-4 text-right font-mono font-semibold text-slate-800">
                                            {formatCurrency(Number(emp.salary || 0))}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={(e) => handleEditClick(emp, e)}
                                                className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </div>

            {/* FORMULÁRIO DE EDIÇÃO */}
            {showForm && (
                <EmployeeForm
                    initialData={editingEmployee}
                    onClose={() => setShowForm(false)}
                    onSuccess={handleSuccess}
                />
            )}

            {/* DETALHES DO COLABORADOR */}
            {selectedEmployee && (
                <EmployeeDetails
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    onEdit={() => handleEditClick(selectedEmployee)}
                    taxSettings={taxSettings}
                />
            )}
        </div>
    );
}
