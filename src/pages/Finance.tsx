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
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="gap-2 px-4">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2 px-4">
              <Briefcase className="h-4 w-4" /> Equipe
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
             <FinancialDashboard />
          </TabsContent>

          <TabsContent value="employees" className="space-y-4">
            <EmployeeManager />
          </TabsContent>
        </Tabs>
      </AppLayout>
    </FinanceProvider>
  );
}
