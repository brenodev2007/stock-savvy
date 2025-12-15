import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BarChart3, 
  Box, 
  Check, 
  CheckCircle2, 
  LineChart, 
  Package, 
  ShieldCheck, 
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary transition-transform hover:scale-105">
            <Box className="h-6 w-6" />
            <span>Estoka</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
               <Link to="/dashboard">
                <Button className="shadow-lg shadow-primary/20">Ir para Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-foreground/80 hover:text-foreground hidden sm:inline-flex">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    Começar Grátis
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-muted/50 backdrop-blur-sm mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                A plataforma #1 para gestão inteligente
              </div>
              <h1 className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in-up leading-tight">
                Controle seu estoque com <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">precisão absoluta</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground animate-fade-in-up delay-100">
                Elimine planilhas complexas. O Estoka unifica inventário, vendas e relatórios em uma interface moderna que sua equipe vai amar usar.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-200">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="h-14 px-8 text-lg gap-2 w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                    {user ? "Acessar Dashboard" : "Começar Agora Gratuitamente"} <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto backdrop-blur-sm hover:bg-muted/50 transition-all hover:-translate-y-1">
                      Ver Demonstração
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in-up delay-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Cancelamento grátis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Suporte 24/7
                </div>
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse-slow" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -z-10" />
        </section>



        {/* Features Grid */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                Tudo o que você precisa para escalar
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas desenhadas para aumentar sua eficiência operacional desde o primeiro dia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Package className="h-10 w-10 text-primary" />}
                title="Controle Total"
                description="Cadastre produtos, categorias e armazéns ilimitados. Mantenha seu inventário organizado e atualizado em tempo real."
              />
              <FeatureCard 
                icon={<BarChart3 className="h-10 w-10 text-primary" />}
                title="Analytics Avançado"
                description="Visualize movimentações, curvas de valor e saldo. Exporte dados para PDF e Excel para apresentações gerenciais."
              />
              <FeatureCard 
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Movimentação Ágil"
                description="Registre entradas, saídas e transferências em segundos. Interface otimizada para alta produtividade."
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="Segurança Militar"
                description="Histórico auditável de todas as operações. Controle granular de permissões por usuário."
              />
              <FeatureCard 
                icon={<LineChart className="h-10 w-10 text-primary" />}
                title="Previsibilidade"
                description="Alertas inteligentes de estoque baixo e vencimento de produtos. Nunca mais perca uma venda."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
                title="Onboarding Zero"
                description="Tão intuitivo que não requer treinamento. Sua equipe estará operando com eficiência máxima em minutos."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 sm:py-32 bg-muted/30 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                Planos para cada estágio
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comece grátis e escale conforme seu negócio cresce. Sem contratos ocultos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <PricingCard 
                title="Starter" 
                price="R$ 0" 
                period="/mês"
                description="Perfeito para pequenos negócios e testes."
                features={["Até 50 produtos", "1 Usuário", "Suporte básico", "Relatórios simples"]}
                buttonText="Começar Grátis"
                variant="outline"
              />
              <PricingCard 
                title="Pro" 
                price="R$ 97" 
                period="/mês"
                description="Para empresas em crescimento acelerado."
                features={["Produtos ilimitados", "Até 5 Usuários", "Suporte prioritário", "Analytics avançado", "Múltiplos armazéns"]}
                buttonText="Assinar Pro"
                variant="primary"
                popular
              />
              <PricingCard 
                title="Business" 
                price="R$ 297" 
                period="/mês"
                description="Controle total para grandes operações."
                features={["Tudo do Pro", "Usuários ilimitados", "API de integração", "Gerente de conta", "SLA 99.9%"]}
                buttonText="Falar com Vendas"
                variant="outline"
              />
            </div>
          </div>
          
          {/* Decorative gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 sm:p-20 text-center text-primary-foreground relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-8">
                  Pronto para profissionalizar sua gestão?
                </h2>
                <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Junte-se a mais de 10.000 empresas que transformaram sua operação logística com o Estoka.
                </p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                    {user ? "Voltar ao Dashboard" : "Criar Conta Grátis"}
                  </Button>
                </Link>
                <p className="mt-6 text-primary-foreground/70 text-sm">
                  Teste grátis de 14 dias no plano Pro. Não requer cartão.
                </p>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-6 font-bold text-2xl text-primary">
            <Box className="h-8 w-8" />
            <span>Estoka</span>
          </div>
          <div className="flex justify-center gap-8 mb-8 text-sm font-medium">
            <Link to="#" className="hover:text-foreground transition-colors">Sobre</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Preços</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Contato</Link>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Estoka Tecnologia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group bg-card border border-border/50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/20">
      <div className="mb-6 bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  variant?: "primary" | "outline";
  popular?: boolean;
}

function PricingCard({ title, price, period, description, features, buttonText, variant = "outline", popular }: PricingCardProps) {
  return (
    <div className={`relative flex flex-col p-8 bg-card rounded-2xl border ${popular ? 'border-primary shadow-2xl scale-105 z-10' : 'border-border shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-md">
          Mais Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold">{price}</span>
          <span className="text-muted-foreground ml-2">{period}</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-sm">
            <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to="/auth" className="mt-auto">
        <Button 
          className="w-full h-12 text-lg font-semibold" 
          variant={variant === "primary" ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
