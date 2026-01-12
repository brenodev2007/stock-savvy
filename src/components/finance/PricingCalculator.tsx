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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Lucro (Simulador Shopee)
          </CardTitle>
          <CardDescription>
            Simule o lucro líquido baseado nos custos e preço de venda, conforme sua tabela.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Custo Produto</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                <Input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-9 w-full"
                  value={cost || ""}
                  onChange={(e) => setCost(Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Preço de Venda</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-9 w-full"
                  value={sellingPrice || ""}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variable">Comissão (%)</Label>
              <div className="relative">
                <Input
                  id="variable"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="pr-8 w-full"
                  value={variableRate}
                  onChange={(e) => setVariableRate(Number(e.target.value))}
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformFixed">Taxa Fixa (Shopee)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                <Input
                  id="platformFixed"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-9 w-full"
                  value={platformFixedFee || ""}
                  onChange={(e) => setPlatformFixedFee(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 mt-6">
            <h3 className="font-semibold mb-2">Resumo dos Custos</h3>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Custo Shopee (Comissão + Taxa):</span>
                    <span className="font-medium text-destructive">{formatCurrency(shopeeCost)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Custo Unitário Total:</span>
                    <span className="font-bold">{formatCurrency(unitCost)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                    Fórmula: Lucro = Venda - (Custo Produto + Custo Shopee)
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 md:col-span-1 border-primary/20">
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>Análise final</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Lucro Líquido</p>
            <div className={cn(
              "text-4xl font-bold",
              profit >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(profit)}
            </div>
          </div>
          
          <Separator className="bg-primary/20" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Venda:</span>
                <span>{formatCurrency(sellingPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
                <span>- Custo Produto:</span>
                <span>{formatCurrency(cost)}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
                <span>- Custo Shopee:</span>
                <span>{formatCurrency(shopeeCost)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-sm font-semibold">
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
