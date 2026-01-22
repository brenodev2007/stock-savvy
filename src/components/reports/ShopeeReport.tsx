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
  Tooltip
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Truck, CheckCircle, XCircle, Package } from 'lucide-react';
import { useMemo, useState } from 'react';
import { format, subDays, isSameDay } from 'date-fns';
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

const COLORS = [
  'hsl(var(--primary))',      // Enviado
  'hsl(var(--chart-2))',      // Entregue
  'hsl(var(--chart-3))',      // Aguardando
  'hsl(var(--chart-4))',      // Em Transporte
  'hsl(var(--destructive))',  // Cancelado
];

const chartConfig = {
  orders: { label: 'Pedidos', color: 'hsl(var(--primary))' },
};

export function ShopeeReport() {
  const { data: stats, isLoading: loadingStats } = useShopeeOrderStats();
  // Fetch last 30 days orders for "Sales over time" and tables
  const endDate = new Date();
  const startDate = subDays(endDate, 30);
  const { data: orders, isLoading: loadingOrders } = useShopeeOrders({ startDate, endDate });

  const salesOverTimeData = useMemo(() => {
    if (!orders) return [];
    
    // Create map of last 14 days
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
      { name: 'Em Transporte', value: stats.emTransporte },
      { name: 'Cancelado/Devolvido', value: stats.cancelado },
    ].filter(item => item.value > 0);
  }, [stats]);

  const topProducts = useMemo(() => {
    if (!orders) return [];
    const productMap = new Map<string, { name: string, quantity: number, revenue: number }>();

    orders.forEach(order => {
      if (order.status !== 'CANCELADO' && order.status !== 'DEVOLVIDO') {
        // We don't have item details in list view, but usually product_name contains main info
        // Improve this: If we had items included in verify, we could do better.
        // For now, assume product_name refers to the main item
        const name = order.product_name; 
        if (!productMap.has(name)) {
            productMap.set(name, { name, quantity: 0, revenue: 0 });
        }
        const entry = productMap.get(name)!;
        entry.quantity += 1; // Count orders as proxy for quantity if item count unknown
        entry.revenue += order.order_total;
      }
    });

    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
  }, [orders]);


  if (loadingStats || loadingOrders) {
    return <div className="space-y-4">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>;
  }

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'ENTREGUE': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
          case 'CANCELADO': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
          case 'DEVOLVIDO': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
          case 'AGUARDANDO_ENVIO': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Envio</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.aguardandoEnvio || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.entregue || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Cancelamento</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold text-red-600">
               {stats?.total ? ((stats.cancelado / stats.total) * 100).toFixed(1) : 0}%
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
            <CardDescription>Distribuição atual dos pedidos</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
             </ChartContainer>
          </CardContent>
        </Card>

        {/* Sales Volume Chart */}
        <Card>
          <CardHeader>
             <CardTitle>Volume de Vendas (14 dias)</CardTitle>
             <CardDescription>Valor total faturado por dia</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={salesOverTimeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(val) => val.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}
                 />
                <ChartTooltip 
                   cursor={false} 
                   content={<ChartTooltipContent />} 
                   formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 />
                <Bar 
                  dataKey="total" 
                  name="Faturamento" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Products */}
          <Card className="md:col-span-1">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Top Produtos
                  </CardTitle>
                  <CardDescription>Mais vendidos (30 dias)</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {topProducts.map((p, i) => (
                          <div key={i} className="flex items-center justify-between">
                              <div className="space-y-1">
                                  <p className="text-sm font-medium leading-none truncate w-40">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">{p.quantity} pedidos</p>
                              </div>
                              <div className="text-sm font-bold">
                                  {p.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                          </div>
                      ))}
                      {topProducts.length === 0 && <p className="text-sm text-balance text-muted-foreground">Sem vendas no período.</p>}
                  </div>
              </CardContent>
          </Card>

          {/* Detailed Orders Table */}
          <Card className="md:col-span-2">
              <CardHeader>
                  <CardTitle>Últimos Pedidos</CardTitle>
                  <CardDescription>Detalhamento dos últimos lançamentos</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.slice(0, 10).map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{order.order_sn}</span>
                                            <span className="text-xs text-muted-foreground truncate w-32 md:w-48">
                                                {order.product_name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(order.purchase_date), 'dd/MM/yy')}</TableCell>
                                    <TableCell>{order.order_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 ${getStatusColor(order.status)}`}>
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
