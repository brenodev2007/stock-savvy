import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useMovements } from '@/hooks/useMovements';
import { useStockBalances } from '@/hooks/useStockBalances';
import { useCategories } from '@/hooks/useCategories';
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, TrendingUp, DollarSign, FolderTree } from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(220, 70%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)',
];

export default function Reports() {
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: movements, isLoading: loadingMovements } = useMovements(100);
  const { data: stockBalances, isLoading: loadingStock } = useStockBalances();
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const isLoading = loadingProducts || loadingMovements || loadingStock || loadingCategories;

  // Stock by product data
  const stockByProductData = stockBalances
    ?.reduce((acc, sb) => {
      const existing = acc.find((item) => item.product_id === sb.product_id);
      if (existing) {
        existing.quantity += sb.quantity;
      } else {
        acc.push({
          product_id: sb.product_id,
          name: sb.product?.name || 'Desconhecido',
          quantity: sb.quantity,
        });
      }
      return acc;
    }, [] as { product_id: string; name: string; quantity: number }[])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10) || [];

  // Movements by day (last 14 days)
  const movementsByDay = (() => {
    const days: { date: string; entrada: number; saida: number; transferencia: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      days.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        entrada: 0,
        saida: 0,
        transferencia: 0,
      });
    }

    movements?.forEach((m) => {
      const movDate = format(startOfDay(parseISO(m.created_at)), 'dd/MM', { locale: ptBR });
      const dayData = days.find((d) => d.date === movDate);
      if (dayData) {
        if (m.type === 'IN') dayData.entrada += m.quantity;
        else if (m.type === 'OUT') dayData.saida += m.quantity;
        else if (m.type === 'TRANSFER') dayData.transferencia += m.quantity;
      }
    });

    return days;
  })();

  // Stock value data
  const stockValueData = stockBalances
    ?.reduce((acc, sb) => {
      const product = products?.find((p) => p.id === sb.product_id);
      if (!product) return acc;

      const existing = acc.find((item) => item.product_id === sb.product_id);
      const cost = Number(product.cost) || 0;
      const price = Number(product.price) || 0;

      if (existing) {
        existing.quantity += sb.quantity;
        existing.totalCost = existing.quantity * cost;
        existing.totalPrice = existing.quantity * price;
      } else {
        acc.push({
          product_id: sb.product_id,
          name: product.name,
          quantity: sb.quantity,
          totalCost: sb.quantity * cost,
          totalPrice: sb.quantity * price,
        });
      }
      return acc;
    }, [] as { product_id: string; name: string; quantity: number; totalCost: number; totalPrice: number }[])
    .sort((a, b) => b.totalPrice - a.totalPrice)
    .slice(0, 8) || [];

  const totalStockCost = stockValueData.reduce((sum, item) => sum + item.totalCost, 0);
  const totalStockPrice = stockValueData.reduce((sum, item) => sum + item.totalPrice, 0);

  // Products by category
  const productsByCategory = (() => {
    const categoryMap = new Map<string, { name: string; count: number; value: number }>();

    products?.forEach((p) => {
      const category = categories?.find((c) => c.id === p.category_id);
      const categoryName = category?.name || 'Sem categoria';
      const categoryId = p.category_id || 'none';

      const stock = stockBalances
        ?.filter((sb) => sb.product_id === p.id)
        .reduce((sum, sb) => sum + sb.quantity, 0) || 0;

      const value = stock * (Number(p.price) || 0);

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.count += 1;
        existing.value += value;
      } else {
        categoryMap.set(categoryId, { name: categoryName, count: 1, value });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  })();

  const chartConfig = {
    entrada: { label: 'Entrada', color: 'hsl(var(--chart-2))' },
    saida: { label: 'Saída', color: 'hsl(var(--destructive))' },
    transferencia: { label: 'Transferência', color: 'hsl(var(--chart-4))' },
    quantity: { label: 'Quantidade', color: 'hsl(var(--primary))' },
    totalCost: { label: 'Custo', color: 'hsl(var(--chart-3))' },
    totalPrice: { label: 'Valor Venda', color: 'hsl(var(--primary))' },
  };

  if (isLoading) {
    return (
      <AppLayout title="Relatórios" subtitle="Análises e exportações de dados">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatórios" subtitle="Análises e exportações de dados">
      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="stock" className="gap-2 py-3">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Saldo de Estoque</span>
            <span className="sm:hidden">Estoque</span>
          </TabsTrigger>
          <TabsTrigger value="movements" className="gap-2 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Movimentações</span>
            <span className="sm:hidden">Movim.</span>
          </TabsTrigger>
          <TabsTrigger value="value" className="gap-2 py-3">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Valor do Estoque</span>
            <span className="sm:hidden">Valor</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 py-3">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Por Categoria</span>
            <span className="sm:hidden">Categ.</span>
          </TabsTrigger>
        </TabsList>

        {/* Stock Balance Tab */}
        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saldo de Estoque por Produto</CardTitle>
              <CardDescription>
                Top 10 produtos com maior quantidade em estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockByProductData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Nenhum dado de estoque disponível
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <BarChart
                    data={stockByProductData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      className="text-xs"
                      tickFormatter={(value) =>
                        value.length > 15 ? `${value.slice(0, 15)}...` : value
                      }
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="quantity"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      name="Quantidade"
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Movimentações dos últimos 14 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart
                  data={movementsByDay}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="entrada"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                    name="Entrada"
                  />
                  <Line
                    type="monotone"
                    dataKey="saida"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--destructive))' }}
                    name="Saída"
                  />
                  <Line
                    type="monotone"
                    dataKey="transferencia"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-4))' }}
                    name="Transferência"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Value Tab */}
        <TabsContent value="value" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader className="pb-2">
                <CardDescription>Custo Total do Estoque</CardDescription>
                <CardTitle className="text-3xl">
                  {totalStockCost.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5">
              <CardHeader className="pb-2">
                <CardDescription>Valor Total de Venda</CardDescription>
                <CardTitle className="text-3xl">
                  {totalStockPrice.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Valor por Produto</CardTitle>
              <CardDescription>
                Comparação entre custo e valor de venda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockValueData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  Nenhum dado de valor disponível
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
                  <BarChart
                    data={stockValueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tickFormatter={(value) =>
                        value.length > 10 ? `${value.slice(0, 10)}...` : value
                      }
                    />
                    <YAxis
                      className="text-xs"
                      tickFormatter={(value) =>
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          notation: 'compact',
                        })
                      }
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value: number) =>
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })
                      }
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="totalCost"
                      fill="hsl(var(--chart-3))"
                      radius={[4, 4, 0, 0]}
                      name="Custo"
                    />
                    <Bar
                      dataKey="totalPrice"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Valor Venda"
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos por Categoria</CardTitle>
                <CardDescription>
                  Distribuição de produtos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsByCategory.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Nenhuma categoria disponível
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                      <Pie
                        data={productsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        dataKey="count"
                        nameKey="name"
                      >
                        {productsByCategory.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value} produtos`, 'Quantidade']}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Categoria</CardTitle>
                <CardDescription>
                  Valor total em estoque por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productsByCategory.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    Nenhuma categoria disponível
                  </div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                      <Pie
                        data={productsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        dataKey="value"
                        nameKey="name"
                      >
                        {productsByCategory.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }),
                          'Valor',
                        ]}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category breakdown table */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 text-left text-sm font-medium text-muted-foreground">
                        Categoria
                      </th>
                      <th className="py-3 text-right text-sm font-medium text-muted-foreground">
                        Produtos
                      </th>
                      <th className="py-3 text-right text-sm font-medium text-muted-foreground">
                        Valor em Estoque
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsByCategory.map((cat, index) => (
                      <tr key={index} className="border-b border-border/50 last:border-0">
                        <td className="py-3 text-sm font-medium">{cat.name}</td>
                        <td className="py-3 text-right text-sm">{cat.count}</td>
                        <td className="py-3 text-right text-sm">
                          {cat.value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
