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
          <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
              <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
              <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Calculadora</span>
              <span className="xs:hidden">Calc</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Importação</span>
              <span className="sm:hidden">Import</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-1.5 text-xs sm:text-sm px-2 sm:px-3">
              <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Equipe</span>
              <span className="sm:hidden">Team</span>
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
