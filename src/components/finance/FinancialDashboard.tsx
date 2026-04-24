import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  Bar,
  BarChart,
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Activity, 
  Plus, 
  Package, 
  ShoppingCart,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from "lucide-react";
import { useFinancialSummary } from "@/hooks/useFinancialTransactions";

import { useFinance } from "@/contexts/FinanceContext";
import { useMemo, useState } from "react";
import { TransactionForm } from "./TransactionForm";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function FinancialDashboard() {
  const { employees } = useFinance();
  const { data: summary, isLoading } = useFinancialSummary();

  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const totalPayroll = useMemo(() => 
    employees.reduce((sum, emp) => sum + emp.salary, 0), 
    [employees]
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const metrics = useMemo(() => {
    if (!summary) return { revenue: 0, profit: 0, margin: 0, cashBalance: 0, costs: 0, expenses: 0 };

    const revenue = summary.revenue || 0;
    const costs = summary.costs || 0;
    const expenses = (summary.expenses || 0) + totalPayroll;
    const profit = revenue - costs - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      profit,
      margin,
      cashBalance: summary.cashBalance || 0,
      costs,
      expenses
    };
  }, [summary, totalPayroll]);

  const pieData = useMemo(() => [
    { name: 'Produtos (CMV)', value: metrics.costs, color: '#3b82f6' },
    { name: 'Despesas/Folha', value: metrics.expenses, color: '#f43f5e' },
    { name: 'Lucro Líquido', value: Math.max(0, metrics.profit), color: '#10b981' },
  ], [metrics]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Activity className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-muted-foreground animate-pulse font-medium">Consolidando dados financeiros corporativos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header Corporativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Painel de Performance</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Relatório consolidado de vendas, estoque e fluxo de caixa operacional
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none">
            <Download className="h-4 w-4" /> Exportar DRE
          </Button>
          <Button onClick={() => setShowTransactionForm(true)} className="gap-2 flex-1 md:flex-none shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Nova Transação
          </Button>
        </div>
      </div>

      {/* KPIs com Design Premium */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Receita Bruta', value: metrics.revenue, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50/50', trend: 'Faturamento' },
          { label: 'Lucro Líquido', value: metrics.profit, icon: Wallet, color: metrics.profit >= 0 ? 'text-emerald-600' : 'text-rose-600', bg: metrics.profit >= 0 ? 'bg-emerald-50/50' : 'bg-rose-50/50', trend: 'Resultado' },
          { label: 'Margem Líquida', value: `${metrics.margin.toFixed(1)}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50/50', trend: 'Eficiência' },
          { label: 'Saldo de Caixa', value: metrics.cashBalance, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50/50', trend: 'Liquidez' }
        ].map((kpi, i) => (
          <Card key={i} className="overflow-hidden border-none shadow-lg shadow-black/5 bg-gradient-to-br from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-950">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={cn("p-2 rounded-lg", kpi.bg)}>
                  <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">{kpi.trend}</Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                <h3 className="text-2xl font-bold mt-1">
                  {typeof kpi.value === 'number' ? formatCurrency(kpi.value) : kpi.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Gráfico de Evolução */}
        <Card className="lg:col-span-8 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evolução de Performance</CardTitle>
                <CardDescription>Comparativo histórico de vendas vs lucratividade</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Vendas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Lucro</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              {summary?.chartData?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `R$ ${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [formatCurrency(val), '']}
                    />
                    <Area type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#colorVendas)" />
                    <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} fill="url(#colorLucro)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-sm text-muted-foreground">Dados insuficientes para gerar gráfico histórico</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Custos */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Composição de Gastos
            </CardTitle>
            <CardDescription>Onde seu dinheiro está sendo aplicado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold">{((item.value / Math.max(1, metrics.revenue)) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* DRE Corporativa - Demonstração de Resultado */}
        <Card className="lg:col-span-12 shadow-sm border-t-4 border-t-primary">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  DRE Simplificada (Mensal)
                </CardTitle>
                <CardDescription>Análise estruturada de receitas e despesas</CardDescription>
              </div>
              <Badge variant="secondary" className="px-4 py-1">Consolidado</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/20">
                    <th className="text-left p-4 font-semibold text-muted-foreground">Rubrica Financeira</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">Valor Acumulado</th>
                    <th className="text-right p-4 font-semibold text-muted-foreground">% S/ Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Receita Bruta */}
                  <tr className="hover:bg-muted/10 transition-colors">
                    <td className="p-4 font-bold">1. RECEITA BRUTA DE VENDAS</td>
                    <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(metrics.revenue)}</td>
                    <td className="p-4 text-right">100%</td>
                  </tr>
                  {/* Custos Variáveis */}
                  <tr className="hover:bg-muted/10 transition-colors text-muted-foreground">
                    <td className="p-4 pl-8">(-) CMV (Custo das Mercadorias)</td>
                    <td className="p-4 text-right text-red-500">- {formatCurrency(metrics.costs)}</td>
                    <td className="p-4 text-right">{((metrics.costs / Math.max(1, metrics.revenue)) * 100).toFixed(1)}%</td>
                  </tr>
                  {/* Margem Bruta */}
                  <tr className="bg-muted/5 font-semibold">
                    <td className="p-4">2. MARGEM BRUTA</td>
                    <td className="p-4 text-right">{formatCurrency(metrics.revenue - metrics.costs)}</td>
                    <td className="p-4 text-right">{(((metrics.revenue - metrics.costs) / Math.max(1, metrics.revenue)) * 100).toFixed(1)}%</td>
                  </tr>
                  {/* Despesas Operacionais */}
                  <tr className="hover:bg-muted/10 transition-colors text-muted-foreground">
                    <td className="p-4 pl-8">(-) Despesas Administrativas</td>
                    <td className="p-4 text-right text-red-500">- {formatCurrency(summary?.expenses || 0)}</td>
                    <td className="p-4 text-right">{(((summary?.expenses || 0) / Math.max(1, metrics.revenue)) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr className="hover:bg-muted/10 transition-colors text-muted-foreground">
                    <td className="p-4 pl-8">(-) Folha de Pagamento / Pró-labore</td>
                    <td className="p-4 text-right text-red-500">- {formatCurrency(totalPayroll)}</td>
                    <td className="p-4 text-right">{((totalPayroll / Math.max(1, metrics.revenue)) * 100).toFixed(1)}%</td>
                  </tr>
                  {/* Resultado Líquido */}
                  <tr className={cn(
                    "font-bold text-lg border-t-2",
                    metrics.profit >= 0 ? "bg-emerald-50/50 text-emerald-700" : "bg-red-50/50 text-red-700"
                  )}>
                    <td className="p-4">RESULTADO LÍQUIDO DO PERÍODO</td>
                    <td className="p-4 text-right">{formatCurrency(metrics.profit)}</td>
                    <td className="p-4 text-right">{metrics.margin.toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionForm 
        open={showTransactionForm} 
        onOpenChange={setShowTransactionForm} 
      />
    </div>
  );
}
