import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";

export function PricingCalculator() {
  const [cost, setCost] = useState<number>(0);
  const [fixedCost, setFixedCost] = useState<number>(0);
  const [platformFixedFee, setPlatformFixedFee] = useState<number>(4); // Taxa fixa da plataforma (ex: Shopee R$ 3/4)
  const [variableRate, setVariableRate] = useState<number>(20); // %
  const [marginMultiplier, setMarginMultiplier] = useState<number>(1.15); // Multiplier
  const [sellingPrice, setSellingPrice] = useState<number>(0);

  const calculatePrice = () => {
    // Formula: x = M * (C + F + PlatformFixed + (V% * x))
    // x = M(C + F + Pf) + M * V% * x
    // x - M * V% * x = M(C + F + Pf)
    // x (1 - M * V%) = M(C + F + Pf)
    // x = (M * (C + F + Pf)) / (1 - M * V%)
    
    const vDecimal = variableRate / 100;
    const numerator = marginMultiplier * (cost + fixedCost + platformFixedFee);
    const denominator = 1 - (marginMultiplier * vDecimal);

    if (denominator <= 0) {
      // Avoid division by zero or negative results if margin/variable rate is too high
      setSellingPrice(0); 
      return;
    }

    const price = numerator / denominator;
    setSellingPrice(price);
  };

  useEffect(() => {
    calculatePrice();
  }, [cost, fixedCost, platformFixedFee, variableRate, marginMultiplier]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const profit = sellingPrice - (cost + fixedCost + platformFixedFee + (sellingPrice * (variableRate / 100)));
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="md:col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Preço (Markup Reverso)
          </CardTitle>
          <CardDescription>
            Defina os custos e a margem para encontrar o preço de venda ideal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Preço de Custo (Produto)</Label>
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
              <Label htmlFor="fixed">Custos Fixos (Frete/Embalagem)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                <Input
                  id="fixed"
                  type="number"
                  min="0"
                  step="0.01"
                  className="pl-9 w-full"
                  value={fixedCost || ""}
                  onChange={(e) => setFixedCost(Number(e.target.value))}
                />
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
            <div className="space-y-2">
              <Label htmlFor="variable">Taxa Variável (Comissão + Imposto)</Label>
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
              <Label htmlFor="margin">Multiplicador de Margem</Label>
              <Input
                id="margin"
                type="number"
                min="1"
                step="0.01"
                value={marginMultiplier}
                onChange={(e) => setMarginMultiplier(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Ex: 1.15 para 15%</p>
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 mt-6">
            <h3 className="font-semibold mb-2">Entenda o Cálculo</h3>
            <p className="text-sm font-mono break-all text-muted-foreground">
              {`x = ${marginMultiplier} × (${cost} + ${fixedCost} + ${platformFixedFee} + (${variableRate}% × x))`}
            </p>
            {sellingPrice > 0 && (
                 <p className="text-sm font-mono mt-2 text-primary">
                    {`x = ${sellingPrice.toFixed(2)}`}
                 </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 md:col-span-1 border-primary/20">
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>Preço sugerido e análise de lucro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Preço de Venda Sugerido</p>
            <div className="text-4xl font-bold text-primary">
              {formatCurrency(sellingPrice)}
            </div>
          </div>
          
          <Separator className="bg-primary/20" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>Custo Total do Produto:</span>
                <span>{formatCurrency(cost + fixedCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Taxa Fixa da Plataforma:</span>
                <span className="text-orange-600">- {formatCurrency(platformFixedFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Taxas Variáveis ({variableRate}%):</span>
                <span>{formatCurrency(sellingPrice * (variableRate / 100))}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-primary/20">
                <span>Lucro Líquido Estimado:</span>
                <span className="text-green-600">{formatCurrency(profit)}</span>
            </div>
            <div className="flex justify-between text-sm pt-1">
                <span>Margem Real:</span>
                <span>{marginPercent.toFixed(2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
