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
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowUpCircle, ArrowDownCircle, DollarSign, Wallet, TrendingUp, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const chartConfig = {
  vendas: { label: 'Vendas', color: 'hsl(var(--primary))' },
  lucro: { label: 'Lucro', color: '#10b981' },
};

export function FinanceReport() {
  const { data: summary, isLoading } = useFinancialSummary();

  if (isLoading) {
    return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>;
  }

  if (!summary) return <div className="text-center py-12 text-muted-foreground font-bold">Sem dados financeiros disponíveis para o período.</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* KPI Cards com Design de Vidro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Receita Total', value: summary.revenue, icon: ArrowUpCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Despesas Gerais', value: summary.expenses, icon: ArrowDownCircle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
            { label: 'Custos Operacionais', value: summary.costs, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10' },
            { label: 'Saldo em Caixa', value: summary.cashBalance, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-500/10' },
        ].map((kpi, i) => (
            <Card key={i} className="border-none shadow-xl shadow-black/5 overflow-hidden group hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={cn("p-3 rounded-2xl group-hover:rotate-12 transition-all", kpi.bg)}>
                            <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
                    <h3 className="text-2xl font-black tracking-tighter">
                        {kpi.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </h3>
                </CardContent>
            </Card>
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/20 border-b p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Fluxo de Caixa Consolidado
                        </CardTitle>
                        <CardDescription>Comparativo histórico de Receitas vs Lucratividade</CardDescription>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black uppercase text-[10px]">Auditado</Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={summary.chartData}>
                            <defs>
                                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} dy={10} />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fontSize: 10, fontWeight: 'bold'}}
                                tickFormatter={(val) => `R$ ${val/1000}k`}
                            />
                            <Tooltip 
                                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px'}}
                                formatter={(val: number) => [val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '']}
                            />
                            <Area type="monotone" dataKey="vendas" name="Receita Bruta" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorVendas)" />
                            <Area type="monotone" dataKey="lucro" name="Lucro Líquido" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorLucro)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      </div>
      
      {/* Table Section */}
      <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b p-6">
          <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Extrato de Operações
          </CardTitle>
          <CardDescription>Últimas movimentações financeiras registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground p-6">Data</th>
                    <th className="text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground p-6">Descrição da Transação</th>
                    <th className="text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground p-6 text-center">Categoria</th>
                    <th className="text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground p-6">Montante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {summary.recentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="p-6 font-bold text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(t.transaction_date), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-6 font-black text-foreground">
                          {t.description || 'Lançamento sem descrição'}
                      </td>
                      <td className="p-6 text-center">
                          <Badge variant="outline" className="rounded-lg px-3 py-1 font-black uppercase text-[10px] border-muted-foreground/20">
                              {t.category}
                          </Badge>
                      </td>
                      <td className={cn(
                        "p-6 text-right font-black text-sm",
                        t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                         <div className="flex items-center justify-end gap-1">
                            {t.type === 'income' ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
             {summary.recentTransactions.length === 0 && (
                 <div className="p-12 text-center text-muted-foreground font-bold">Nenhuma transação recente encontrada.</div>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
