import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calculator, LayoutDashboard, Upload, Briefcase } from "lucide-react";

import { PricingCalculator } from "@/components/finance/PricingCalculator";
import { ShopeeImport } from "../components/finance/ShopeeImport";
import { EmployeeManager } from "@/components/finance/EmployeeManager";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { FinancialDashboard } from "@/components/finance/FinancialDashboard";

export default function Finance() {
  return (
    <FinanceProvider>
      <AppLayout
        title="Gestão Financeira"
        subtitle="Controle financeiro, precificação e gestão de equipes"
      >
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculadora
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Importação
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
             <FinancialDashboard />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <PricingCalculator />
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <ShopeeImport />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeManager />
          </TabsContent>
        </Tabs>
      </AppLayout>
    </FinanceProvider>
  );
}
