import { useState, useMemo } from "react";
import { 
  Calculator, 
  TrendingUp, 
  Target,
  BarChart3,
  MousePointer2,
  ShoppingCart,
  Zap,
  Package,
  Building2,
  Wallet,
  RefreshCcw,
  DollarSign,
  ArrowRight,
  ChevronRight
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Simulations = () => {
    // --- ROI Calculator State ---
    const [budget, setBudget] = useState<number>(200);
    const [cpc, setCpc] = useState<number>(0.50);
    const [conversionRate, setConversionRate] = useState<number>(2.0);
    const [productPrice, setProductPrice] = useState<number>(149.90);
    const [productCost, setProductCost] = useState<number>(50.00);
    const [packagingCost, setPackagingCost] = useState<number>(2.50);
    const [commissionRate, setCommissionRate] = useState<number>(16.0);
    const [fixedFee, setFixedFee] = useState<number>(6.00);
    const [shippingAbsorbed, setShippingAbsorbed] = useState<number>(0.00);
    const [taxesPercentage, setTaxesPercentage] = useState<number>(5.0);

    // --- Pricing Calculator State ---
    const [pCost, setPCost] = useState<number>(50);
    const [pPlatformFixedFee, setPPlatformFixedFee] = useState<number>(5);
    const [pVariableRate, setPVariableRate] = useState<number>(16);
    const [pSellingPrice, setPSellingPrice] = useState<number>(149.90);

    // --- ROI Calculations ---
    const roiResults = useMemo(() => {
        const clicks = Math.floor(budget / (cpc || 0.01));
        const sales = Math.floor(clicks * (conversionRate / 100));
        const revenue = sales * productPrice;
        const commissionCostPerSale = productPrice * (commissionRate / 100);
        const taxesCostPerSale = productPrice * (taxesPercentage / 100);
        const totalCostsPerSale = productCost + packagingCost + commissionCostPerSale + fixedFee + shippingAbsorbed + taxesCostPerSale;
        const grossMarginPerSale = productPrice - totalCostsPerSale;
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
        const breakEvenRoas = grossMarginPerSale > 0 ? productPrice / grossMarginPerSale : 0;
        const maxCpa = grossMarginPerSale;

        return {
            clicks, sales, revenue, totalCogs, totalPlatformFees, totalTaxes,
            totalShipping, totalCost, profit, margin, roas, roi, breakEvenRoas, maxCpa, grossMarginPerSale
        };
    }, [budget, cpc, conversionRate, productPrice, productCost, packagingCost, commissionRate, fixedFee, shippingAbsorbed, taxesPercentage]);

    // --- Pricing Calculations ---
    const pricingResults = useMemo(() => {
        const commissionValue = pSellingPrice * (pVariableRate / 100);
        const platformCost = commissionValue + pPlatformFixedFee;
        const unitCost = pCost + platformCost;
        const profit = pSellingPrice - unitCost;
        const marginPercent = pSellingPrice > 0 ? (profit / pSellingPrice) * 100 : 0;

        return { commissionValue, platformCost, unitCost, profit, marginPercent };
    }, [pCost, pPlatformFixedFee, pVariableRate, pSellingPrice]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <AppLayout title="Simulações" subtitle="Ferramentas estratégicas para precificação e análise de retorno">
            <div className="space-y-6 max-w-[1600px] mx-auto">
                
                <Tabs defaultValue="roi" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 rounded-xl w-fit">
                        <TabsTrigger value="roi" className="gap-2 px-6">
                            <Target className="h-4 w-4" /> ROI de Anúncios
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="gap-2 px-6">
                            <Calculator className="h-4 w-4" /> Precificação & Lucro
                        </TabsTrigger>
                    </TabsList>

                    {/* ROI Tab Content */}
                    <TabsContent value="roi" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 outline-none">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary to-primary/80 p-6 rounded-2xl text-primary-foreground shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <TrendingUp className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Simulador de ROI Ads</h2>
                                    <p className="text-primary-foreground/80 text-sm">Descubra a viabilidade das suas campanhas pagas</p>
                                </div>
                            </div>
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => {
                                setBudget(200); setCpc(0.5); setConversionRate(2);
                            }}>
                                <RefreshCcw className="h-4 w-4 mr-2" /> Resetar Tráfego
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                            {/* Inputs */}
                            <div className="xl:col-span-4 space-y-4">
                                <Card className="border-none shadow-md overflow-hidden">
                                    <div className="h-1 w-full bg-primary"></div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2"><MousePointer2 className="h-4 w-4 text-primary"/> Investimento</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                Orçamento Diário
                                                <span className="text-primary">{formatCurrency(budget)}</span>
                                            </Label>
                                            <Slider value={[budget]} min={10} max={2000} step={10} onValueChange={(v) => setBudget(v[0])} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                CPC Médio
                                                <span className="text-primary">{formatCurrency(cpc)}</span>
                                            </Label>
                                            <Slider value={[cpc]} min={0.05} max={5.0} step={0.05} onValueChange={(v) => setCpc(v[0])} />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                Taxa de Conversão
                                                <span className="text-primary">{conversionRate.toFixed(1)}%</span>
                                            </Label>
                                            <Slider value={[conversionRate]} min={0.1} max={15} step={0.1} onValueChange={(v) => setConversionRate(v[0])} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-md overflow-hidden">
                                    <div className="h-1 w-full bg-success"></div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4 text-success"/> Margem do Produto</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-muted-foreground">Preço de Venda</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                                                    <Input type="number" className="pl-9 font-bold" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold text-muted-foreground">CMV (Custo)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                                        <Input type="number" className="pl-7 text-sm" value={productCost} onChange={e => setProductCost(Number(e.target.value))} />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-bold text-muted-foreground">Comissão (%)</Label>
                                                    <div className="relative">
                                                        <Input type="number" className="pr-6 text-sm" value={commissionRate} onChange={e => setCommissionRate(Number(e.target.value))} />
                                                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Results */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Card className="border-none shadow-sm bg-primary/5">
                                        <CardContent className="p-4 pt-6 text-center">
                                            <ShoppingCart className="h-5 w-5 mx-auto mb-2 text-primary" />
                                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Vendas Est.</p>
                                            <h4 className="text-2xl font-black">{roiResults.sales}</h4>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-sm bg-secondary">
                                        <CardContent className="p-4 pt-6 text-center">
                                            <Wallet className="h-5 w-5 mx-auto mb-2 text-secondary-foreground" />
                                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">Faturamento</p>
                                            <h4 className="text-2xl font-black">{formatCurrency(roiResults.revenue)}</h4>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-sm bg-accent/10">
                                        <CardContent className="p-4 pt-6 text-center">
                                            <Zap className="h-5 w-5 mx-auto mb-2 text-accent" />
                                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">ROAS</p>
                                            <h4 className="text-2xl font-black">{roiResults.roas.toFixed(2)}x</h4>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-sm bg-success/5">
                                        <CardContent className="p-4 pt-6 text-center">
                                            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-success" />
                                            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-tighter">ROI</p>
                                            <h4 className="text-2xl font-black">{roiResults.roi.toFixed(1)}%</h4>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="border-none shadow-lg">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle className="text-base">Análise de Lucratividade</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4 pt-6">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">Receita Total</span>
                                                <span className="font-bold">{formatCurrency(roiResults.revenue)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-red-500">
                                                <span>Total Custos (Prod+Taxas)</span>
                                                <span>- {formatCurrency(roiResults.totalCost - budget)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-red-500">
                                                <span>Investimento Ads</span>
                                                <span>- {formatCurrency(budget)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="font-black text-lg">Lucro Final</span>
                                                <span className={cn("text-3xl font-black", roiResults.profit > 0 ? "text-success" : "text-destructive")}>
                                                    {formatCurrency(roiResults.profit)}
                                                </span>
                                            </div>
                                            <div className="text-right text-[10px] font-bold text-muted-foreground">
                                                MARGEM LÍQUIDA: {roiResults.margin.toFixed(2)}%
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-md bg-accent/5">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2 text-accent"><Target className="h-4 w-4" /> Ponto de Equilíbrio</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="text-center p-6 bg-accent/10 rounded-2xl border border-accent/20">
                                                <p className="text-[10px] uppercase font-black text-accent tracking-widest mb-1">ROAS de Break-even</p>
                                                <h3 className="text-5xl font-black text-accent">
                                                    {roiResults.breakEvenRoas.toFixed(2)}<span className="text-2xl font-bold">x</span>
                                                </h3>
                                                <p className="text-xs text-accent/70 mt-2 font-medium">Mínimo necessário para não ter prejuízo</p>
                                            </div>
                                            <Alert className={cn("border-none", roiResults.roas >= roiResults.breakEvenRoas ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                                                <div className="flex items-center gap-3">
                                                    {roiResults.roas >= roiResults.breakEvenRoas ? <Zap className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                                                    <p className="text-xs font-bold leading-tight">
                                                        {roiResults.roas >= roiResults.breakEvenRoas 
                                                            ? "Sua campanha está lucrativa! Você pode escalar o orçamento." 
                                                            : "Atenção: Sua campanha está operando abaixo do ponto de equilíbrio."}
                                                    </p>
                                                </div>
                                            </Alert>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                                       <TabsContent value="pricing" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 outline-none">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-success to-success/80 p-6 rounded-2xl text-success-foreground shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <DollarSign className="h-6 w-6 text-success-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Simulador de Precificação</h2>
                                    <p className="text-success-foreground/80 text-sm">Ajuste seu preço para maximizar a margem de lucro</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-5 space-y-6">
                                <Card className="border-none shadow-md overflow-hidden">
                                    <div className="h-1 w-full bg-success"></div>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Configurar Valores</CardTitle>
                                        <CardDescription>Defina os parâmetros do seu produto</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Preço de Venda Desejado</Label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">R$</span>
                                                <Input type="number" className="pl-12 h-14 text-2xl font-black bg-success/5 border-success/20" value={pSellingPrice} onChange={e => setPSellingPrice(Number(e.target.value))} />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custo da Mercadoria (CMV)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                                                    <Input type="number" className="pl-9" value={pCost} onChange={e => setPCost(Number(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comissão (%)</Label>
                                                    <div className="relative">
                                                        <Input type="number" className="pr-8" value={pVariableRate} onChange={e => setPVariableRate(Number(e.target.value))} />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Taxa Fixa (R$)</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                                                        <Input type="number" className="pl-9" value={pPlatformFixedFee} onChange={e => setPPlatformFixedFee(Number(e.target.value))} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="lg:col-span-7 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border-none shadow-lg bg-success/10">
                                        <CardContent className="p-8">
                                            <p className="text-[10px] uppercase font-black text-success tracking-widest mb-2">Lucro Líquido Unitário</p>
                                            <h2 className={cn("text-5xl font-black", pricingResults.profit >= 0 ? "text-success" : "text-destructive")}>
                                                {formatCurrency(pricingResults.profit)}
                                            </h2>
                                            <div className="mt-4 flex items-center gap-2">
                                                <Badge className={cn("border-none", pricingResults.profit >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>
                                                    Margem: {pricingResults.marginPercent.toFixed(2)}%
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-none shadow-lg">
                                        <CardContent className="p-8 space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Custo Produto:</span>
                                                <span className="font-bold">{formatCurrency(pCost)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Taxas Plataforma:</span>
                                                <span className="font-bold text-red-500">- {formatCurrency(pricingResults.platformCost)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-sm pt-2">
                                                <span className="font-bold">Custo Total:</span>
                                                <span className="font-black text-lg">{formatCurrency(pricingResults.unitCost)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="border-none shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-base">Sugestão Estratégica</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-6 bg-muted/50 rounded-2xl border border-dashed flex items-start gap-4">
                                            <div className="p-3 bg-background rounded-xl border shadow-sm">
                                                <Target className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1">Onde Melhorar?</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {pricingResults.marginPercent < 15 
                                                        ? "Sua margem está baixa (abaixo de 15%). Tente negociar com o fornecedor ou aumentar o valor percebido do produto para elevar o preço de venda." 
                                                        : "Excelente! Sua margem de lucro está saudável. Você tem espaço para investir em promoções ou tráfego pago para acelerar o giro do estoque."}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default Simulations;
