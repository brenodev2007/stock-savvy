import { useState } from 'react';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, Save, User, Mail, CreditCard, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { useNotifications, useMarkAllAsRead } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [cpfCnpj, setCpfCnpj] = useState(user?.cpf_cnpj || '');
  const [hasChanges, setHasChanges] = useState(false);
  const { data: notifications, isLoading: loadingNotifs } = useNotifications();
  const markAllRead = useMarkAllAsRead();

  const handleNameChange = (value: string) => {
    setName(value);
    checkChanges(value, cpfCnpj);
  };

  const handleCpfCnpjChange = (value: string) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as CPF (000.000.000-00) or CNPJ (00.000.000/0000-00)
    let formatted = '';
    if (cleaned.length <= 11) {
      // CPF
      formatted = cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ
      formatted = cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    
    setCpfCnpj(formatted);
    checkChanges(name, formatted);
  };

  const checkChanges = (newName: string, newCpf: string) => {
    setHasChanges(
      newName !== user?.name || 
      newCpf !== (user?.cpf_cnpj || '')
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await updateProfile.mutateAsync({ 
        name,
        cpf_cnpj: cpfCnpj || null 
      });
      setHasChanges(false);
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Sessão encerrada com sucesso');
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout title="Configurações do Perfil" subtitle="Gerencie seus dados e preferências do sistema">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                  <AvatarImage src={user?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                    {getInitials(user?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-4 border-background flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <Badge variant="secondary" className="gap-1">
                    <User className="h-3 w-3" />
                    Conta Ativa
                  </Badge>
                  {user?.cpf_cnpj && (
                    <Badge variant="outline" className="gap-1">
                      <CreditCard className="h-3 w-3" />
                      {user.cpf_cnpj.length > 14 ? 'CNPJ' : 'CPF'} Cadastrado
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seus dados cadastrais e informações do perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Nome / Razão Social
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Digite seu nome ou empresa"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj" className="text-base">
                  CPF / CNPJ
                </Label>
                <Input
                  id="cpf_cnpj"
                  value={cpfCnpj}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={18}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Informe seu CPF ou CNPJ para identificação fiscal
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email" className="text-base">
                  E-mail
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="h-11 bg-muted/50 pr-10"
                  />
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado por questões de segurança
                </p>
              </div>
            </div>

            {hasChanges && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="sm:flex-1"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setName(user?.name || '');
                    setCpfCnpj(user?.cpf_cnpj || '');
                    setHasChanges(false);
                  }}
                  className="sm:flex-1"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>



        {/* Session & System Cards */}
        {/* Notifications and Session Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Internal Notifications */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notificações
                </CardTitle>
                <CardDescription>Avisos e mensagens do sistema</CardDescription>
              </div>
              {notifications && notifications.some(n => !n.read) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => markAllRead.mutate()}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {loadingNotifs ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Carregando notificações...</p>
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <BellOff className="h-8 w-8 mb-2 opacity-20" />
                    <p>Nenhuma notificação por enquanto</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        notif.read ? "bg-background border-border/50" : "bg-primary/5 border-primary/20 shadow-sm"
                      )}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <p className={cn("font-medium", !notif.read && "text-primary")}>{notif.title}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{notif.message}</p>
                        </div>
                        <span className="text-[10px] whitespace-nowrap text-muted-foreground font-medium">
                          {format(new Date(notif.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Card */}
          <Card className="border-destructive/20 h-fit bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-5 w-5" />
                Sessão
              </CardTitle>
              <CardDescription>
                Encerre sua conexão com o sistema com segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator className="bg-destructive/10" />
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full shadow-lg shadow-destructive/20"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da Conta
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold">
                Versão do Sistema: 2.1.0
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}