
import { Users, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, trend }: any) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="content">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {trend && <span className="text-emerald-500 mr-1">{trend}</span>}
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral da estrutura de cargos e salários.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Cargos"
          value="124"
          subtitle="Cargos ativos"
          icon={Briefcase}
        />
        <StatCard
          title="Headcount"
          value="582"
          subtitle="Colaboradores"
          icon={Users}
          trend="+12%"
        />
        <StatCard
          title="Média Salarial"
          value="R$ 4.250"
          subtitle="Valor base médio"
          icon={TrendingUp}
        />
        <StatCard
          title="Alertas de Desvio"
          value="3"
          subtitle="Fora da faixa"
          icon={AlertCircle}
          trend=""
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Distribuição por Grade</h3>
          </div>
          <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md border border-dashed">
            <span className="text-muted-foreground">Gráfico de Distribuição aqui</span>
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">Atualizações Recentes</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Novo Cargo Criado</p>
                <p className="text-xs text-muted-foreground">Analista de Dados Jr foi adicionado.</p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">Hoje</div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Ajuste de Tabela</p>
                <p className="text-xs text-muted-foreground">Dissídio 2026 aplicado (5%).</p>
              </div>
              <div className="ml-auto font-medium text-xs text-muted-foreground">Ontem</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
