import { useState, useMemo } from "react";
import { Calculator, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Info, FileText, Users, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";

const ShopeeRoiSimulator = () => {
    // State for inputs
    const [budget, setBudget] = useState<number>(50);
    const [cpc, setCpc] = useState<number>(0.5);
    const [conversionRate, setConversionRate] = useState<number>(1.5);
    const [productPrice, setProductPrice] = useState<number>(89.90);
    const [productCost, setProductCost] = useState<number>(35.00);
    const [hasFreeShipping, setHasFreeShipping] = useState<boolean>(true);

    // Offline / Flyer Strategy State
    const [flyerCount, setFlyerCount] = useState<number>(0);
    const [flyerCost, setFlyerCost] = useState<number>(0.15); // printing + distribution per unit
    const [flyerReturnRate, setFlyerReturnRate] = useState<number>(1.0); // % of people who visit store/site

    // Calculations
    const results = useMemo(() => {
        // --- Online Traffic ---
        const clicks = Math.floor(budget / (cpc || 0.01));
        
        // --- Offline Traffic ---
        const offlineVisits = Math.floor(flyerCount * (flyerReturnRate / 100));
        const offlineCost = flyerCount * flyerCost;

        // --- Total Traffic (Leads/Visits) ---
        const totalVisits = clicks + offlineVisits;

        // --- Sales ---
        // Assuming offline visits convert at the same rate as online clicks for simplicity, 
        // or we could add a separate conversion rate for offline. 
        // For this simulator, we'll apply the same "Taxa de Conversão Estimada" to all traffic.
        const sales = Math.floor(totalVisits * (conversionRate / 100));
        const revenue = sales * productPrice;

        // --- Costs ---
        // Shopee Fees
        // Commission: Standard 14% + Free Shipping Program (if active) 6% = 20%
        const commissionRate = hasFreeShipping ? 0.20 : 0.14;
        // Fixed fee per sold item: R$ 3.00
        const fixedFeePerSale = 3.00;
        
        const variableFeeCost = revenue * commissionRate;
        const fixedFeeCost = sales * fixedFeePerSale;
        const totalShopeeFees = variableFeeCost + fixedFeeCost;

        const totalProductCost = sales * productCost;
        
        // Total Cost = Shopee Fees + Product Cost + Ads Budget + Offline Cost
        const totalCost = totalShopeeFees + totalProductCost + budget + offlineCost;
        
        const profit = revenue - totalCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        // ROAS (Return on Ad Spend) -> Here we consider Total Marketing Spend (Online + Offline)
        const totalMarketingSpend = budget + offlineCost;
        const roas = totalMarketingSpend > 0 ? revenue / totalMarketingSpend : 0;

        // Break-even analysis (Simplified for Online Only context usually, but adapted here)
        // This is complex with mixed sources. We'll keep the simplified Break-even for ONLINE CPC
        // as it's the most common dynamic variable.
        const profitPerSaleBeforeAds = productPrice - productCost - (productPrice * commissionRate) - fixedFeePerSale;
        
        const breakEvenConversionRate = profitPerSaleBeforeAds > 0 
            ? (cpc / profitPerSaleBeforeAds) * 100 
            : 100;

        return {
            clicks,
            offlineVisits,
            totalVisits,
            sales,
            revenue,
            totalShopeeFees,
            variableFeeCost,
            fixedFeeCost,
            totalProductCost,
            offlineCost,
            totalMarketingSpend,
            totalCost,
            profit,
            margin,
            roas,
            breakEvenConversionRate,
            commissionRate
        };
    }, [budget, cpc, conversionRate, productPrice, productCost, hasFreeShipping, flyerCount, flyerCost, flyerReturnRate]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const formatNumber = (val: number) => {
        return new Intl.NumberFormat('pt-BR').format(val);
    };

    return (
        <AppLayout title="Simulador de Inteligência Shopee" subtitle="Análise completa de ROI: Tráfego Pago e Estratégias Offline.">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-fade-in space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-950/30 rounded-lg">
                        <Calculator className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Simulador de Inteligência Shopee</h1>
                        <p className="text-muted-foreground">Analise o impacto combinado de Ads e ações offline (panfletagem) no seu lucro.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Online Ads Card */}
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" />
                                Tráfego Pago (Ads)
                            </CardTitle>
                            <CardDescription>Parâmetros da campanha online</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Budget */}
                            <div className="space-y-3">
                                <Label htmlFor="budget" className="text-base font-semibold">Orçamento Diário</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                                    <Input 
                                        id="budget" 
                                        type="number" 
                                        value={budget} 
                                        onChange={(e) => setBudget(Number(e.target.value))} 
                                        className="pl-9 text-lg font-medium" 
                                        min={1}
                                    />
                                </div>
                            </div>

                            {/* CPC */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="cpc">CPC Médio</Label>
                                    <span className="font-mono text-primary font-bold">{formatCurrency(cpc)}</span>
                                </div>
                                <Slider 
                                    value={[cpc]} 
                                    min={0.1} 
                                    max={5.0} 
                                    step={0.05} 
                                    onValueChange={(val) => setCpc(val[0])} 
                                    className="py-2"
                                />
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                                    <Input 
                                        id="cpc-input" 
                                        type="number" 
                                        value={cpc} 
                                        onChange={(e) => setCpc(Number(e.target.value))} 
                                        className="pl-9" 
                                        step={0.01}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Offline Strategy Card */}
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Estratégias Offline (Panfletagem)
                            </CardTitle>
                            <CardDescription>Estimativa de leads físicos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             {/* Flyer Count */}
                             <div className="space-y-3">
                                <Label htmlFor="flyers" className="text-base font-semibold">Qtd. Panfletos/Dia</Label>
                                <Input 
                                    id="flyers" 
                                    type="number" 
                                    value={flyerCount} 
                                    onChange={(e) => setFlyerCount(Number(e.target.value))} 
                                    className="text-lg font-medium" 
                                    min={0}
                                    placeholder="Ex: 500"
                                />
                            </div>

                             {/* Flyer Cost */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label htmlFor="flyer-cost">Custo Unitário</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                        <Input 
                                            id="flyer-cost" 
                                            type="number" 
                                            value={flyerCost} 
                                            onChange={(e) => setFlyerCost(Number(e.target.value))} 
                                            className="pl-8" 
                                            step={0.01}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Impressão + Distribuição</p>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="flyer-return">Taxa de Retorno</Label>
                                    <div className="relative">
                                        <Input 
                                            id="flyer-return" 
                                            type="number" 
                                            value={flyerReturnRate} 
                                            onChange={(e) => setFlyerReturnRate(Number(e.target.value))} 
                                            className="pl-3 pr-8" 
                                            step={0.1}
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Visitas esperadas</p>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-700 dark:text-blue-300 flex justify-between">
                                <span>Estimativa Offline:</span>
                                <strong>{results.offlineVisits} visitas</strong>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Product & Conversion */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Produto e Conversão</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Conversion Rate */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="conversion">Taxa de Conversão Geral</Label>
                                    <span className="font-mono text-primary font-bold">{conversionRate.toFixed(1)}%</span>
                                </div>
                                <Slider 
                                    value={[conversionRate]} 
                                    min={0.1} 
                                    max={10.0} 
                                    step={0.1} 
                                    onValueChange={(val) => setConversionRate(val[0])} 
                                    className="py-2"
                                />
                                <p className="text-xs text-muted-foreground">Aplicada tanto para tráfego online quanto offline.</p>
                            </div>

                            <Separator />

                            {/* Product Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label htmlFor="price">Preço de Venda</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                        <Input 
                                            id="price" 
                                            type="number" 
                                            value={productPrice} 
                                            onChange={(e) => setProductPrice(Number(e.target.value))} 
                                            className="pl-8" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="cost">Custo / CMV</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">R$</span>
                                        <Input 
                                            id="cost" 
                                            type="number" 
                                            value={productCost} 
                                            onChange={(e) => setProductCost(Number(e.target.value))} 
                                            className="pl-8" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label htmlFor="free-shipping" className="text-base">Programa Frete Grátis Extra</Label>
                                    <p className="text-xs text-muted-foreground">Comissão Shopee: {(results.commissionRate * 100).toFixed(0)}% + R$ 3,00</p>
                                </div>
                                <Switch 
                                    id="free-shipping" 
                                    checked={hasFreeShipping} 
                                    onCheckedChange={setHasFreeShipping} 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Traffic Card - Combined */}
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                                    <Users className="w-4 h-4" /> Leads Totais (Visitas)
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatNumber(results.totalVisits)}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <p className="text-xs text-muted-foreground">
                                    {formatNumber(results.clicks)} Online + {formatNumber(results.offlineVisits)} Offline
                                </p>
                            </CardContent>
                        </Card>
                        
                        {/* Sales Card */}
                         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" /> Vendas Prováveis
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatNumber(results.sales)}</CardTitle>
                            </CardHeader>
                        </Card>

                        {/* Revenue Card */}
                         <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 border-emerald-200 dark:border-emerald-800">
                            <CardHeader className="pb-2">
                                <CardDescription className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" /> Faturamento Bruto
                                </CardDescription>
                                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(results.revenue)}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Financial Breakdown */}
                    <Card className="shadow-lg border-t-4 border-t-gray-800 dark:border-t-gray-300">
                        <CardHeader>
                            <CardTitle>Detalhamento Financeiro</CardTitle>
                            <CardDescription>Custos online e offline vs. Retorno</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            
                            {/* Costs */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        Investimento Ads (Online)
                                    </span>
                                    <span>{formatCurrency(budget)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        Custo Panfletagem (Offline)
                                    </span>
                                    <span>{formatCurrency(results.offlineCost)}</span>
                                </div>
                                <Separator className="my-1 opacity-50" />
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        Custo dos Produtos (CMV)
                                    </span>
                                    <span>{formatCurrency(results.totalProductCost)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        Taxas Shopee
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger><Info className="w-3 h-3 ml-1" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Comissão ({hasFreeShipping ? '20%' : '14%'}): {formatCurrency(results.variableFeeCost)}</p>
                                                    <p>Taxa Fixa (R$ 3,00/venda): {formatCurrency(results.fixedFeeCost)}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </span>
                                    <span className="text-red-500 font-medium font-mono">- {formatCurrency(results.totalShopeeFees)}</span>
                                </div>
                                
                                <Separator className="my-2" />
                                
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Lucro Líquido Estimado</span>
                                    <span className={results.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                        {formatCurrency(results.profit)}
                                    </span>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Performance Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className={results.profit < 0 ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20" : ""}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Margem de Lucro</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span className={`text-2xl font-bold ${results.margin < 5 ? "text-red-500" : results.margin < 15 ? "text-yellow-600" : "text-green-600"}`}>
                                        {results.margin.toFixed(1)}%
                                    </span>
                                    {results.margin < 5 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Margem sobre o faturamento total.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">ROAS (Mkt Total)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-primary">
                                        {results.roas.toFixed(2)}x
                                    </span>
                                    {results.roas > 1 ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Retorno (Online + Offline).</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts and Insights */}
                    {results.margin < 5 && results.revenue > 0 && (
                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Atenção: Margem Baixa!</AlertTitle>
                            <AlertDescription>
                                Sua margem está abaixo de 5%. Considere:
                                <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                    <li>Aumentar o preço do produto.</li>
                                    <li>Revisar custos de panfletagem ({formatCurrency(flyerCost)}/un é competitivo?).</li>
                                    <li>Otimizar fotos para aumentar conversão.</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                    <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Insight de Mercado</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Combinar tráfego pago com estratégias offline pode reduzir seu custo médio por aquisição, mas fique atento à <strong>Taxa de Retorno</strong> dos panfletos, que costuma ser menor que cliques diretos.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
        </AppLayout>
    );
};

export default ShopeeRoiSimulator;
