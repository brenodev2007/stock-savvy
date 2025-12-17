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
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-foreground transition-transform hover:scale-105">
            <Box className="h-6 w-6 text-primary" />
            <span className="tracking-tight">Estoka</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
               <Link to="/dashboard">
                <Button className="shadow-[0_0_20px_rgba(37,99,235,0.3)] bg-primary hover:bg-primary/90 text-white border border-primary/20">Ir para Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted hidden sm:inline-flex">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="font-semibold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/10 transition-all hover:scale-105 active:scale-95">
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
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-muted/50 to-background">
          {/* Animated Matrix/Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          
          {/* Glowing Orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px] animate-float pointer-events-none" />

          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <div className="inline-flex items-center rounded-full border border-primary/30 px-4 py-1.5 text-sm font-medium bg-primary/10 backdrop-blur-md mb-8 animate-fade-in-up shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
                <span className="bg-gradient-to-r from-primary/60 to-primary/40 bg-clip-text text-transparent font-semibold">Tecnologia de Ponta para Gestão</span>
              </div>
              
              <h1 className="bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in-up leading-tight drop-shadow-sm">
                O Futuro do seu <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent filter drop-shadow-sm">Estoque Inteligente</span>
              </h1>
              
              <p className="mx-auto mt-6 max-w-2xl text-xl text-muted-foreground animate-fade-in-up delay-100 font-light tracking-wide">
                Algoritmos avançados e interface futurista para eliminar ineficiências. <span className="text-foreground font-medium">O Estoka é a evolução.</span>
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up delay-200">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="h-14 px-8 text-lg gap-2 w-full sm:w-auto shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] transition-all hover:scale-105 bg-gradient-to-r from-primary to-blue-600 border border-primary/50 text-white font-bold tracking-wide">
                    {user ? "Acessar Sistema" : "Iniciar Gratuitamente"} <Zap className="h-5 w-5 fill-current" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto backdrop-blur-md bg-white/50 border-input hover:bg-muted hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all hover:scale-105 shadow-sm">
                      <span className="text-foreground">Live Demo</span>
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8 border-t border-border/40 pt-8 animate-fade-in-up delay-300">
                 {/* Tech stats or trust indicators */}
                 {[
                   { label: "Uptime", value: "99.99%" },
                   { label: "Empresas", value: "10k+" },
                   { label: "Segurança", value: "E2E Encrypted" },
                   { label: "Suporte", value: "24/7 AI" }
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col items-center">
                     <span className="text-2xl font-bold text-primary tracking-tighter">{stat.value}</span>
                     <span className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 sm:py-32 bg-secondary/30 relative">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6 text-foreground drop-shadow-sm">
                Tudo o que você precisa para escalar
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ferramentas poderosas desenhadas para aumentar sua eficiência operacional desde o primeiro dia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Package className="h-10 w-10" />}
                title="Controle Total"
                description="Cadastre produtos, categorias e armazéns ilimitados. Mantenha seu inventário organizado e atualizado em tempo real."
              />
              <FeatureCard 
                icon={<BarChart3 className="h-10 w-10" />}
                title="Analytics Avançado"
                description="Visualize movimentações, curvas de valor e saldo. Exporte dados para PDF e Excel para apresentações gerenciais."
              />
              <FeatureCard 
                icon={<Zap className="h-10 w-10" />}
                title="Movimentação Ágil"
                description="Registre entradas, saídas e transferências em segundos. Interface otimizada para alta produtividade."
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-10 w-10" />}
                title="Segurança Militar"
                description="Histórico auditável de todas as operações. Controle granular de permissões por usuário."
              />
              <FeatureCard 
                icon={<LineChart className="h-10 w-10" />}
                title="Previsibilidade"
                description="Alertas inteligentes de estoque baixo e vencimento de produtos. Nunca mais perca uma venda."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="h-10 w-10" />}
                title="Onboarding Zero"
                description="Tão intuitivo que não requer treinamento. Sua equipe estará operando com eficiência máxima em minutos."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
           {/* Decorative gradients for pricing */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6 text-foreground">
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
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary via-primary to-primary/80 backdrop-blur-md border border-primary-foreground/10 rounded-3xl p-8 sm:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary/25 group">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-8 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all duration-500">
                  Pronto para profissionalizar sua gestão?
                </h2>
                <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                  Junte-se a mais de 10.000 empresas que transformaram sua operação logística com o Estoka.
                </p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-lg shadow-black/10 hover:shadow-xl bg-background text-primary hover:bg-secondary transition-all hover:scale-105 active:scale-95">
                    {user ? "Voltar ao Dashboard" : "Criar Conta Grátis"}
                  </Button>
                </Link>
                <p className="mt-6 text-primary-foreground/60 text-sm">
                  Teste grátis de 14 dias no plano Pro. Não requer cartão.
                </p>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow delay-700 pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-12 bg-muted/30 text-muted-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 font-bold text-2xl text-foreground">
            <Box className="h-8 w-8 text-primary" />
            <span>Estoka</span>
          </div>
          <div className="flex justify-center gap-8 mb-8 text-sm font-medium">
            <Link to="#" className="hover:text-foreground transition-colors duration-200">Sobre</Link>
            <Link to="#" className="hover:text-foreground transition-colors duration-200">Funcionalidades</Link>
            <Link to="#" className="hover:text-foreground transition-colors duration-200">Preços</Link>
            <Link to="#" className="hover:text-foreground transition-colors duration-200">Contato</Link>
          </div>
          <p className="text-sm font-light text-muted-foreground/80">
            &copy; {new Date().getFullYear()} Estoka Tecnologia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group bg-card border border-border/50 p-8 rounded-2xl hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="mb-6 bg-secondary w-16 h-16 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-border/50 relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors tracking-tight relative z-10">{title}</h3>
      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors relative z-10">
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
    <div className={`relative flex flex-col p-8 bg-card rounded-2xl border ${popular ? 'border-primary shadow-xl shadow-primary/10 scale-105 z-10' : 'border-border shadow-sm hover:border-primary/30'} transition-all duration-500 hover:shadow-md hover:-translate-y-1 group hover:bg-card/50`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg shadow-primary/20">
          Mais Popular
        </div>
      )}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex items-baseline">
          <span className="text-4xl font-extrabold text-foreground">{price}</span>
          <span className="text-muted-foreground ml-2">{period}</span>
        </div>
      </div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link to="/auth" className="mt-auto">
        <Button 
          className={`w-full h-12 text-lg font-semibold transition-all hover:scale-[1.02] ${variant === 'outline' ? 'bg-transparent border-input text-foreground hover:bg-secondary hover:text-foreground' : ''}`}
          variant={variant === "primary" ? "default" : "outline"}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
