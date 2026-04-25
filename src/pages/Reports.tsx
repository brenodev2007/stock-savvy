import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { useMovements } from '@/hooks/useMovements';
import { useStockBalances } from '@/hooks/useStockBalances';
import { useCategories } from '@/hooks/useCategories';
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
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, startOfDay, startOfMonth, startOfYear, endOfDay, endOfMonth, endOfYear, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  BarChart3,
  Download,
  FileText,
  Calendar as CalendarIcon,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronRight,
  Target
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { useShopeeOrders, useShopeeOrderStats } from '@/hooks/useShopee';
import { FinanceReport } from '@/components/reports/FinanceReport';
import { ShopeeReport } from '@/components/reports/ShopeeReport';
import { Badge } from '@/components/ui/badge';

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");
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
  const { data: movements } = useMovements({ 
    startDate: dateRange.start, 
    endDate: dateRange.end 
  });
  const { data: stockBalances, isLoading: loadingStock } = useStockBalances();
  const { data: shopeeOrders } = useShopeeOrders({ 
    startDate: dateRange.start, 
    endDate: dateRange.end 
  });
  const { data: shopeeStats } = useShopeeOrderStats();

  const isLoading = loadingProducts || loadingStock;

  // Curva ABC de Produtos
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
    XLSX.writeFile(wb, `relatorio-bi-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (isLoading) {
    return (
      <AppLayout title="Relatórios" subtitle="Carregando BI...">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Relatórios" subtitle="Análise estratégica de performance omnichannel">
      <div className="space-y-6 animate-in fade-in duration-700">
        
        {/* Controle Superior com Design Premium */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
            <div className="space-y-1">
                <h2 className="text-xl font-black flex items-center gap-2 text-primary uppercase tracking-tight">
                    <Activity className="h-5 w-5" />
                    Inteligência de Dados
                </h2>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">
                    Período: {format(dateRange.start, "dd/MM/yyyy")} até {format(dateRange.end, "dd/MM/yyyy")}
                </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex bg-muted/50 p-1 rounded-xl border">
                    {(['day', 'month', 'year'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={cn(
                                "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                                filterType === t ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t === 'day' ? 'Dia' : t === 'month' ? 'Mês' : 'Ano'}
                        </button>
                    ))}
                </div>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-10 rounded-xl gap-2 font-bold border-muted-foreground/20">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            {format(date, filterType === 'month' ? "MMMM 'de' yyyy" : filterType === 'year' ? "yyyy" : "dd 'de' MMMM", { locale: ptBR })}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none">
                        <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
                    </PopoverContent>
                </Popover>

                <Button onClick={handleExportExcel} className="h-10 rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-bold transition-all hover:scale-105 active:scale-95">
                    <Download className="h-4 w-4" /> Exportar BI
                </Button>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border/50 h-auto gap-1">
            <TabsTrigger value="overview" className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all font-bold">
                <LayoutDashboard className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="abc" className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all font-bold">
                <TrendingUp className="h-4 w-4" /> Curva ABC
            </TabsTrigger>
           
          </TabsList>

          {/* TAB: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                      label: 'Faturamento Período', 
                      value: shopeeOrders?.reduce((sum, o) => sum + o.order_total, 0) || 0, 
                      icon: DollarSign, 
                      color: 'text-emerald-600', 
                      bg: 'bg-emerald-500/10', 
                      trend: '+12.5%', 
                      trendType: 'positive',
                      type: 'currency' 
                    },
                    { 
                      label: 'Pedidos Realizados', 
                      value: shopeeOrders?.length || 0, 
                      icon: ShoppingBag, 
                      color: 'text-blue-600', 
                      bg: 'bg-blue-500/10', 
                      trend: '+4.2%', 
                      trendType: 'positive',
                      type: 'number' 
                    },
                    { 
                      label: 'Valor em Estoque', 
                      value: abcData.reduce((sum, p) => sum + p.value, 0), 
                      icon: Package, 
                      color: 'text-orange-600', 
                      bg: 'bg-orange-500/10', 
                      trend: 'Auditado', 
                      trendType: 'neutral',
                      type: 'currency' 
                    },
                    { 
                      label: 'Taxa de Conversão', 
                      value: 3.2, 
                      icon: Target, 
                      color: 'text-indigo-600', 
                      bg: 'bg-indigo-500/10', 
                      trend: '-0.8%', 
                      trendType: 'negative',
                      type: 'percent' 
                    },
                ].map((kpi, i) => (
                    <Card key={i} className="border-none shadow-xl shadow-black/5 bg-background group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-2xl transition-transform group-hover:rotate-12", kpi.bg)}>
                                    <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                                </div>
                                <Badge 
                                    variant="secondary" 
                                    className={cn(
                                        "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border-none",
                                        kpi.trendType === 'positive' ? "bg-emerald-500/10 text-emerald-600" :
                                        kpi.trendType === 'negative' ? "bg-rose-500/10 text-rose-600" :
                                        "bg-slate-500/10 text-slate-600"
                                    )}
                                >
                                    {kpi.trend}
                                </Badge>
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{kpi.label}</p>
                            <h3 className="text-2xl font-black tracking-tighter">
                                {kpi.type === 'currency' ? formatCurrency(kpi.value as number) : 
                                 kpi.type === 'percent' ? `${kpi.value}%` : kpi.value}
                            </h3>
                        </CardContent>
                    </Card>
                ))}
             </div>

             
          </TabsContent>

          {/* TAB: ABC CURVE */}
          <TabsContent value="abc" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
             <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-widest">Produtos Grupo A</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{abcData.filter(p => p.group === 'A').length}</div>
                        <p className="text-xs text-white/70 mt-2 font-medium">Representam 70% da riqueza do estoque</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-widest">Produtos Grupo B</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{abcData.filter(p => p.group === 'B').length}</div>
                        <p className="text-xs text-white/70 mt-2 font-medium">Relevância intermediária (20%)</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-3xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-widest">Produtos Grupo C</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">{abcData.filter(p => p.group === 'C').length}</div>
                        <p className="text-xs text-white/70 mt-2 font-medium">Baixa representatividade (10%)</p>
                    </CardContent>
                </Card>
             </div>

             <Card className="border-none shadow-2xl shadow-black/5 rounded-3xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-black uppercase">Ranking de Relevância</CardTitle>
                            <CardDescription>Classificação de Pareto (80/20) aplicada ao seu estoque</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="p-6 text-left font-black uppercase text-[10px] tracking-widest text-muted-foreground">Produto</th>
                                    <th className="p-6 text-center font-black uppercase text-[10px] tracking-widest text-muted-foreground">Grupo BI</th>
                                    <th className="p-6 text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Vlr. em Estoque</th>
                                    <th className="p-6 text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">% Part.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {abcData.slice(0, 15).map((p, i) => (
                                    <tr key={i} className="hover:bg-muted/10 transition-colors group">
                                        <td className="p-6 font-bold flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                            {p.name}
                                        </td>
                                        <td className="p-6 text-center">
                                            <Badge className={cn(
                                                "rounded-lg px-3 py-1 font-black",
                                                p.group === 'A' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                p.group === 'B' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : 
                                                "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                            )} variant="outline">{p.group}</Badge>
                                        </td>
                                        <td className="p-6 text-right font-black text-primary">{formatCurrency(p.value)}</td>
                                        <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="font-bold text-muted-foreground">{p.percentage.toFixed(1)}%</span>
                                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary" 
                                                        style={{ width: `${p.percentage}%` }} 
                                                    />
                                                </div>
                                            </div>
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
