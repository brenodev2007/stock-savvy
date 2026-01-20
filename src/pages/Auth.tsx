import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { formatCpfCnpj, isValidCpfCnpj } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Box, Loader2, AlertCircle, Eye, EyeOff, Check, ArrowRight, Quote } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    secretKeyword: z.string().min(3, "Palavra-chave deve ter pelo menos 3 caracteres"),
    cpfCnpj: z.string().optional().refine((val) => !val || isValidCpfCnpj(val), {
      message: "CPF ou CNPJ inválido",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginErrorDialog, setShowLoginErrorDialog] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupSecretKeyword, setSignupSecretKeyword] = useState("");
  const [signupCpfCnpj, setSignupCpfCnpj] = useState("");
  
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSecretKeyword, setForgotPasswordSecretKeyword] = useState("");
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
     toast.error("E-mail ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.");
      setShowLoginErrorDialog(true);
    } else {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signupSchema.safeParse({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
      secretKeyword: signupSecretKeyword,
      cpfCnpj: signupCpfCnpj,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, signupSecretKeyword, signupCpfCnpj);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || "Erro ao criar conta");
    } else {
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    const { error, message } = await resetPassword(forgotPasswordEmail, forgotPasswordSecretKeyword, forgotPasswordNewPassword);
    setForgotPasswordLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(message || "Senha redefinida com sucesso!");
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail("");
      setForgotPasswordSecretKeyword("");
      setForgotPasswordNewPassword("");
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-background">
      {/* Left side - Visual Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary dark:text-primary-foreground relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 text-white">
          <div className="flex items-center gap-2 font-bold text-2xl mb-12">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
               <Box className="h-6 w-6 text-white" />
            </div>
            <span>Estoka</span>
          </div>
          
          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Gerencie seu estoque com inteligência.
            </h1>
            <p className="text-xl text-white/80 font-light">
              A plataforma completa para empresas que querem crescer sem perder o controle.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-white mt-12">
           <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg">
             <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
               Por que escolher o Estoka?
             </h3>
             <ul className="space-y-4">
               <li className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                   <Check className="h-4 w-4" />
                 </div>
                 <span className="text-white/90">Controle total de produtos e armazéns</span>
               </li>
               <li className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                   <Check className="h-4 w-4" />
                 </div>
                 <span className="text-white/90">Relatórios financeiros detalhados</span>
               </li>
               <li className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                   <Check className="h-4 w-4" />
                 </div>
                 <span className="text-white/90">Segurança de dados e backups diários</span>
               </li>
             </ul>
           </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
           <div className="text-center lg:text-left space-y-2">
             <div className="lg:hidden flex justify-center mb-6">
               <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
                 <Box className="h-6 w-6 text-white" />
               </div>
             </div>
             <h2 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h2>
             <p className="text-muted-foreground">
               Acesse sua conta para gerenciar seu negócio.
             </p>
           </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1">
              <TabsTrigger value="login" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11"
                    />
                    {errors.email && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                       <Label htmlFor="login-password">Senha</Label>
                       <Button variant="link" className="px-0 h-auto text-xs text-primary" type="button" onClick={() => setIsForgotPasswordOpen(true)}>Esqueceu a senha?</Button>
                     </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11"
                    />
                    {errors.password && <p className="text-sm text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.password}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Entrar na Plataforma
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Razão Social</Label>
                      <Input
                        id="signup-name"
                        placeholder="Nome da empresa"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        disabled={isLoading}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-cpf-cnpj">CNPJ / CPF</Label>
                      <Input
                        id="signup-cpf-cnpj"
                        placeholder="000.000.000-00"
                        value={signupCpfCnpj}
                        onChange={(e) => setSignupCpfCnpj(formatCpfCnpj(e.target.value))}
                        disabled={isLoading}
                        maxLength={18}
                      />
                      {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj}</p>}
                    </div>
                  </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-secret-keyword">Palavra-chave Secreta (Recuperação)</Label>
                      <Input
                        id="signup-secret-keyword"
                        placeholder="Ex: Nome do primeiro pet"
                        value={signupSecretKeyword}
                        onChange={(e) => setSignupSecretKeyword(e.target.value)}
                        disabled={isLoading}
                      />
                      {errors.secretKeyword && <p className="text-xs text-destructive">{errors.secretKeyword}</p>}
                    </div>


                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail Corporativo</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@empresa.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-8"
                        />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </button>
                      </div>
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirmar</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="pr-8"
                        />
                         <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground">
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                         </button>
                      </div>
                      {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Ao criar uma conta, você concorda com nossos <a href="#" className="underline hover:text-primary">Termos de Serviço</a> e <a href="#" className="underline hover:text-primary">Política de Privacidade</a>.
                </div>

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta Gratuita"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Alert Dialog for Login Error */}
      <AlertDialog open={showLoginErrorDialog} onOpenChange={setShowLoginErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao fazer login
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              {loginErrorMessage || "Verifique suas credenciais e tente novamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLoginErrorDialog(false)}>
              Tentar novamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo e sua palavra-chave secreta para redefinir sua senha.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">E-mail</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="seu@email.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-keyword">Palavra-chave Secreta</Label>
              <Input
                id="forgot-keyword"
                placeholder="Sua palavra-chave de segurança"
                value={forgotPasswordSecretKeyword}
                onChange={(e) => setForgotPasswordSecretKeyword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-new-password">Nova Senha</Label>
              <Input
                id="forgot-new-password"
                type="password"
                placeholder="••••••••"
                value={forgotPasswordNewPassword}
                onChange={(e) => setForgotPasswordNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsForgotPasswordOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={forgotPasswordLoading}>
                {forgotPasswordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enviar Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
