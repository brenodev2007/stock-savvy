import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, ArrowRight, Loader2, Lock, CreditCard, Sparkles, Package, TrendingUp, BarChart3, UserCheck } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { EnvironmentBadge } from '@/components/ui/environment-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [environment, setEnvironment] = useState<'development' | 'production' | null>(null);

  useEffect(() => {
    // Busca informações do usuário e detecta o ambiente
    const fetchInitialData = async () => {
      try {
        // Tenta obter do localStorage primeiro (cache rápido)
        const stored = localStorage.getItem('mp_environment');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.environment) {
            setEnvironment(parsed.environment);
          }
        }

     
        const response = await api.get('/auth/me');
        setUserInfo(response.data);
        
     
        if (response.data.mp_config) {
          const backendEnv = response.data.mp_config.environment;
          setEnvironment(backendEnv);
          
         
          localStorage.setItem('mp_environment', JSON.stringify({
            environment: backendEnv,
            isSandbox: response.data.mp_config.sandbox
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar informações iniciais:', error);
      }
    };

    fetchInitialData();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments/create', {
        plan: 'pro',
        amount: 0.01
      });

      if (response.data.success && response.data.checkout_url) {
   
        if (response.data.environment) {
          setEnvironment(response.data.environment);
          localStorage.setItem('mp_environment', JSON.stringify({
            environment: response.data.environment,
            isSandbox: response.data.sandbox
          }));
        }
        
        // Redireciona para o checkout do Mercado Pago
        window.location.href = response.data.checkout_url;
      } else {
        toast.error('Erro ao criar pagamento');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      toast.error(error.response?.data?.error || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  const features = [
    { icon: Package, label: 'Produtos ilimitados', description: 'Cadastre quantos produtos precisar' },
    { icon: TrendingUp, label: 'Múltiplos armazéns', description: 'Gerencie vários locais' },
    { icon: BarChart3, label: 'Integração Shopee', description: 'Sincronize seus pedidos automaticamente' },
    { icon: CreditCard, label: 'Relatórios financeiros', description: 'Análises completas do seu negócio' },
    { icon: CheckCircle2, label: 'Controle em tempo real', description: 'Atualizações instantâneas de estoque' },
    { icon: UserCheck, label: 'Suporte prioritário', description: 'Atendimento rápido e dedicado' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl ring-2 ring-primary/20">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Estoka</h1>
          </div>
          <p className="text-lg text-muted-foreground">Gestão profissional de estoque e vendas</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Informações do Plano */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Principal do Plano */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg animate-scale-in">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl flex items-center gap-2">
                      Plano Pro
                      <Badge className="bg-accent text-accent-foreground">Popular</Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Todas as funcionalidades para seu negócio crescer
                    </CardDescription>
                  </div>
                  {environment === 'development' && (
                    <EnvironmentBadge environment={environment} />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Preço */}
                <div className="bg-background/60 rounded-xl p-6 border border-border/50">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl sm:text-6xl font-bold text-foreground">R$ 0,01</span>
                    <span className="text-xl text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Cobrança mensal recorrente
                  </p>
                </div>

                <Separator />

                {/* Funcionalidades em Grid */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    O que está incluído
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 rounded-lg bg-background/60 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                      >
                        <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <feature.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground">{feature.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantias */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-success/20 bg-success/5">
                <CardContent className="pt-6 flex items-start gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Lock className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pagamento Seguro</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processado via Mercado Pago com criptografia
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="pt-6 flex items-start gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sem Compromisso</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cancele quando quiser, sem taxas adicionais
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Coluna Direita - Checkout */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Informações do Usuário */}
              {userInfo && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Sua Conta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {userInfo.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{userInfo.name || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botão de Checkout */}
              <Card className="border-primary/30 shadow-lg">
                <CardContent className="pt-6 space-y-4">
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Assinar Agora
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3" />
                      Pagamento seguro com Mercado Pago
                    </p>
                  </div>

                  <Separator />

                  <Button
                    onClick={() => navigate('/settings')}
                    variant="ghost"
                    className="w-full"
                  >
                    Voltar para configurações
                  </Button>
                </CardContent>
              </Card>

              {/* Nota de Teste */}
              <Card className="border-warning/20 bg-warning/5">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-center text-muted-foreground">
                    💳 Ambiente de testes<br />Use cartões de teste do Mercado Pago
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
