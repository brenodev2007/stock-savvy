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
import { Package, TrendingUp, DollarSign, FolderTree, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  endOfDay, 
  endOfMonth, 
  endOfYear, 
  startOfMonth, 
  startOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth
} from 'date-fns';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [activeTab, setActiveTab] = useState("stock");
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('month');
  const [date, setDate] = useState<Date>(new Date());

  // Calculate date range based on filter
  const dateRange = (() => {
    const start = filterType === 'day' ? startOfDay(date) :
                 filterType === 'month' ? startOfMonth(date) :
                 startOfYear(date);
    
    const end = filterType === 'day' ? endOfDay(date) :
               filterType === 'month' ? endOfMonth(date) :
               endOfYear(date);
               
    return { start, end };
  })();

  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: movements, isLoading: loadingMovements } = useMovements({ 
    startDate: dateRange.start, 
    endDate: dateRange.end 
  });
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
  // Movements chart data
  const movementsChartData = (() => {
    if (!movements) return [];

    let dataPoints: { date: string; fullDate: Date; entrada: number; saida: number; transferencia: number }[] = [];

    if (filterType === 'day') {
      // Group by hour (00-23)
      for (let i = 0; i < 24; i++) {
        const d = new Date(date);
        d.setHours(i, 0, 0, 0);
        dataPoints.push({
          date: `${i.toString().padStart(2, '0')}h`,
          fullDate: d,
          entrada: 0,
          saida: 0,
          transferencia: 0,
        });
      }

      movements.forEach((m) => {
        const mDate = parseISO(m.created_at);
        const hour = mDate.getHours();
        const hourData = dataPoints[hour];
        if (hourData) {
          if (m.type === 'IN') hourData.entrada += m.quantity;
          else if (m.type === 'OUT') hourData.saida += m.quantity;
          else if (m.type === 'TRANSFER') hourData.transferencia += m.quantity;
        }
      });
    } else if (filterType === 'month') {
      // Group by day of month
      const daysInMonth = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      dataPoints = daysInMonth.map(d => ({
        date: format(d, 'dd'),
        fullDate: d,
        entrada: 0,
        saida: 0,
        transferencia: 0,
      }));

      movements.forEach((m) => {
        const mDate = parseISO(m.created_at);
        const dayIndex = dataPoints.findIndex(d => isSameDay(d.fullDate, mDate));
        if (dayIndex !== -1) {
          const d = dataPoints[dayIndex];
          if (m.type === 'IN') d.entrada += m.quantity;
          else if (m.type === 'OUT') d.saida += m.quantity;
          else if (m.type === 'TRANSFER') d.transferencia += m.quantity;
        }
      });
    } else {
      // Group by month of year
      const monthsInYear = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
      dataPoints = monthsInYear.map(d => ({
        date: format(d, 'MMM', { locale: ptBR }),
        fullDate: d,
        entrada: 0,
        saida: 0,
        transferencia: 0,
      }));

      movements.forEach((m) => {
        const mDate = parseISO(m.created_at);
        const monthIndex = dataPoints.findIndex(d => isSameMonth(d.fullDate, mDate));
        if (monthIndex !== -1) {
          const d = dataPoints[monthIndex];
          if (m.type === 'IN') d.entrada += m.quantity;
          else if (m.type === 'OUT') d.saida += m.quantity;
          else if (m.type === 'TRANSFER') d.transferencia += m.quantity;
        }
      });
    }

    return dataPoints;
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

  const handleExportExcel = () => {
    let data: any[] = [];
    let filename = 'relatorio';

    if (activeTab === 'stock') {
      filename = 'saldo-estoque';
      data = stockBalances?.map(sb => ({
        Produto: sb.product?.name,
        'Código SKU': sb.product?.sku,
        Armazém: sb.warehouse?.name,
        Quantidade: sb.quantity,
        'Custo Unit.': sb.product?.cost,
        'Valor Total': (sb.quantity * (sb.product?.cost || 0))
      })) || [];
    } else if (activeTab === 'movements') {
      filename = 'movimentacoes';
      data = movements?.map(m => ({
        Data: format(parseISO(m.created_at), 'dd/MM/yyyy HH:mm'),
        Tipo: m.type,
        Produto: m.product?.name,
        Origem: m.warehouse_from?.name || '-',
        Destino: m.warehouse_to?.name || '-',
        Quantidade: m.quantity,
        Referência: m.reference
      })) || [];
    } else if (activeTab === 'value') {
      filename = 'valor-estoque';
      data = stockValueData.map(item => ({
        Produto: item.name,
        Quantidade: item.quantity,
        'Custo Total': item.totalCost,
        'Valor Venda Total': item.totalPrice
      }));
    } else if (activeTab === 'categories') {
      filename = 'por-categoria';
      data = productsByCategory.map(cat => ({
        Categoria: cat.name,
        'Qtd Produtos': cat.count,
        'Valor em Estoque': cat.value
      }));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = activeTab === 'stock' ? 'Saldo de Estoque' :
                 activeTab === 'movements' ? 'Movimentações' :
                 activeTab === 'value' ? 'Valor do Estoque' : 'Relatório por Categoria';
    
    doc.text(title, 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 25);

    let head: string[][] = [];
    let body: any[][] = [];

    if (activeTab === 'stock') {
      head = [['Produto', 'SKU', 'Armazém', 'Qtd', 'Custo Total']];
      body = stockBalances?.map(sb => [
        sb.product?.name || '',
        sb.product?.sku || '',
        sb.warehouse?.name || '',
        sb.quantity.toString(),
        (sb.quantity * (sb.product?.cost || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]) || [];
    } else if (activeTab === 'movements') {
      head = [['Data', 'Tipo', 'Produto', 'Origem', 'Destino', 'Qtd']];
      body = movements?.map(m => [
        format(parseISO(m.created_at), 'dd/MM/yy HH:mm'),
        m.type,
        m.product?.name || '',
        m.warehouse_from?.name || '-',
        m.warehouse_to?.name || '-',
        m.quantity.toString()
      ]) || [];
    } else if (activeTab === 'value') {
      head = [['Produto', 'Qtd', 'Custo Total', 'Valor Venda']];
      body = stockValueData.map(item => [
        item.name,
        item.quantity.toString(),
        item.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]);
    } else if (activeTab === 'categories') {
      head = [['Categoria', 'Qtd Produtos', 'Valor Total']];
      body = productsByCategory.map(cat => [
        cat.name,
        cat.count.toString(),
        cat.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      ]);
    }

    autoTable(doc, {
      head,
      body,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save(`${title.toLowerCase().replace(/\s/g, '-')}.pdf`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto max-w-[800px]">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-4 whitespace-nowrap gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                  Exportar Planilha (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Histórico de Movimentações</CardTitle>
                <CardDescription>
                  {filterType === 'day' && `Movimentações em ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
                  {filterType === 'month' && `Movimentações em ${format(date, "MMMM 'de' yyyy", { locale: ptBR })}`}
                  {filterType === 'year' && `Movimentações em ${format(date, "yyyy", { locale: ptBR })}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={filterType}
                  onValueChange={(v: 'day' | 'month' | 'year') => setFilterType(v)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart
                  data={movementsChartData}
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
    </div>
    </AppLayout>
  );
}
