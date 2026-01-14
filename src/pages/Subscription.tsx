import { useState } from "react";
import { Check, Loader2, ShieldCheck, Zap, BarChart3, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";

export default function Subscription() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { } // no back_url needed if we handle it in edge function or use default
      });

      if (error) throw error;

      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error("Não foi possível gerar o link de pagamento.");
      }
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast.error("Erro ao iniciar assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Assinatura" subtitle="Escolha o melhor plano para o seu negócio">
      <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Seja Pro</h2>
          <p className="text-muted-foreground">Desbloqueie todo o potencial do Stock Savvy.</p>
        </div>

        <Card className="w-full max-w-md border-primary/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
            RECOMENDADO
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>Para negócios em crescimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold">R$ 50,00</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            
            <div className="bg-primary/5 rounded-lg p-4 text-center mb-6">
              <p className="text-primary font-medium text-sm">
                Experimente 14 dias grátis
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cancele a qualquer momento durante o período de teste.
              </p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span>Gráficos e Relatórios Ilimitados</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <span>Sem anúncios</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Headphones className="h-4 w-4" />
                </div>
                <span>Suporte Prioritário</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>Backup Diário Automático</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all" 
              onClick={handleSubscribe} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                "Assinar Agora (Teste Grátis)"
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <p className="mt-8 text-center text-sm text-muted-foreground max-w-sm">
          Pagamento processado de forma segura pelo Mercado Pago.
        </p>
      </div>
    </AppLayout>
  );
}
