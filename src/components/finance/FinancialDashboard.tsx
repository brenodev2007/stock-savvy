import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp, Activity } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { useMemo } from "react";

export function FinancialDashboard() {
  const { transactions, employees } = useFinance();

  const metrics = useMemo(() => {
    const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
    
    // Calculate current month metrics
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const revenue = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Assuming imported amount is already net of shopee fees, but let's assume raw amount for revenue
    // For simplicity, we use amount as is.
    
    const profit = revenue - totalPayroll; // Simple logic: Revenue - Fixed Payroll
    const roi = revenue > 0 ? (profit / revenue) * 100 : 0;
    
    // Cash Flow (All time)
    const totalCash = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
      - (totalPayroll * 12); // Approximate annual cost for demo

    return {
      revenue,
      profit,
      roi,
      totalCash,
      totalPayroll
    };
  }, [transactions, employees]);

  const chartData = useMemo(() => {
    // Group by month
    const grouped = transactions.reduce((acc, t) => {
      const date = new Date(t.date + 'T00:00:00'); // Ensure local date parsing
      // Check if date is valid
      if (isNaN(date.getTime())) return acc;

      const key = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!acc[key]) acc[key] = { name: key, vendas: 0, lucro: 0 };
      
      if (t.type === 'income') {
        acc[key].vendas += t.amount;
      }
      return acc;
    }, {} as Record<string, {name: string, vendas: number, lucro: number}>);

    const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);

    // Calc profit per month
    return Object.values(grouped).map(item => ({
      ...item,
      lucro: item.vendas - totalPayroll // Deduct fixed payroll from monthly revenue
    })).slice(-6); // Last 6 months
  }, [transactions, employees]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-4">
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
              Pós desconto de folha ({formatCurrency(metrics.totalPayroll)})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem / ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.roi.toFixed(1)}%</div>
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
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalCash)}</div>
            <p className="text-xs text-muted-foreground">
              Histórico acumulado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] sm:h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tick={{fontSize: 10}} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} tick={{fontSize: 10}} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#8884d8" fillOpacity={1} fill="url(#colorVendas)" />
                    <Area type="monotone" dataKey="lucro" name="Lucro Est." stroke="#82ca9d" fillOpacity={0.3} fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
            <CardHeader>
             <CardTitle>Resumo de Custos</CardTitle>
             <CardDescription>Participação da Folha Salarial</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm font-medium">Faturamento Mês</span>
                     <span>{formatCurrency(metrics.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-destructive">
                     <span className="text-sm font-medium">Folha de Pagamento</span>
                     <span>- {formatCurrency(metrics.totalPayroll)}</span>
                  </div>
                   <div className="flex items-center justify-between font-bold pt-2 border-t">
                     <span className="text-sm">Resultado Operacional</span>
                     <span className={metrics.profit > 0 ? "text-green-600" : "text-red-500"}>
                        {formatCurrency(metrics.profit)}
                     </span>
                  </div>
               </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
