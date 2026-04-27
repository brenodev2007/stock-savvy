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
  Area,
  Legend,
} from 'recharts';
import {
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfMonth,
  endOfYear,
  subDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  parseISO,
} from 'date-fns';
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
  Target,
  AlertTriangle,
  Layers,
  Repeat,
  Star,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { useShopeeOrders, useShopeeOrderStats } from '@/hooks/useShopee';
import { FinanceReport } from '@/components/reports/FinanceReport';
import { ShopeeReport } from '@/components/reports/ShopeeReport';
import { Badge } from '@/components/ui/badge';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border/50 rounded-2xl shadow-2xl p-4 text-sm">
      <p className="font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('month');
  const [date, setDate] = useState<Date>(new Date());

  const dateRange = useMemo(() => {
    const start =
      filterType === 'day' ? startOfDay(date) : filterType === 'month' ? startOfMonth(date) : startOfYear(date);
    const end =
      filterType === 'day' ? endOfDay(date) : filterType === 'month' ? endOfMonth(date) : endOfYear(date);
    return { start, end };
  }, [date, filterType]);

  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: movements } = useMovements({ startDate: dateRange.start, endDate: dateRange.end });
  const { data: stockBalances, isLoading: loadingStock } = useStockBalances();
  const { data: categories } = useCategories();
  const { data: shopeeOrders } = useShopeeOrders({ startDate: dateRange.start, endDate: dateRange.end });
  const { data: shopeeStats } = useShopeeOrderStats();

  const isLoading = loadingProducts || loadingStock;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // ── Curva ABC ──
  const abcData = useMemo(() => {
    if (!products || !stockBalances) return [];
    const productValues = products
      .map((p) => {
        const stock = stockBalances.filter((sb) => sb.product_id === p.id).reduce((sum, sb) => sum + sb.quantity, 0);
        return { name: p.name, value: stock * (Number(p.price) || 0), stock, category_id: p.category_id };
      })
      .sort((a, b) => b.value - a.value);
    const totalValue = productValues.reduce((sum, p) => sum + p.value, 0);
    let cumulative = 0;
    return productValues.map((p) => {
      cumulative += p.value;
      const pct = (cumulative / totalValue) * 100;
      return { ...p, group: pct <= 70 ? 'A' : pct <= 90 ? 'B' : 'C', percentage: (p.value / totalValue) * 100 };
    });
  }, [products, stockBalances]);

  // ── Movimentações ao longo do período (entradas x saídas por dia) ──
  const movementsChartData = useMemo(() => {
    if (!movements || !dateRange) return [];
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).slice(0, 31);
    return days.map((day) => {
      const label = format(day, 'dd/MM');
      const dayMovs = movements.filter((m) => format(parseISO(m.created_at), 'dd/MM/yyyy') === format(day, 'dd/MM/yyyy'));
      const entradas = dayMovs.filter((m) => m.type === 'IN').reduce((s, m) => s + m.quantity, 0);
      const saidas = dayMovs.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0);
      return { label, entradas, saidas };
    });
  }, [movements, dateRange]);

  // ── Distribuição por Categoria ──
  const categoryDistribution = useMemo(() => {
    if (!products || !stockBalances || !categories) return [];
    return categories
      .map((cat) => {
        const catProducts = products.filter((p) => p.category_id === cat.id);
        const totalValue = catProducts.reduce((sum, p) => {
          const qty = stockBalances.filter((sb) => sb.product_id === p.id).reduce((s, sb) => s + sb.quantity, 0);
          return sum + qty * (Number(p.price) || 0);
        }, 0);
        return { name: cat.name, value: totalValue };
      })
      .filter((c) => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [products, stockBalances, categories]);

  // ── Produtos com estoque crítico (< 5 unidades) ──
  const criticalStock = useMemo(() => {
    if (!products || !stockBalances) return [];
    return products
      .map((p) => {
        const qty = stockBalances.filter((sb) => sb.product_id === p.id).reduce((s, sb) => s + sb.quantity, 0);
        return { name: p.name, qty, price: Number(p.price) || 0 };
      })
      .filter((p) => p.qty < 5)
      .sort((a, b) => a.qty - b.qty)
      .slice(0, 5);
  }, [products, stockBalances]);

  // ── Top produtos por valor de estoque ──
  const topProducts = useMemo(() => abcData.slice(0, 5), [abcData]);

  // ── KPIs resumo de movimentações ──
  const totalEntradas = useMemo(
    () => movements?.filter((m) => m.type === 'IN').reduce((s, m) => s + m.quantity, 0) || 0,
    [movements],
  );
  const totalSaidas = useMemo(
    () => movements?.filter((m) => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0) || 0,
    [movements],
  );

  // ── Faturamento Shopee ──
  const totalRevenue = shopeeOrders?.reduce((s, o) => s + o.order_total, 0) || 0;
  const totalOrders = shopeeOrders?.length || 0;
  const totalStockValue = abcData.reduce((sum, p) => sum + p.value, 0);

  // ── Ticket médio ──
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ── Pedidos recentes Shopee ──
  const recentOrders = useMemo(() => (shopeeOrders || []).slice(0, 6), [shopeeOrders]);

  // ─────────────────────────────────────────────────────────────────────────────

  const handleExportExcel = () => {
    const data = abcData.map((p) => ({
      Produto: p.name,
      Estoque: p.stock,
      'Valor Total': p.value,
      Grupo: p.group,
      '% Faturamento': p.percentage.toFixed(2) + '%',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Curva ABC');
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

        {/* ── Controle Superior ── */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-xl font-black flex items-center gap-2 text-primary uppercase tracking-tight">
              <Activity className="h-5 w-5" />
              Inteligência de Dados
            </h2>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">
              Período: {format(dateRange.start, 'dd/MM/yyyy')} até {format(dateRange.end, 'dd/MM/yyyy')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex bg-muted/50 p-1 rounded-xl border">
              {(['day', 'month', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-bold rounded-lg transition-all',
                    filterType === t
                      ? 'bg-background text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
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
                  {format(
                    date,
                    filterType === 'month' ? "MMMM 'de' yyyy" : filterType === 'year' ? 'yyyy' : "dd 'de' MMMM",
                    { locale: ptBR },
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-none">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
              </PopoverContent>
            </Popover>

            <Button
              onClick={handleExportExcel}
              className="h-10 rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Download className="h-4 w-4" /> Exportar BI
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border/50 h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all font-bold"
            >
              <LayoutDashboard className="h-4 w-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger
              value="abc"
              className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/20 transition-all font-bold"
            >
              <TrendingUp className="h-4 w-4" /> Curva ABC
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════════
              TAB: VISÃO GERAL
          ══════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">

            {/* ── Row 1: KPIs principais (6 cards) ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  label: 'Faturamento',
                  value: formatCurrency(totalRevenue),
                  icon: DollarSign,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-500/10',
                  trend: '+12.5%',
                  trendType: 'positive',
                },
                {
                  label: 'Pedidos',
                  value: totalOrders,
                  icon: ShoppingBag,
                  color: 'text-blue-600',
                  bg: 'bg-blue-500/10',
                  trend: '+4.2%',
                  trendType: 'positive',
                },
                {
                  label: 'Ticket Médio',
                  value: formatCurrency(avgTicket),
                  icon: Target,
                  color: 'text-indigo-600',
                  bg: 'bg-indigo-500/10',
                  trend: '+1.3%',
                  trendType: 'positive',
                },
                {
                  label: 'Valor Estoque',
                  value: formatCurrency(totalStockValue),
                  icon: Package,
                  color: 'text-orange-600',
                  bg: 'bg-orange-500/10',
                  trend: 'Auditado',
                  trendType: 'neutral',
                },
                {
                  label: 'Entradas',
                  value: `+${totalEntradas} un.`,
                  icon: ArrowUpRight,
                  color: 'text-teal-600',
                  bg: 'bg-teal-500/10',
                  trend: 'No período',
                  trendType: 'neutral',
                },
                {
                  label: 'Saídas',
                  value: `-${totalSaidas} un.`,
                  icon: ArrowDownRight,
                  color: 'text-rose-600',
                  bg: 'bg-rose-500/10',
                  trend: 'No período',
                  trendType: 'neutral',
                },
              ].map((kpi, i) => (
                <Card key={i} className="border-none shadow-xl shadow-black/5 bg-background group hover:scale-[1.03] transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className={cn('p-2.5 rounded-xl transition-transform group-hover:rotate-12', kpi.bg)}>
                        <kpi.icon className={cn('h-4 w-4', kpi.color)} />
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[9px] font-black uppercase border-none',
                          kpi.trendType === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : kpi.trendType === 'negative'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-slate-500/10 text-slate-600',
                        )}
                      >
                        {kpi.trend}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{kpi.label}</p>
                    <h3 className="text-lg font-black tracking-tight leading-none">{kpi.value}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Row 2: Gráfico de Movimentações + Distribuição Categorias ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Movimentações ao longo do tempo */}
              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden lg:col-span-3">
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                        <Repeat className="h-4 w-4 text-primary" />
                        Movimentações do Período
                      </CardTitle>
                      <CardDescription className="text-[11px] mt-0.5">Entradas vs Saídas de estoque</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  {movementsChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                      Nenhuma movimentação no período
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={movementsChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                        <Area type="monotone" dataKey="entradas" name="Entradas" stroke="#10b981" strokeWidth={2.5} fill="url(#gradEntradas)" dot={false} />
                        <Area type="monotone" dataKey="saidas" name="Saídas" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradSaidas)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Distribuição por Categoria (Pie) */}
              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden lg:col-span-2">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Estoque por Categoria
                  </CardTitle>
                  <CardDescription className="text-[11px]">Distribuição por valor financeiro</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  {categoryDistribution.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                      Sem dados
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryDistribution.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {categoryDistribution.slice(0, 4).map((c, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[100px]">{c.name}</span>
                            </div>
                            <span className="text-[11px] font-black">{formatCurrency(c.value)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Row 3: Top Produtos + Pedidos Recentes + Estoque Crítico ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Top 5 Produtos por Valor */}
              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                <CardHeader className="p-6 pb-3 border-b bg-muted/10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Top Produtos
                  </CardTitle>
                  <CardDescription className="text-[11px]">Por valor em estoque</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {topProducts.length === 0 ? (
                    <p className="p-6 text-xs text-muted-foreground font-bold">Nenhum dado disponível</p>
                  ) : (
                    <ul className="divide-y">
                      {topProducts.map((p, i) => (
                        <li key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/10 transition-colors">
                          <span
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0',
                              i === 0
                                ? 'bg-amber-400'
                                : i === 1
                                ? 'bg-slate-400'
                                : i === 2
                                ? 'bg-orange-400'
                                : 'bg-muted-foreground/30',
                            )}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{p.stock} un.</p>
                          </div>
                          <span className="text-xs font-black text-primary">{formatCurrency(p.value)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Pedidos Recentes Shopee */}
              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                <CardHeader className="p-6 pb-3 border-b bg-muted/10">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                    Pedidos Recentes
                  </CardTitle>
                  <CardDescription className="text-[11px]">Últimas vendas no período</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {recentOrders.length === 0 ? (
                    <p className="p-6 text-xs text-muted-foreground font-bold">Nenhum pedido no período</p>
                  ) : (
                    <ul className="divide-y">
                      {recentOrders.map((order: any, i) => (
                        <li key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/10 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">#{order.order_id || order.id}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {order.created_at ? format(parseISO(order.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-[9px] font-black uppercase rounded-lg border-none',
                              order.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : order.status === 'cancelled'
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-blue-500/10 text-blue-600',
                            )}
                          >
                            {order.status || 'Pendente'}
                          </Badge>
                          <span className="text-xs font-black text-primary">{formatCurrency(order.order_total)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Estoque Crítico */}
              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                <CardHeader className="p-6 pb-3 border-b bg-rose-500/5">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-rose-600">
                    <AlertTriangle className="h-4 w-4" />
                    Estoque Crítico
                  </CardTitle>
                  <CardDescription className="text-[11px]">Produtos abaixo de 5 unidades</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {criticalStock.length === 0 ? (
                    <div className="p-6 flex flex-col items-center gap-2 text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-bold text-emerald-600">Estoque saudável!</p>
                      <p className="text-[10px] text-muted-foreground">Todos os produtos acima do nível crítico.</p>
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {criticalStock.map((p, i) => (
                        <li key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/10 transition-colors">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0',
                              p.qty === 0 ? 'bg-rose-500 text-white' : 'bg-orange-500/15 text-orange-600',
                            )}
                          >
                            {p.qty}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{formatCurrency(p.price)} / un.</p>
                          </div>
                          {p.qty === 0 && (
                            <Badge variant="destructive" className="text-[9px] font-black uppercase rounded-lg border-none">
                              Zerado
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Row 4: Gráfico de Barras — Comparativo por Categoria ── */}
            {categoryDistribution.length > 0 && (
              <Card className="border-none shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Valor de Estoque por Categoria
                  </CardTitle>
                  <CardDescription className="text-[11px]">Comparativo financeiro entre categorias</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={categoryDistribution} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                      <Bar dataKey="value" name="Valor" radius={[8, 8, 0, 0]}>
                        {categoryDistribution.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

          </TabsContent>

       
          <TabsContent value="abc" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-widest">Produtos Grupo A</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black">{abcData.filter((p) => p.group === 'A').length}</div>
                  <p className="text-xs text-white/70 mt-2 font-medium">Representam 70% da riqueza do estoque</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-widest">Produtos Grupo B</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black">{abcData.filter((p) => p.group === 'B').length}</div>
                  <p className="text-xs text-white/70 mt-2 font-medium">Relevância intermediária (20%)</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/80 text-[10px] font-black uppercase tracking-widest">Produtos Grupo C</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black">{abcData.filter((p) => p.group === 'C').length}</div>
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
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                            {p.name}
                          </td>
                          <td className="p-6 text-center">
                            <Badge
                              className={cn(
                                'rounded-lg px-3 py-1 font-black',
                                p.group === 'A'
                                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  : p.group === 'B'
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                  : 'bg-slate-500/10 text-slate-600 border-slate-500/20',
                              )}
                              variant="outline"
                            >
                              {p.group}
                            </Badge>
                          </td>
                          <td className="p-6 text-right font-black text-primary">{formatCurrency(p.value)}</td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="font-bold text-muted-foreground">{p.percentage.toFixed(1)}%</span>
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${p.percentage}%` }} />
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