import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialSummary } from '@/hooks/useFinancialTransactions';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Wallet } from 'lucide-react';

const chartConfig = {
  vendas: { label: 'Vendas', color: 'hsl(var(--primary))' },
  lucro: { label: 'Lucro', color: 'hsl(var(--chart-2))' },
  revenue: { label: 'Receitas', color: 'hsl(220, 70%, 50%)' },
  expenses: { label: 'Despesas', color: 'hsl(var(--destructive))' },
};

export function FinanceReport() {
  const { data: summary, isLoading } = useFinancialSummary();

  if (isLoading) {
    return <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>;
  }

  if (!summary) return <div>Sem dados financeiros disponíveis.</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {summary.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">
              {summary.expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos (CMV)</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              {summary.costs.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.cashBalance >= 0 ? "text-blue-700 dark:text-blue-400" : "text-red-600"}`}>
              {summary.cashBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Receitas vs Lucro nos últimos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <AreaChart data={summary.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => 
                  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" })
                } 
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area 
                type="monotone" 
                dataKey="vendas" 
                name="Vendas"
                stroke="hsl(var(--primary))" 
                fill="url(#fillVendas)" 
              />
              <Area 
                type="monotone" 
                dataKey="lucro" 
                name="Lucro Líquido"
                stroke="hsl(var(--chart-2))" 
                fill="url(#fillLucro)" 
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
             <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium py-2">Data</th>
                    <th className="text-left font-medium py-2">Descrição</th>
                    <th className="text-left font-medium py-2">Categoria</th>
                    <th className="text-right font-medium py-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">{format(new Date(t.transaction_date), 'dd/MM/yyyy')}</td>
                      <td className="py-3">{t.description || '-'}</td>
                      <td className="py-3"><span className="capitalize">{t.category}</span></td>
                      <td className={`py-3 text-right font-medium ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                         {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
