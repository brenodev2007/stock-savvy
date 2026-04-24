import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useShopeeOrderStats, useShopeeOrders } from '@/hooks/useShopee';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Truck, CheckCircle, XCircle, Package, TrendingUp, DollarSign } from 'lucide-react';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--primary))',      
  '#10b981',      
  '#f59e0b',      
  '#6366f1',      
  '#ef4444',  
];

const chartConfig = {
  orders: { label: 'Pedidos', color: 'hsl(var(--primary))' },
};

export function ShopeeReport() {
  const { data: stats, isLoading: loadingStats } = useShopeeOrderStats();
  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  const { data: orders, isLoading: loadingOrders } = useShopeeOrders({ startDate, endDate });

  const salesOverTimeData = useMemo(() => {
    if (!orders) return [];
    
    const daysMap = new Map<string, { date: string, count: number, total: number }>();
    const daysToShow = 14;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, 'yyyy-MM-dd');
      daysMap.set(key, { 
        date: format(d, 'dd/MM'), 
        count: 0, 
        total: 0 
      });
    }

    orders.forEach(order => {
      const d = new Date(order.purchase_date);
      const key = format(d, 'yyyy-MM-dd');
      if (daysMap.has(key)) {
        const entry = daysMap.get(key)!;
        entry.count += 1;
        entry.total += order.order_total;
      }
    });

    return Array.from(daysMap.values());
  }, [orders]);

  const statusData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Enviado', value: stats.enviado },
      { name: 'Entregue', value: stats.entregue },
      { name: 'Aguardando', value: stats.aguardandoEnvio },
      { name: 'Em Transporte', value: stats.emTransito },
      { name: 'Cancelado', value: stats.cancelado },
    ].filter(item => item.value > 0);
  }, [stats]);

  const topProducts = useMemo(() => {
    if (!orders) return [];
    const productMap = new Map<string, { name: string, quantity: number, revenue: number }>();

    orders.forEach(order => {
      if (order.status !== 'CANCELADO' && order.status !== 'DEVOLVIDO') {
        const name = order.product_name || 'Produto s/ nome'; 
        if (!productMap.has(name)) {
            productMap.set(name, { name, quantity: 0, revenue: 0 });
        }
        const entry = productMap.get(name)!;
        entry.quantity += 1;
        entry.revenue += order.order_total;
      }
    });

    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
  }, [orders]);


  if (loadingStats || loadingOrders) {
    return <div className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>;
  }

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'ENTREGUE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200';
          case 'CANCELADO': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200';
          case 'DEVOLVIDO': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200';
          case 'AGUARDANDO_ENVIO': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200';
          case 'ENVIADO': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200';
          default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Stats Cards com Design Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Total Pedidos', value: stats?.total || 0, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'A Enviar', value: stats?.aguardandoEnvio || 0, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
            { label: 'Finalizados', value: stats?.entregue || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: 'Cancelados', value: stats?.cancelado || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-500/10' },
        ].map((kpi, i) => (
            <Card key={i} className="border-none shadow-xl shadow-black/5 overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", kpi.bg)}>
                            <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                            <h3 className="text-2xl font-black">{kpi.value}</h3>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Volume Chart */}
        <Card className="lg:col-span-8 border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b pb-4">
             <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-base font-black uppercase tracking-tight">Fluxo de Faturamento</CardTitle>
                    <CardDescription>Performance dos últimos 14 dias</CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary border-none font-black">LIVE</Badge>
             </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10}}
                        tickFormatter={(val) => `R$ ${val/1000}k`}
                    />
                    <Tooltip 
                        cursor={{fill: 'hsl(var(--primary))', opacity: 0.05}}
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}
                        formatter={(val: number) => [val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), 'Faturamento']}
                    />
                    <Bar 
                        dataKey="total" 
                        fill="hsl(var(--primary))" 
                        radius={[6, 6, 0, 0]} 
                        barSize={32}
                    />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card className="lg:col-span-4 border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b pb-4">
            <CardTitle className="text-base font-black uppercase tracking-tight">Logística Ecommerce</CardTitle>
            <CardDescription>Status atual dos envios</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                    >
                        {statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-2 mt-4">
                {statusData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                            <span className="text-[10px] font-black uppercase text-muted-foreground">{s.name}</span>
                        </div>
                        <span className="text-xs font-black">{s.value}</span>
                    </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top Products */}
          <Card className="lg:col-span-4 border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b pb-4">
                  <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Best Sellers
                  </CardTitle>
                  <CardDescription>Ranking de receita (30 dias)</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                  <div className="space-y-6">
                      {topProducts.map((p, i) => (
                          <div key={i} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{i+1}</div>
                                  <div className="space-y-0.5">
                                      <p className="text-xs font-black leading-tight truncate w-32">{p.name}</p>
                                      <p className="text-[10px] text-muted-foreground font-bold">{p.quantity} pedidos</p>
                                  </div>
                              </div>
                              <div className="text-xs font-black text-emerald-600">
                                  {p.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                          </div>
                      ))}
                      {topProducts.length === 0 && <p className="text-xs font-bold text-muted-foreground text-center py-8">Sem dados no período.</p>}
                  </div>
              </CardContent>
          </Card>

          {/* Detailed Orders Table */}
          <Card className="lg:col-span-8 border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/20 border-b pb-4">
                  <CardTitle className="text-base font-black uppercase tracking-tight flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Operação Recente
                  </CardTitle>
                  <CardDescription>Monitoramento em tempo real dos pedidos</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 border-none">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest p-4">Rastreio / Produto</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-center">Data</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-right">Faturamento</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest p-4 text-center">Status Operacional</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.slice(0, 8).map((order) => (
                                <TableRow key={order.id} className="hover:bg-muted/20 border-border/50">
                                    <TableCell className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary text-xs">{order.order_sn}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold truncate w-48">
                                                {order.product_name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="p-4 text-center text-xs font-bold text-muted-foreground">
                                        {format(new Date(order.purchase_date), 'dd/MM/yy')}
                                    </TableCell>
                                    <TableCell className="p-4 text-right font-black text-xs">
                                        {order.order_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </TableCell>
                                    <TableCell className="p-4 text-center">
                                        <Badge variant="outline" className={cn("rounded-lg border-none px-2 py-0.5 text-[10px] font-black uppercase", getStatusColor(order.status))}>
                                            {order.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
