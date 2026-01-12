import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

export function PricingCalculator() {
  const [cost, setCost] = useState<number>(0); // Custo produto
  const [platformFixedFee, setPlatformFixedFee] = useState<number>(4); // Taxa
  const [variableRate, setVariableRate] = useState<number>(20); // Comissão (%)
  const [sellingPrice, setSellingPrice] = useState<number>(0); // Venda

  // Calculations based on the spreadsheet
  // Custo shopee = Venda * (Comissão/100) + Taxa
  const commissionValue = sellingPrice * (variableRate / 100);
  const shopeeCost = commissionValue + platformFixedFee;
  
  // Custo Unitario = Custo produto + Custo shopee
  const unitCost = cost + shopeeCost;
  
  // Lucrar = Venda - Custo Unitario
  const profit = sellingPrice - unitCost;
  
  // Margin % calculation for reference
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Calculadora de Lucro (Simulador Shopee)</span>
            <span className="sm:hidden">Simulador de Lucro</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Simule o lucro líquido baseado nos custos e preço de venda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="grid gap-3 sm:gap-4 grid-cols-2">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="cost" className="text-xs sm:text-sm">Custo Produto</Label>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-muted-foreground text-xs sm:text-sm">R$</span>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7 sm:pl-9 w-full text-sm"
                  value={cost || ""}
                  onChange={(e) => setCost(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="sellingPrice" className="text-xs sm:text-sm">Preço de Venda</Label>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-muted-foreground text-xs sm:text-sm">R$</span>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7 sm:pl-9 w-full text-sm"
                  value={sellingPrice || ""}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="variable" className="text-xs sm:text-sm">Comissão (%)</Label>
              <div className="relative">
                <Input
                  id="variable"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="pr-6 sm:pr-8 w-full text-sm"
                  value={variableRate}
                  onChange={(e) => setVariableRate(Number(e.target.value))}
                />
                <span className="absolute right-2 sm:right-3 top-2 sm:top-2.5 text-muted-foreground text-xs sm:text-sm">%</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="platformFixed" className="text-xs sm:text-sm">Taxa Fixa</Label>
              <div className="relative">
                <span className="absolute left-2 sm:left-3 top-2 sm:top-2.5 text-muted-foreground text-xs sm:text-sm">R$</span>
                <Input
                  id="platformFixed"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-7 sm:pl-9 w-full text-sm"
                  value={platformFixedFee || ""}
                  onChange={(e) => setPlatformFixedFee(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-3 sm:p-4 mt-4 sm:mt-6">
            <h3 className="font-semibold mb-2 text-xs sm:text-sm">Resumo dos Custos</h3>
            <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between">
                    <span className="hidden sm:inline">Custo Shopee (Comissão + Taxa):</span>
                    <span className="sm:hidden">Custo Shopee:</span>
                    <span className="font-medium text-destructive">{formatCurrency(shopeeCost)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="hidden sm:inline">Custo Unitário Total:</span>
                    <span className="sm:hidden">Custo Total:</span>
                    <span className="font-bold">{formatCurrency(unitCost)}</span>
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                    Lucro = Venda - (Custo + Shopee)
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Resultado</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Análise final</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-3 pt-0 sm:p-6 sm:pt-0">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Lucro Líquido</p>
            <div className={cn(
              "text-2xl sm:text-4xl font-bold",
              profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(profit)}
            </div>
          </div>
          
          <Separator className="bg-primary/20" />
          
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
                <span>Venda:</span>
                <span>{formatCurrency(sellingPrice)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-destructive">
                <span>- Custo Produto:</span>
                <span>{formatCurrency(cost)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-destructive">
                <span>- Custo Shopee:</span>
                <span>{formatCurrency(shopeeCost)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-xs sm:text-sm font-semibold">
                <span>Margem de Lucro:</span>
                <span className={profit >= 0 ? "text-green-600" : "text-red-600"}>
                    {marginPercent.toFixed(2)}%
                </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
