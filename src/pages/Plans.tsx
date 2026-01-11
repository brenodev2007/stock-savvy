import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Zap, Crown, Building2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para pequenos negócios começando a organizar o estoque',
    price: 'Grátis',
    priceDetail: 'para sempre',
    icon: Zap,
    popular: false,
    features: [
      { name: 'Até 100 produtos', included: true },
      { name: '1 armazém', included: true },
      { name: 'Controle básico de estoque', included: true },
      { name: 'Relatórios simples', included: true },
      { name: 'Suporte por e-mail', included: true },
      { name: 'Integração Shopee', included: false },
      { name: 'Multi-usuários', included: false },
      { name: 'Lotes e validade', included: false },
      { name: 'API de integração', included: false },
      { name: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para empresas em crescimento que precisam de mais controle',
    price: 'R$ 97',
    priceDetail: '/mês',
    icon: Crown,
    popular: true,
    features: [
      { name: 'Até 1.000 produtos', included: true },
      { name: 'Até 3 armazéns', included: true },
      { name: 'Controle avançado de estoque', included: true },
      { name: 'Relatórios completos', included: true },
      { name: 'Suporte por e-mail', included: true },
      { name: 'Integração Shopee', included: true },
      { name: 'Até 5 usuários', included: true },
      { name: 'Lotes e validade', included: true },
      { name: 'API de integração', included: false },
      { name: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Solução completa para operações de grande escala',
    price: 'R$ 297',
    priceDetail: '/mês',
    icon: Building2,
    popular: false,
    features: [
      { name: 'Produtos ilimitados', included: true },
      { name: 'Armazéns ilimitados', included: true },
      { name: 'Controle avançado de estoque', included: true },
      { name: 'Relatórios personalizados', included: true },
      { name: 'Suporte prioritário 24/7', included: true },
      { name: 'Integração Shopee', included: true },
      { name: 'Usuários ilimitados', included: true },
      { name: 'Lotes e validade', included: true },
      { name: 'API de integração', included: true },
      { name: 'Gerente de conta dedicado', included: true },
    ],
  },
];

export default function Plans() {
  const { profile } = useAuth();
  const currentPlan = profile?.plan || 'starter';

  const handleUpgrade = (planId: string) => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em fazer upgrade para o plano ${planId.toUpperCase()}. Meu e-mail cadastrado é: ${profile?.email || 'não informado'}`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const getPlanIndex = (planId: string) => {
    return plans.findIndex(p => p.id === planId);
  };

  return (
    <AppLayout title="Planos" subtitle="Escolha o melhor plano para o seu negócio">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Potencialize seu negócio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades. Todos os planos incluem acesso 
            completo às funcionalidades básicas do sistema.
          </p>
        </div>

        {/* Current Plan Badge */}
        <div className="flex justify-center mb-8">
          <Badge variant="outline" className="px-4 py-2 text-sm bg-primary/5 border-primary/20">
            <Zap className="h-4 w-4 mr-2 text-primary" />
            Seu plano atual: <span className="font-bold ml-1 uppercase">{currentPlan}</span>
          </Badge>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id;
            const canUpgrade = getPlanIndex(plan.id) > getPlanIndex(currentPlan);
            const canDowngrade = getPlanIndex(plan.id) < getPlanIndex(currentPlan);

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative flex flex-col transition-all duration-300',
                  plan.popular && 'border-primary shadow-lg shadow-primary/10 scale-[1.02]',
                  isCurrentPlan && 'ring-2 ring-primary/50'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-sm">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={cn(
                    'mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl',
                    plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.priceDetail}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        {feature.included ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                            <X className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                        <span className={cn(
                          'text-sm',
                          feature.included ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : canUpgrade ? (
                    <Button 
                      className="w-full gap-2" 
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Fazer Upgrade
                    </Button>
                  ) : canDowngrade ? (
                    <Button variant="ghost" className="w-full text-muted-foreground" disabled>
                      Downgrade não disponível
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">Dúvidas frequentes</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Posso mudar de plano a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade a qualquer momento. O valor será calculado 
                proporcionalmente ao período restante.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Existe período de fidelidade?</h4>
              <p className="text-sm text-muted-foreground">
                Não! Todos os planos são mensais e você pode cancelar quando quiser, 
                sem multas ou taxas adicionais.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Como funciona o pagamento?</h4>
              <p className="text-sm text-muted-foreground">
                Aceitamos cartão de crédito, PIX e boleto bancário. O pagamento é 
                processado de forma segura.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Meus dados são mantidos ao mudar de plano?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Todos os seus dados são preservados ao fazer upgrade ou downgrade 
                entre os planos.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
          <h3 className="text-xl font-semibold mb-2">Precisa de ajuda para escolher?</h3>
          <p className="text-muted-foreground mb-4">
            Nossa equipe está pronta para ajudar você a encontrar o plano ideal.
          </p>
          <Button 
            size="lg" 
            className="gap-2"
            onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
          >
            <MessageCircle className="h-5 w-5" />
            Falar com um Consultor
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
