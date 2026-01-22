import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useStockBalances } from '@/hooks/useStockBalances';
import { useProducts } from '@/hooks/useProducts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Warehouse } from 'lucide-react';
import { useMemo } from 'react';

const chartConfig = {
  qty: { label: 'Quantidade', color: 'hsl(var(--primary))' },
  value: { label: 'Valor (Custo)', color: 'hsl(var(--chart-2))' },
};

export function WarehouseReport() {
  const { data: warehouses, isLoading: loadingWarehouses } = useWarehouses();
  const { data: stocks, isLoading: loadingStocks } = useStockBalances();
  const { data: products, isLoading: loadingProducts } = useProducts();

  const warehouseStats = useMemo(() => {
    if (!warehouses || !stocks || !products) return [];

    return warehouses.map(w => {
        const warehouseStocks = stocks.filter(s => s.warehouse_id === w.id);
        const totalQty = warehouseStocks.reduce((acc, s) => acc + s.quantity, 0);
        
        const totalValue = warehouseStocks.reduce((acc, s) => {
            const product = products.find(p => p.id === s.product_id);
            const cost = Number(product?.cost) || 0;
            return acc + (s.quantity * cost);
        }, 0);

        return {
            name: w.name,
            totalQty,
            totalValue
        };
    }).sort((a, b) => b.totalValue - a.totalValue);

  }, [warehouses, stocks, products]);

  if (loadingWarehouses || loadingStocks || loadingProducts) {
    return <div className="space-y-4">
       <Skeleton className="h-96 w-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Quantidade por Depósito</CardTitle>
                    <CardDescription>Volume total de itens estocados</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={warehouseStats} layout="vertical" margin={{ left: 20 }}>
                             <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
                             <XAxis type="number" className="text-xs" />
                             <YAxis dataKey="name" type="category" width={100} className="text-xs font-medium" />
                             <ChartTooltip content={<ChartTooltipContent />} />
                             <Bar dataKey="totalQty" name="Quantidade" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Valor por Depósito</CardTitle>
                    <CardDescription>Valor monetário (preço de custo)</CardDescription>
                </CardHeader>
                 <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart data={warehouseStats} layout="vertical" margin={{ left: 20 }}>
                             <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
                             <XAxis 
                                type="number" 
                                className="text-xs" 
                                tickFormatter={(val) => val.toLocaleString('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' })}
                             />
                             <YAxis dataKey="name" type="category" width={100} className="text-xs font-medium" />
                             <ChartTooltip 
                                content={<ChartTooltipContent />}
                                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                             />
                             <Bar dataKey="totalValue" name="Valor Total" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        {/* Breakdown Table */}
        <Card>
            <CardHeader>
                <CardTitle>Detalhamento de Armazéns</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left font-medium py-2">Armazém</th>
                                <th className="text-right font-medium py-2">Qtd Itens</th>
                                <th className="text-right font-medium py-2">Valor Total (Custo)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouseStats.map((w) => (
                                <tr key={w.name} className="border-b last:border-0 hover:bg-muted/50">
                                    <td className="py-3 flex items-center gap-2">
                                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                                        {w.name}
                                    </td>
                                    <td className="py-3 text-right">{w.totalQty}</td>
                                    <td className="py-3 text-right">
                                        {w.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
