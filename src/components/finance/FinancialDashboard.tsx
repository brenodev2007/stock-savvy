import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp, Activity, Plus, Package, ShoppingCart } from "lucide-react";
import { useFinancialSummary, useFinancialTransactions } from "@/hooks/useFinancialTransactions";
import { useShopeeOrderStats } from "@/hooks/useShopee";
import { useFinance } from "@/contexts/FinanceContext";
import { useMemo, useState } from "react";
import { TransactionForm } from "./TransactionForm";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function FinancialDashboard() {
  const { employees } = useFinance();
  const { data: summary, isLoading } = useFinancialSummary();
  const { data: shopeeStats } = useShopeeOrderStats();
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const totalPayroll = useMemo(() => 
    employees.reduce((sum, emp) => sum + emp.salary, 0), 
    [employees]
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const metrics = useMemo(() => {
    if (!summary) {
      return {
        revenue: 0,
        profit: 0,
        margin: 0,
        cashBalance: 0,
        costs: 0,
      };
    }

    const profit = summary.revenue - summary.costs - summary.expenses - totalPayroll;
    const margin = summary.revenue > 0 ? (profit / summary.revenue) * 100 : 0;

    return {
      revenue: summary.revenue,
      profit,
      margin,
      cashBalance: summary.cashBalance - (totalPayroll * 12), // Approximate annual payroll
      costs: summary.costs + summary.expenses,
    };
  }, [summary, totalPayroll]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with action */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Visão Geral Financeira</h2>
          <p className="text-sm text-muted-foreground">
            Integrado com vendas Shopee e movimentações de estoque
          </p>
        </div>
        <Button onClick={() => setShowTransactionForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Receita de Vendas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido (Mês)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.profit < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatCurrency(metrics.profit)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              {metrics.profit < 0 ? (
                <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
              )}
              Após custos e despesas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.margin < 0 ? 'text-red-500' : ''}`}>
              {metrics.margin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Retorno sobre faturamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Caixa Estimado</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.cashBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Histórico acumulado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Stats */}
      {shopeeStats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-orange-600" />
                Pedidos Shopee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{shopeeStats.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {shopeeStats.entregue} entregues
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {shopeeStats.aguardandoEnvio} pendentes
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Custos (CMV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary?.costs || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Custo da mercadoria vendida
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-purple-600" />
                Folha de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
              <p className="text-xs text-muted-foreground">
                {employees.length} colaborador(es)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Transactions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>Vendas vs Lucro nos últimos meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] sm:h-[300px]">
              {summary?.chartData && summary.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.chartData}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} tick={{fontSize: 10}} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVendas)" />
                    <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#22c55e" fillOpacity={0.5} fill="url(#colorLucro)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
                  <Package className="h-12 w-12 opacity-20" />
                  <p>Cadastre pedidos para ver os gráficos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {summary.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{tx.description || tx.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.transaction_date), "dd MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className={`text-sm font-semibold ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2 py-8">
                  <Wallet className="h-8 w-8 opacity-20" />
                  <p className="text-sm">Nenhuma transação registrada</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Custos do Mês</CardTitle>
          <CardDescription>Detalhamento das despesas e custos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                Faturamento Total
              </span>
              <span className="font-semibold text-green-600">{formatCurrency(metrics.revenue)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 text-destructive">
              <span className="text-sm font-medium flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4" />
                CMV (Custo Mercadoria)
              </span>
              <span>- {formatCurrency(summary?.costs || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 text-destructive">
              <span className="text-sm font-medium flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4" />
                Despesas Operacionais
              </span>
              <span>- {formatCurrency(summary?.expenses || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between py-2 text-destructive">
              <span className="text-sm font-medium flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4" />
                Folha de Pagamento
              </span>
              <span>- {formatCurrency(totalPayroll)}</span>
            </div>
            
            <div className="flex items-center justify-between font-bold pt-4 border-t">
              <span className="text-sm">Resultado Operacional</span>
              <span className={metrics.profit > 0 ? "text-green-600" : "text-red-500"}>
                {formatCurrency(metrics.profit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <TransactionForm 
        open={showTransactionForm} 
        onOpenChange={setShowTransactionForm} 
      />
    </div>
  );
}
