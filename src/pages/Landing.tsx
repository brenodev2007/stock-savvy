import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BarChart3, 
  Box, 
  CheckCircle2, 
  LineChart, 
  Package, 
  ShieldCheck, 
  Zap 
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Box className="h-6 w-6" />
            <span>Estoka</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
               <Link to="/dashboard">
                <Button>Ir para Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button>Começar Grátis</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36">
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 animate-fade-in-up">
                Gestão de estoque <br className="hidden sm:block" />
                simples e inteligente
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:mt-6 animate-fade-in-up delay-100">
                O Estoka é a solução completa para controlar seus produtos, 
                movimentações e relatórios em um só lugar. Tenha visão total do seu negócio.
              </p>
              <div className="mt-10 flex justify-center gap-4 animate-fade-in-up delay-200">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="h-12 px-8 text-lg gap-2">
                    {user ? "Acessar Dashboard" : "Começar Agora"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/auth">
                    <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                      Ver Demonstração
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10" />
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Tudo o que você precisa
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Funcionalidades poderosas para otimizar a gestão do seu inventário e fazer seu negócio crescer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Package className="h-10 w-10 text-primary" />}
                title="Controle Total"
                description="Cadastre produtos, categorias e armazéns. Mantenha seu inventário organizado e atualizado em tempo real."
              />
              <FeatureCard 
                icon={<BarChart3 className="h-10 w-10 text-primary" />}
                title="Relatórios Detalhados"
                description="Visualize movimentações, curvas de valor e saldo. Exporte dados para PDF e Excel com um clique."
              />
              <FeatureCard 
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Movimentação Ágil"
                description="Registre entradas, saídas e transferências rapidamente. Interface intuitiva pensada na produtividade."
              />
              <FeatureCard 
                icon={<ShieldCheck className="h-10 w-10 text-primary" />}
                title="Segurança e Controle"
                description="Histórico completo de todas as operações. Saiba quem movimentou o que e quando."
              />
              <FeatureCard 
                icon={<LineChart className="h-10 w-10 text-primary" />}
                title="Dashboard Inteligente"
                description="Cards com métricas essenciais e gráficos de desempenho logo na tela inicial."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
                title="Fácil de Usar"
                description="Não precisa de treinamento. O Estoka foi desenhado para ser intuitivo desde o primeiro acesso."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-3xl p-8 sm:p-16 text-center text-primary-foreground relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Pronto para organizar seu estoque?
                </h2>
                <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-10">
                  Junte-se a centenas de empresas que já transformaram sua gestão com o Estoka.
                </p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" variant="secondary" className="h-12 px-8 text-lg font-semibold">
                    {user ? "Voltar ao Dashboard" : "Criar Conta Grátis"}
                  </Button>
                </Link>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4 font-semibold text-primary">
            <Box className="h-5 w-5" />
            <span>Estoka</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Estoka. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card border border-border/50 p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="mb-4 bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
