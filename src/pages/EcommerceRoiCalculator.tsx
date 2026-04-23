import { useState, useMemo } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Target,
  BarChart3,
  MousePointer2,
  ShoppingCart,
  Percent,
  RefreshCcw,
  Zap,
  Package,
  Truck,
  Building2,
  Wallet,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const EcommerceRoiCalculator = () => {
    // Traffic & Ads
    const [budget, setBudget] = useState<number>(200);
    const [cpc, setCpc] = useState<number>(0.50);
    const [conversionRate, setConversionRate] = useState<number>(2.0);
    
    // Product
    const [productPrice, setProductPrice] = useState<number>(149.90);
    const [productCost, setProductCost] = useState<number>(50.00);
    const [packagingCost, setPackagingCost] = useState<number>(2.50);

    // Platform & Operation
    const [commissionRate, setCommissionRate] = useState<number>(16.0); // e.g., Mercado Livre Classic
    const [fixedFee, setFixedFee] = useState<number>(6.00); // e.g., Mercado Livre fixed fee
    const [shippingAbsorbed, setShippingAbsorbed] = useState<number>(0.00); // Frete grátis assumido
    const [taxesPercentage, setTaxesPercentage] = useState<number>(5.0); // Simples Nacional

    // Calculations
    const results = useMemo(() => {
        // Tráfego
        const clicks = Math.floor(budget / (cpc || 0.01));
        const sales = Math.floor(clicks * (conversionRate / 100));
        const revenue = sales * productPrice;

        // Custos Variáveis por Venda
        const commissionCostPerSale = productPrice * (commissionRate / 100);
        const taxesCostPerSale = productPrice * (taxesPercentage / 100);
        
        // Custos Totais por Venda (sem Ads)
        const totalCostsPerSale = productCost + packagingCost + commissionCostPerSale + fixedFee + shippingAbsorbed + taxesCostPerSale;
        const grossMarginPerSale = productPrice - totalCostsPerSale;

        // Totais Agregados
        const totalCogs = sales * (productCost + packagingCost);
        const totalPlatformFees = sales * (commissionCostPerSale + fixedFee);
        const totalTaxes = sales * taxesCostPerSale;
        const totalShipping = sales * shippingAbsorbed;
        
        const totalCostWithoutAds = totalCogs + totalPlatformFees + totalTaxes + totalShipping;
        const totalCost = totalCostWithoutAds + budget;
        
        const profit = revenue - totalCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        const roas = budget > 0 ? revenue / budget : 0;
        const roi = budget > 0 ? (profit / budget) * 100 : 0;
        const acos = revenue > 0 ? (budget / revenue) * 100 : 0;
        const cpa = sales > 0 ? budget / sales : 0;

        // Break-even (Ponto de Equilíbrio)
        // ROAS mínimo para empatar = Preço de Venda / Margem Bruta
        const breakEvenRoas = grossMarginPerSale > 0 ? productPrice / grossMarginPerSale : 0;
        // CPA Máximo (Quanto posso pagar por venda para não ter prejuízo) = Margem Bruta
        const maxCpa = grossMarginPerSale;

        return {
            clicks,
            sales,
            revenue,
            totalCogs,
            totalPlatformFees,
            totalTaxes,
            totalShipping,
            totalCost,
            profit,
            margin,
            roas,
            roi,
            acos,
            cpa,
            breakEvenRoas,
            maxCpa,
            grossMarginPerSale
        };
    }, [budget, cpc, conversionRate, productPrice, productCost, packagingCost, commissionRate, fixedFee, shippingAbsorbed, taxesPercentage]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <AppLayout title="Calculadora de ROI" subtitle="Simulador Universal de Custos e Lucratividade para E-commerce">
            <div className="space-y-6 max-w-[1600px] mx-auto">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-800 p-6 sm:p-8 rounded-2xl text-white shadow-xl shadow-blue-900/20">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                            <Target className="h-8 w-8 text-blue-100" />
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Universal ROI Calculator</h2>
                            <p className="text-blue-100 text-sm mt-1 max-w-md">Simule campanhas, descubra seu ROAS de break-even e otimize a lucratividade do seu negócio em qualquer plataforma.</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="gap-2 font-bold shadow-lg bg-white text-blue-900 hover:bg-blue-50 border-none rounded-xl px-6">
                        <RefreshCcw className="h-4 w-4" /> Resetar Valores
                    </Button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* Controles de Entrada */}
                    <div className="xl:col-span-4 space-y-6">
                        <Tabs defaultValue="traffic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                                <TabsTrigger value="traffic" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Tráfego</TabsTrigger>
                                <TabsTrigger value="product" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Produto</TabsTrigger>
                                <TabsTrigger value="platform" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Taxas</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="traffic" className="space-y-4 outline-none">
                                <Card className="border-none shadow-md overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                                    <div className="h-1 w-full bg-blue-500"></div>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2"><MousePointer2 className="h-5 w-5 text-blue-500"/> Investimento (Ads)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="space-y-4">
                                            <Label className="flex justify-between items-end">
                                                <span className="text-muted-foreground">Orçamento Diário</span>
                                                <span className="text-xl text-foreground font-black bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-md">{formatCurrency(budget)}</span>
                                            </Label>
                                            <Slider value={[budget]} min={10} max={2000} step={10} onValueChange={(val) => setBudget(val[0])} className="py-2" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="flex justify-between items-end">
                                                <span className="text-muted-foreground">Custo por Clique (CPC)</span>
                                                <span className="text-xl text-foreground font-black bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-md">{formatCurrency(cpc)}</span>
                                            </Label>
                                            <Slider value={[cpc]} min={0.05} max={5.0} step={0.05} onValueChange={(val) => setCpc(val[0])} className="py-2" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="flex justify-between items-end">
                                                <span className="text-muted-foreground">Taxa de Conversão</span>
                                                <span className="text-xl text-foreground font-black bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-md">{conversionRate.toFixed(1)}%</span>
                                            </Label>
                                            <Slider value={[conversionRate]} min={0.1} max={10} step={0.1} onValueChange={(val) => setConversionRate(val[0])} className="py-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="product" className="space-y-4 outline-none">
                                <Card className="border-none shadow-md overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                                    <div className="h-1 w-full bg-emerald-500"></div>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5 text-emerald-500"/> Custos do Produto</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>Preço de Venda Final</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                                                <Input type="number" className="pl-12 h-12 text-lg font-bold bg-background/50 border-2 focus-visible:border-emerald-500 focus-visible:ring-0" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Custo da Mercadoria (COGS)</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                                                <Input type="number" className="pl-12 h-12 text-lg font-bold bg-background/50 border-2" value={productCost} onChange={e => setProductCost(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Custo de Embalagem</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R$</span>
                                                <Input type="number" className="pl-12 h-12 text-lg font-bold bg-background/50 border-2" value={packagingCost} onChange={e => setPackagingCost(Number(e.target.value))} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="platform" className="space-y-4 outline-none">
                                <Card className="border-none shadow-md overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                                    <div className="h-1 w-full bg-purple-500"></div>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-purple-500"/> Plataforma e Operação</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Comissão (%)</Label>
                                                <div className="relative">
                                                    <Input type="number" className="pr-8 h-11 bg-background/50" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))} />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Taxa Fixa (R$)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <Input type="number" className="pl-9 h-11 bg-background/50" value={fixedFee} onChange={e => setFixedFee(Number(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Frete Assumido (R$)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                                    <Input type="number" className="pl-9 h-11 bg-background/50" value={shippingAbsorbed} onChange={e => setShippingAbsorbed(Number(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Impostos DAS (%)</Label>
                                                <div className="relative">
                                                    <Input type="number" className="pr-8 h-11 bg-background/50" value={taxesPercentage} onChange={e => setTaxesPercentage(Number(e.target.value))} />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Resultados */}
                    <div className="xl:col-span-8 space-y-8">
                        {/* KPIs Principais */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Vendas Proj.', value: results.sales, icon: ShoppingCart, bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-600', prefix: '' },
                                { label: 'Faturamento', value: formatCurrency(results.revenue), icon: Wallet, bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-600', prefix: '' },
                                { label: 'ROAS', value: results.roas.toFixed(2), icon: Zap, bg: 'bg-amber-50 dark:bg-amber-900/20', color: 'text-amber-600', prefix: 'x' },
                                { label: 'ROI', value: results.roi.toFixed(1), icon: TrendingUp, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-600', prefix: '%' }
                            ].map((m, i) => (
                                <Card key={i} className="border-none shadow-sm overflow-hidden relative">
                                    <CardContent className="p-5 relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <p className="text-sm text-muted-foreground font-medium">{m.label}</p>
                                            <div className={cn("p-2 rounded-lg", m.bg)}>
                                                <m.icon className={cn("h-4 w-4", m.color)} />
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <h4 className="text-2xl font-black">{m.value}</h4>
                                            {m.prefix && <span className="text-sm font-bold text-muted-foreground">{m.prefix}</span>}
                                        </div>
                                    </CardContent>
                                    <div className={cn("absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-50", m.bg)}></div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* DRE Resumido */}
                            <Card className="border-none shadow-lg shadow-black/5 bg-gradient-to-b from-white to-gray-50/50 dark:from-zinc-900 dark:to-zinc-950/50">
                                <CardHeader className="border-b bg-background/50 pb-4">
                                    <CardTitle className="text-lg">Demonstrativo de Resultados</CardTitle>
                                    <CardDescription>Resumo financeiro da projeção</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y text-sm">
                                        <div className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
                                            <span className="font-medium">Receita Bruta</span>
                                            <span className="font-bold text-emerald-600">{formatCurrency(results.revenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors text-muted-foreground">
                                            <span>Custos do Produto + Embalagem</span>
                                            <span>- {formatCurrency(results.totalCogs)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors text-muted-foreground">
                                            <span>Taxas da Plataforma</span>
                                            <span>- {formatCurrency(results.totalPlatformFees)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors text-muted-foreground">
                                            <span>Impostos (DAS)</span>
                                            <span>- {formatCurrency(results.totalTaxes)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors text-muted-foreground">
                                            <span>Custos de Frete (Assumidos)</span>
                                            <span>- {formatCurrency(results.totalShipping)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 hover:bg-muted/50 transition-colors text-muted-foreground">
                                            <span>Investimento em Ads</span>
                                            <span>- {formatCurrency(budget)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-5 bg-background border-t-2">
                                            <span className="font-bold text-base">Lucro Líquido Final</span>
                                            <div className="text-right">
                                                <span className={cn("text-2xl font-black block", results.profit > 0 ? "text-emerald-600" : "text-red-600")}>
                                                    {formatCurrency(results.profit)}
                                                </span>
                                                <span className="text-xs font-bold text-muted-foreground mt-1 block">Margem: {results.margin.toFixed(2)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Break-even & Insights */}
                            <div className="space-y-6">
                                <Card className="border-none shadow-md overflow-hidden">
                                    <div className="h-1 w-full bg-orange-500"></div>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-orange-500" /> Break-Even Ads (Ponto de Empate)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-5 border border-orange-100 dark:border-orange-900/30">
                                            <div className="flex justify-between items-end mb-2">
                                                <div>
                                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-300">ROAS Mínimo Necessário</p>
                                                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Para não ter prejuízo na campanha</p>
                                                </div>
                                                <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
                                                    {results.breakEvenRoas > 0 ? results.breakEvenRoas.toFixed(2) : 'N/A'}<span className="text-lg">x</span>
                                                </span>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-900/50 flex justify-between items-center">
                                                <span className="text-sm text-orange-800 dark:text-orange-300">Status da Projeção</span>
                                                {results.roas >= results.breakEvenRoas && results.breakEvenRoas > 0 ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Lucrativa</Badge>
                                                ) : results.breakEvenRoas <= 0 ? (
                                                    <Badge variant="destructive">Prejuízo Base</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Prejuízo na Projeção</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-muted/40 border">
                                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">CPA Máximo Permitido</p>
                                                <p className="text-xl font-bold">{results.maxCpa > 0 ? formatCurrency(results.maxCpa) : 'R$ 0,00'}</p>
                                                <p className="text-[10px] text-muted-foreground leading-tight mt-1">Gasto máx. por venda</p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-muted/40 border">
                                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Margem Bruta (Unit)</p>
                                                <p className={cn("text-xl font-bold", results.grossMarginPerSale > 0 ? "text-foreground" : "text-red-500")}>
                                                    {formatCurrency(results.grossMarginPerSale)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground leading-tight mt-1">Antes dos anúncios</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Alert className="bg-indigo-50 border-indigo-200 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 shadow-sm">
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                    <AlertTitle className="font-bold text-base mb-1">Dica Estratégica</AlertTitle>
                                    <AlertDescription className="text-sm leading-relaxed">
                                        {results.breakEvenRoas <= 0 
                                            ? "Sua margem bruta unitária está negativa antes mesmo de investir em anúncios. Reveja seus custos, reduza o frete assumido ou aumente o preço de venda urgente!"
                                            : results.roas >= results.breakEvenRoas
                                                ? `Parabéns! Sua projeção indica lucro. O ROAS projetado (${results.roas.toFixed(2)}x) é maior que seu Break-even (${results.breakEvenRoas.toFixed(2)}x). Você tem margem para escalar o orçamento.`
                                                : `Sua campanha está projetando prejuízo. Você precisa de um ROAS de pelo menos ${results.breakEvenRoas.toFixed(2)}x para empatar. Tente reduzir o CPC alvo para ${formatCurrency(cpc * 0.8)} ou melhorar a conversão.`}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default EcommerceRoiCalculator;
