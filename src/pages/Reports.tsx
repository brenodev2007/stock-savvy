import { useState, useMemo } from 'react';
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
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format, startOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  FolderTree, 
  Calendar as CalendarIcon, 
  ShoppingBag, 
  Warehouse,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  FileText,
  Filter,
  ArrowRight
} from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useShopeeOrders } from '@/hooks/useShopee';
import { FinanceReport } from '@/components/reports/FinanceReport';
import { ShopeeReport } from '@/components/reports/ShopeeReport';
import { WarehouseReport } from '@/components/reports/WarehouseReport';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#22c55e',
  '#eab308',
  '#ef4444',
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("stock");
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('month');
  const [date, setDate] = useState<Date>(new Date());

  const dateRange = useMemo(() => {
    const start = filterType === 'day' ? startOfDay(date) :
                 filterType === 'month' ? startOfMonth(date) :
                 startOfYear(date);
    
    const end = filterType === 'day' ? endOfDay(date) :
               filterType === 'month' ? endOfMonth(date) :
               endOfYear(date);
               
    return { start, end };
  }, [date, filterType]);

  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: movements, isLoading: loadingMovements } = useMovements({ 
    startDate: dateRange.start, 
    endDate: dateRange.end 
  });
  const { data: stockBalances, isLoading: loadingStock } = useStockBalances();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: shopeeOrders } = useShopeeOrders({ 
    startDate: dateRange.start, 
    endDate: dateRange.end 
  });

  const isLoading = loadingProducts || loadingMovements || loadingStock || loadingCategories;

  // Curva ABC de Produtos (Por faturamento estimado em estoque)
  const abcData = useMemo(() => {
    if (!products || !stockBalances) return [];
    
    const productValues = products.map(p => {
      const stock = stockBalances
        .filter(sb => sb.product_id === p.id)
        .reduce((sum, sb) => sum + sb.quantity, 0);
      return {
        name: p.name,
        value: stock * (Number(p.price) || 0),
        stock
      };
    }).sort((a, b) => b.value - a.value);

    const totalValue = productValues.reduce((sum, p) => sum + p.value, 0);
    let cumulativeValue = 0;

    return productValues.map(p => {
      cumulativeValue += p.value;
      const percentage = (cumulativeValue / totalValue) * 100;
      let group = 'C';
      if (percentage <= 70) group = 'A';
      else if (percentage <= 90) group = 'B';
      
      return { ...p, group, percentage: (p.value / totalValue) * 100 };
    });
  }, [products, stockBalances]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleExportExcel = () => {
    const data = abcData.map(p => ({
        Produto: p.name,
        Estoque: p.stock,
        'Valor Total': p.value,
        Grupo: p.group,
        '% Faturamento': p.percentage.toFixed(2) + '%'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Curva ABC");
    XLSX.writeFile(wb, `relatorio-abc-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return (
      <AppLayout title="Relatórios" subtitle="Carregando inteligência de dados...">
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent><Skeleton className="h-[200px] w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Business Intelligence" subtitle="Análise estratégica de estoque, vendas e performance">
      <div className="space-y-6">
        
        {/* Header de Relatórios */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
            <div className="space-y-1">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Central de Relatórios
                </h2>
                <p className="text-sm text-muted-foreground">Filtre e exporte dados para tomadas de decisão</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Dia</SelectItem>
                        <SelectItem value="month">Mês</SelectItem>
                        <SelectItem value="year">Ano</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2"><CalendarIcon className="h-4 w-4" /> {format(date, "PPP", { locale: ptBR })}</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} /></PopoverContent>
                </Popover>
                <Button onClick={handleExportExcel} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Download className="h-4 w-4" /> Exportar
                </Button>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
            <TabsTrigger value="stock" className="gap-2"><Package className="h-4 w-4" /> Estoque</TabsTrigger>
            <TabsTrigger value="abc" className="gap-2"><TrendingUp className="h-4 w-4" /> Curva ABC</TabsTrigger>
            <TabsTrigger value="finance" className="gap-2"><DollarSign className="h-4 w-4" /> Financeiro</TabsTrigger>
            <TabsTrigger value="shopee" className="gap-2"><ShoppingBag className="h-4 w-4" /> Shopee</TabsTrigger>
          </TabsList>

          <TabsContent value="abc" className="space-y-6 animate-in fade-in duration-500">
             <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-emerald-800 text-sm font-bold uppercase tracking-wider">Produtos Grupo A</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-700">{abcData.filter(p => p.group === 'A').length}</div>
                        <p className="text-xs text-emerald-600 mt-1">Representam 70% do valor em estoque</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-amber-800 text-sm font-bold uppercase tracking-wider">Produtos Grupo B</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-700">{abcData.filter(p => p.group === 'B').length}</div>
                        <p className="text-xs text-amber-600 mt-1">Representam 20% do valor em estoque</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-800 text-sm font-bold uppercase tracking-wider">Produtos Grupo C</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-700">{abcData.filter(p => p.group === 'C').length}</div>
                        <p className="text-xs text-slate-600 mt-1">Representam 10% do valor em estoque</p>
                    </CardContent>
                </Card>
             </div>

             <Card>
                <CardHeader>
                    <CardTitle>Análise de Curva ABC</CardTitle>
                    <CardDescription>Classificação de produtos por relevância financeira no estoque</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-4 text-left">Produto</th>
                                    <th className="p-4 text-center">Grupo</th>
                                    <th className="p-4 text-right">Faturamento Est.</th>
                                    <th className="p-4 text-right">% Repres.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {abcData.slice(0, 10).map((p, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        <td className="p-4 font-medium">{p.name}</td>
                                        <td className="p-4 text-center">
                                            <Badge className={cn(
                                                p.group === 'A' ? "bg-emerald-500" :
                                                p.group === 'B' ? "bg-amber-500" : "bg-slate-500"
                                            )}>{p.group}</Badge>
                                        </td>
                                        <td className="p-4 text-right font-mono">{formatCurrency(p.value)}</td>
                                        <td className="p-4 text-right">{p.percentage.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Saldo de Estoque</CardTitle>
                    <CardDescription>Principais produtos em volume</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={abcData.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                            <XAxis type="number" axisLine={false} tickLine={false} />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12}} />
                            <Tooltip formatter={(val: number) => [val, 'Unidades']} />
                            <Bar dataKey="stock" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="finance">
             <FinanceReport />
          </TabsContent>

          <TabsContent value="shopee">
             <ShopeeReport />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
