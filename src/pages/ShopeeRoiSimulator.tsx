import { useState, useMemo } from "react";
import { 
  Calculator, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Info, 
  Users, 
  Megaphone,
  Target,
  BarChart3,
  MousePointer2,
  ShoppingCart,
  Percent,
  RefreshCcw,
  Zap
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ShopeeAdsIntelligence = () => {
    // State for inputs
    const [budget, setBudget] = useState<number>(100);
    const [cpc, setCpc] = useState<number>(0.35);
    const [conversionRate, setConversionRate] = useState<number>(2.5);
    const [productPrice, setProductPrice] = useState<number>(99.90);
    const [productCost, setProductCost] = useState<number>(40.00);
    const [hasFreeShipping, setHasFreeShipping] = useState<boolean>(true);

    // Calculations
    const results = useMemo(() => {
        const clicks = Math.floor(budget / (cpc || 0.01));
        const sales = Math.floor(clicks * (conversionRate / 100));
        const revenue = sales * productPrice;

        const commissionRate = hasFreeShipping ? 0.20 : 0.14;
        const fixedFeePerSale = 3.00;
        
        const variableFeeCost = revenue * commissionRate;
        const fixedFeeCost = sales * fixedFeePerSale;
        const totalShopeeFees = variableFeeCost + fixedFeeCost;

        const totalProductCost = sales * productCost;
        const totalCost = totalShopeeFees + totalProductCost + budget;
        
        const profit = revenue - totalCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        const roas = budget > 0 ? revenue / budget : 0;
        const acos = revenue > 0 ? (budget / revenue) * 100 : 0;
        const cpa = sales > 0 ? budget / sales : 0;

        return {
            clicks,
            sales,
            revenue,
            totalShopeeFees,
            totalProductCost,
            totalCost,
            profit,
            margin,
            roas,
            acos,
            cpa,
            commissionRate
        };
    }, [budget, cpc, conversionRate, productPrice, productCost, hasFreeShipping]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <AppLayout title="Inteligência de Tráfego" subtitle="Gestão estratégica de anúncios e análise de performance (Shopee Ads)">
            <div className="space-y-6">
                
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-orange-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Target className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Ads Intelligence</h2>
                            <p className="text-orange-100 text-sm">Otimize seu investimento e escale suas vendas na Shopee</p>
                        </div>
                    </div>
                    <Button variant="secondary" className="gap-2 font-bold">
                        <RefreshCcw className="h-4 w-4" /> Simular Escala
                    </Button>
                </div>

                <Tabs defaultValue="simulator" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="simulator" className="gap-2">
                            <Calculator className="h-4 w-4" /> Simulador ROI
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="gap-2">
                            <TrendingUp className="h-4 w-4" /> Performance Real
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="simulator" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Inputs Panel */}
                            <div className="lg:col-span-4 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Configuração da Campanha</CardTitle>
                                        <CardDescription>Ajuste os parâmetros para simular o resultado</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="flex justify-between">
                                                Orçamento Diário
                                                <span className="text-primary font-bold">{formatCurrency(budget)}</span>
                                            </Label>
                                            <Slider 
                                                value={[budget]} 
                                                min={10} max={1000} step={10} 
                                                onValueChange={(val) => setBudget(val[0])}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex justify-between">
                                                CPC (Custo por Clique)
                                                <span className="text-primary font-bold">{formatCurrency(cpc)}</span>
                                            </Label>
                                            <Slider 
                                                value={[cpc]} 
                                                min={0.1} max={3.0} step={0.05} 
                                                onValueChange={(val) => setCpc(val[0])}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="flex justify-between">
                                                Taxa de Conversão
                                                <span className="text-primary font-bold">{conversionRate.toFixed(1)}%</span>
                                            </Label>
                                            <Slider 
                                                value={[conversionRate]} 
                                                min={0.5} max={15} step={0.5} 
                                                onValueChange={(val) => setConversionRate(val[0])}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="space-y-4 pt-2">
                                            <div className="space-y-2">
                                                <Label>Preço de Venda do Produto</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                                                    <Input type="number" className="pl-9" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Custo da Mercadoria (CMV)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                                                    <Input type="number" className="pl-9" value={productCost} onChange={e => setProductCost(Number(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Results Dashboard */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Metric Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Cliques', value: results.clicks, icon: MousePointer2, color: 'text-blue-600' },
                                        { label: 'Vendas', value: results.sales, icon: ShoppingCart, color: 'text-purple-600' },
                                        { label: 'ROAS', value: `${results.roas.toFixed(2)}x`, icon: Zap, color: 'text-orange-600' },
                                        { label: 'ACOS', value: `${results.acos.toFixed(1)}%`, icon: Percent, color: 'text-emerald-600' }
                                    ].map((m, i) => (
                                        <Card key={i} className="border-none shadow-md">
                                            <CardContent className="p-4 pt-6 text-center">
                                                <m.icon className={cn("h-6 w-6 mx-auto mb-2", m.color)} />
                                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                                                <h4 className="text-xl font-bold mt-1">{m.value}</h4>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Financial Summary */}
                                <Card className="border-l-4 border-l-orange-500">
                                    <CardHeader>
                                        <CardTitle>Resultado Estimado</CardTitle>
                                        <CardDescription>Projeção baseada nos parâmetros de tráfego</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Faturamento Estimado</span>
                                            <span className="font-bold text-lg">{formatCurrency(results.revenue)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-red-500">
                                            <span>Custos (Ads + Taxas + Produto)</span>
                                            <span className="font-medium">- {formatCurrency(results.totalCost)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg">Lucro Líquido Final</span>
                                            <span className={cn("text-2xl font-black", results.profit > 0 ? "text-emerald-600" : "text-red-600")}>
                                                {formatCurrency(results.profit)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground italic">
                                            <span>Margem de Lucro:</span>
                                            <span>{results.margin.toFixed(1)}%</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Market Insights */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/20">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertTitle className="text-blue-800 dark:text-blue-300">Dica de Escala</AlertTitle>
                                        <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs">
                                            Para um ACOS de {results.acos.toFixed(1)}%, seu CPA médio está em {formatCurrency(results.cpa)}. Tente baixar o CPC para {formatCurrency(cpc * 0.8)} para ganhar margem.
                                        </AlertDescription>
                                    </Alert>
                                    <Alert className={cn(results.roas > 2.5 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
                                        <Zap className={cn("h-4 w-4", results.roas > 2.5 ? "text-emerald-600" : "text-amber-600")} />
                                        <AlertTitle className={cn(results.roas > 2.5 ? "text-emerald-800" : "text-amber-800")}>Saúde da Campanha</AlertTitle>
                                        <AlertDescription className={cn(results.roas > 2.5 ? "text-emerald-700" : "text-amber-700", "text-xs")}>
                                            {results.roas > 2.5 
                                                ? "Excelente! Seu ROAS está saudável. Você pode aumentar o orçamento em 20% para escalar." 
                                                : "Atenção: Seu ROAS está baixo. Melhore as fotos do anúncio para aumentar a conversão."}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-xl border-2 border-dashed">
                        <BarChart3 className="h-16 w-16 text-muted-foreground opacity-20" />
                        <div>
                            <h3 className="text-lg font-bold">Conecte sua conta Shopee Ads</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                Para visualizar métricas reais, integre sua conta da Shopee no menu de configurações.
                            </p>
                        </div>
                        <Button className="bg-orange-600">Integrar Agora</Button>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default ShopeeAdsIntelligence;
