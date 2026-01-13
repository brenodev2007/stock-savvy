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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Visão Geral Financeira</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Integrado com vendas Shopee e movimentações de estoque
          </p>
        </div>
        <Button onClick={() => setShowTransactionForm(true)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Faturamento</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(metrics.revenue)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center text-green-600">
              <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Receita de Vendas</span>
              <span className="sm:hidden">Receita</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Lucro Líquido</CardTitle>
            <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${metrics.profit < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {formatCurrency(metrics.profit)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center">
              {metrics.profit < 0 ? (
                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 text-red-500" />
              ) : (
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 text-green-600" />
              )}
              <span className="hidden sm:inline">Após custos</span>
              <span className="sm:hidden">Líquido</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Margem</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className={`text-lg sm:text-2xl font-bold ${metrics.margin < 0 ? 'text-red-500' : ''}`}>
              {metrics.margin.toFixed(1)}%
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              <span className="hidden sm:inline">Retorno sobre faturamento</span>
              <span className="sm:hidden">Retorno</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Caixa</CardTitle>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-lg sm:text-2xl font-bold">{formatCurrency(metrics.cashBalance)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              <span className="hidden sm:inline">Histórico acumulado</span>
              <span className="sm:hidden">Acumulado</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Stats */}
      {shopeeStats && (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600" />
                Pedidos Shopee
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{shopeeStats.total}</div>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  {shopeeStats.entregue} entregues
                </Badge>
                <Badge variant="outline" className="text-[10px] sm:text-xs">
                  {shopeeStats.aguardandoEnvio} pendentes
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                Custos (CMV)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(summary?.costs || 0)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Custo da mercadoria vendida
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
            <CardHeader className="pb-2 p-3 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                Folha de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {employees.length} colaborador(es)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Transactions */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Evolução Financeira</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Vendas vs Lucro nos últimos meses</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:pl-2 sm:p-6 sm:pt-0">
            <div className="h-[200px] sm:h-[300px]">
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
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tick={{fontSize: 9}} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} tick={{fontSize: 9}} width={45} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="vendas" name="Vendas" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorVendas)" />
                    <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#22c55e" fillOpacity={0.5} fill="url(#colorLucro)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 opacity-20" />
                  <p className="text-xs sm:text-sm text-center">Cadastre pedidos para ver os gráficos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Transações Recentes</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <ScrollArea className="h-[220px] sm:h-[280px]">
              {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {summary.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-1.5 sm:py-2 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{tx.description || tx.category}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {format(new Date(tx.transaction_date), "dd MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold ml-2 whitespace-nowrap ${
                        tx.type === 'income' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2 py-8">
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 opacity-20" />
                  <p className="text-xs sm:text-sm">Nenhuma transação registrada</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Resumo de Custos do Mês</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Detalhamento das despesas e custos</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between py-1.5 sm:py-2">
              <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                Faturamento Total
              </span>
              <span className="text-sm sm:text-base font-semibold text-green-600">{formatCurrency(metrics.revenue)}</span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 sm:py-2 text-destructive">
              <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">CMV (Custo Mercadoria)</span>
                <span className="sm:hidden">CMV</span>
              </span>
              <span className="text-sm sm:text-base">- {formatCurrency(summary?.costs || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 sm:py-2 text-destructive">
              <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Despesas Operacionais</span>
                <span className="sm:hidden">Despesas</span>
              </span>
              <span className="text-sm sm:text-base">- {formatCurrency(summary?.expenses || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between py-1.5 sm:py-2 text-destructive">
              <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <ArrowDownRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Folha de Pagamento</span>
                <span className="sm:hidden">Folha</span>
              </span>
              <span className="text-sm sm:text-base">- {formatCurrency(totalPayroll)}</span>
            </div>
            
            <div className="flex items-center justify-between font-bold pt-3 sm:pt-4 border-t">
              <span className="text-xs sm:text-sm">Resultado Operacional</span>
              <span className={`text-sm sm:text-base ${metrics.profit > 0 ? "text-green-600" : "text-red-500"}`}>
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
