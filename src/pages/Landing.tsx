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
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Star,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-muted/50 to-background">
          {/* Animated Matrix/Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          
          <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl text-center mb-16">
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
              </div>
            </div>

          
          </div>
        </section>

        {/* Target Audience / Ideal For */}
        <section className="py-20 bg-background border-y border-border/40">
           <div className="container mx-auto px-4">
             <div className="text-center mb-16">
               <h2 className="text-3xl font-bold tracking-tight mb-4">Feito para o seu negócio</h2>
               <p className="text-muted-foreground text-lg">O Estoka se adapta perfeitamente a diferentes modelos de operação.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                 <CardHeader>
                   <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                     <Box className="h-8 w-8" />
                   </div>
                   <CardTitle className="text-xl">Varejo e Lojas Físicas</CardTitle>
                   <CardDescription className="text-base mt-2">Evite rupturas na prateleira. Controle de frente de caixa e estoque em tempo real.</CardDescription>
                 </CardHeader>
               </Card>
               <Card className="bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                 <CardHeader>
                   <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                     <Package className="h-8 w-8" />
                   </div>
                   <CardTitle className="text-xl">E-commerce</CardTitle>
                   <CardDescription className="text-base mt-2">Sincronize sua logística. Organização perfeita para quem vende em múltiplos canais.</CardDescription>
                 </CardHeader>
               </Card>
               <Card className="bg-card border-border/50 hover:border-primary/50 transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                 <CardHeader>
                   <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-6">
                     <ShieldCheck className="h-8 w-8" />
                   </div>
                   <CardTitle className="text-xl">Pequenas Indústrias</CardTitle>
                   <CardDescription className="text-base mt-2">Rastreabilidade total. Gestão de matéria-prima e produtos acabados em um só lugar.</CardDescription>
                 </CardHeader>
               </Card>
             </div>
           </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 relative overflow-hidden bg-muted/30">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />
           <div className="container mx-auto px-4 relative z-10">
             <div className="text-center mb-16">
               <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Planos Transparentes</h2>
               <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                 Comece grátis e escale conforme sua necessidade. Sem surpresas.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Basic Plan */}
                <Card className="relative p-8 border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Basic</CardTitle>
                    <CardDescription>Para quem está começando</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">Grátis</span>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Até 10 Produtos</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Até 2 Armazéns</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Dashboard Básico</li>
                      <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4" /> Suporte Comunitário</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link to="/auth" className="w-full">
                      <Button variant="outline" className="w-full">Criar Conta Grátis</Button>
                    </Link>
                  </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className="relative p-8 border-primary shadow-2xl bg-background scale-105 border-2">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white px-4 py-1">Recomendado</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center justify-between">
                      Pro
                      <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    </CardTitle>
                    <CardDescription>Para operações em crescimento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">R$ 24,99</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Produtos Ilimitados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Armazéns Ilimitados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Relatórios Financeiros Avançados</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Suporte Prioritário</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /> Backups Diários</li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link to="/auth" className="w-full">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-lg h-12">Assinar Agora</Button>
                    </Link>
                  </CardFooter>
                </Card>
             </div>
           </div>
        </section>

        {/* Main Functionalities Showcase */}
        <section className="py-24 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6 text-foreground">
                Potência máxima para sua gestão
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore as ferramentas que colocam você no controle absoluto.
              </p>
            </div>

            <div className="space-y-24">
              {/* Feature 1: Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 space-y-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold">Dashboard em Tempo Real</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Tome decisões baseadas em dados, não em palpites. Acompanhe métricas vitais como valor total em estoque, produtos com baixo estoque e movimentações diárias em um painel unificado e elegante.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-green-500" /> Visão macro e micro da operação</li>
                    <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-green-500" /> Alertas automáticos de reposição</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 border border-primary/10 shadow-xl lg:-mr-12 hover:scale-[1.02] transition-transform duration-500">
                   {/* Abstract representation of chart */}
                   <div className="space-y-4">
                      <div className="flex gap-4 items-end h-40">
                        <div className="w-1/4 bg-primary/40 h-[60%] rounded-t-lg animate-pulse"></div>
                        <div className="w-1/4 bg-primary/60 h-[80%] rounded-t-lg animate-pulse delay-75"></div>
                        <div className="w-1/4 bg-primary/30 h-[40%] rounded-t-lg animate-pulse delay-150"></div>
                        <div className="w-1/4 bg-primary h-[90%] rounded-t-lg animate-pulse delay-300 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                      </div>
                      <div className="h-2 w-full bg-border rounded-full"></div>
                   </div>
                </div>
              </div>

              {/* Feature 2: Product Control */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-1 bg-gradient-to-br from-purple-500/5 to-purple-500/10 rounded-3xl p-8 border border-purple-500/10 shadow-xl lg:-ml-12 hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
                   <div className="grid grid-cols-2 gap-4 w-full max-w-sm opacity-80">
                      <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50"><Box className="h-8 w-8 text-purple-500 mb-2" /><div className="h-2 w-16 bg-muted rounded"></div></div>
                      <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50"><Package className="h-8 w-8 text-purple-500 mb-2" /><div className="h-2 w-16 bg-muted rounded"></div></div>
                      <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50"><Zap className="h-8 w-8 text-purple-500 mb-2" /><div className="h-2 w-16 bg-muted rounded"></div></div>
                      <div className="bg-background rounded-lg p-4 shadow-sm border border-border/50"><LineChart className="h-8 w-8 text-purple-500 mb-2" /><div className="h-2 w-16 bg-muted rounded"></div></div>
                   </div>
                </div>
                <div className="order-2 space-y-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold">Gestão Multilocais</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Organize seu inventário por armazéns, prateleiras e seções. Saiba exatamente onde está cada item e gerencie transferências entre locais com apenas alguns cliques.
                  </p>
                  <Button variant="outline" className="group">
                    Ver demonstração <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Feature 3: Financials */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 space-y-6">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold">Saúde Financeira</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Integramos seu estoque ao financeiro. Monitore o custo das mercadorias vendidas (CMV), margem de lucro e previsão de compras futuras para manter o fluxo de caixa saudável.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-green-500" /> Relatórios de Curva ABC</li>
                    <li className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="h-5 w-5 text-green-500" /> Histórico de movimentações auditável</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-3xl p-8 border border-green-500/10 shadow-xl lg:-mr-12 hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
                   <div className="w-full max-w-xs bg-background rounded-xl shadow-lg border border-border/50 p-6 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b">
                         <span className="font-bold">Saldo Total</span>
                         <span className="text-green-600 font-bold">+12%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Receita</span> <span>R$ 45k</span></div>
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Custos</span> <span>R$ 12k</span></div>
                        <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 w-[70%]"></div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground">Tire suas dúvidas e comece hoje mesmo.</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg">O plano grátis é realmente grátis?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  Sim! O plano Basic é 100% gratuito e não exige cartão de crédito. Você pode usá-lo por tempo indeterminado, respeitando o limite de 10 produtos e 2 armazéns.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg">Como funciona o pagamento do plano Pro?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  O plano Pro custa apenas R$ 24,99 mensais. Aceitamos pagamentos via cartão de crédito e PIX através da plataforma segura do Mercado Pago.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-lg">Posso cancelar a qualquer momento?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  Com certeza. Não há fidelidade. Você pode cancelar sua assinatura Pro a qualquer momento direto pelo painel de configurações.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg">Meus dados estão seguros?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  Absolutamente. Utilizamos criptografia de ponta e backups diários (no plano Pro) para garantir que suas informações nunca sejam perdidas.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                  Junte-se a milhares de empresas que transformaram sua operação logística com o Estoka.
                </p>
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="h-14 px-10 text-lg font-bold shadow-lg shadow-black/10 hover:shadow-xl bg-background text-primary hover:bg-secondary transition-all hover:scale-105 active:scale-95">
                    {user ? "Voltar ao Dashboard" : "Criar Conta Grátis"}
                  </Button>
                </Link>
                <p className="mt-6 text-primary-foreground/60 text-sm">
                  Comece agora mesmo.
                </p>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow delay-700 pointer-events-none" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-muted/30 pt-16 pb-8 text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-2xl text-foreground">
                <Box className="h-8 w-8 text-primary" />
                <span>Estoka</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                A plataforma definitiva para gestão de estoque inteligente. Potencialize seu negócio com tecnologia de ponta.
              </p>
              <div className="flex gap-4 pt-2">
                <Link to="#" className="hover:text-primary transition-colors bg-background p-2 rounded-full border border-border/50 hover:border-primary/50 shadow-sm"><Instagram className="h-5 w-5" /></Link>
                <Link to="#" className="hover:text-primary transition-colors bg-background p-2 rounded-full border border-border/50 hover:border-primary/50 shadow-sm"><Linkedin className="h-5 w-5" /></Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-6">Produto</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-primary transition-colors">Funcionalidades</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Integrações</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Atualizações</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-6">Empresa</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="#" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Carreiras</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-6">Contato</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>contato@estoka.com.br</span>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>São Paulo, SP - Brasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Estoka Tecnologia. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <Link to="#" className="hover:text-foreground transition-colors">Termos de Uso</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Privacidade</Link>
            </div>
          </div>
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

function TestimonialCard({ name, role, avatar, content }: { name: string, role: string, avatar: string, content: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map((s) => <Star key={s} className="h-4 w-4 text-yellow-500 fill-yellow-500" />)}
      </div>
      <p className="text-muted-foreground mb-6 italic">"{content}"</p>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}


