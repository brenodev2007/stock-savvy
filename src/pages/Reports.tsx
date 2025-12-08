import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { BarChart3, Download, FileSpreadsheet, PieChart, TrendingUp } from 'lucide-react';

const reportTypes = [
  {
    title: 'Saldo de Estoque',
    description: 'Visualize o saldo atual por produto e depósito',
    icon: BarChart3,
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Histórico de Movimentações',
    description: 'Consulte todas as movimentações por período',
    icon: TrendingUp,
    color: 'bg-info/10 text-info',
  },
  {
    title: 'Valor do Estoque',
    description: 'Relatório de custo total e valor de venda',
    icon: PieChart,
    color: 'bg-success/10 text-success',
  },
  {
    title: 'Produtos por Categoria',
    description: 'Distribuição de produtos e valores por categoria',
    icon: FileSpreadsheet,
    color: 'bg-warning/10 text-warning',
  },
];

export default function Reports() {
  return (
    <AppLayout title="Relatórios" subtitle="Análises e exportações de dados">
      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report, index) => (
          <div
            key={report.title}
            className="rounded-lg border border-border bg-card p-6 transition-all hover:shadow-md animate-fade-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${report.color}`}
              >
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{report.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {report.description}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    Visualizar
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="mr-1 h-3 w-3" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
