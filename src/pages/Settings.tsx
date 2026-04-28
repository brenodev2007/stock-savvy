import { useState, useMemo } from 'react';
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
import { 
  LogOut, Save, User, Mail, CreditCard, Package, AlertCircle, CheckCircle2, 
  Bell, BellOff, Loader2, Shield, Clock, TrendingDown, AlertTriangle, 
  Calendar, Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, Notification as BackendNotification } from '@/hooks/useNotifications';
import { useStockBalances } from '@/hooks/useStockBalances';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UnifiedNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'low_stock' | 'out_of_stock';
  read: boolean;
  created_at: Date;
  source: 'system' | 'stock';
  link?: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [cpfCnpj, setCpfCnpj] = useState(user?.cpf_cnpj || '');
  const [hasChanges, setHasChanges] = useState(false);
  const { data: backendNotifications, isLoading: loadingNotifs } = useNotifications();
  const { data: stockBalances } = useStockBalances();
  const markAsRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();

  // Reactive state for stock notification read IDs (synced with localStorage)
  const [stockReadIds, setStockReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('notifications_read_ids');
    return stored ? new Set<string>(JSON.parse(stored)) : new Set<string>();
  });

  const updateStockReadIds = (newIds: Set<string>) => {
    setStockReadIds(newIds);
    localStorage.setItem('notifications_read_ids', JSON.stringify([...newIds]));
  };

  // Merge backend notifications + stock-based notifications
  const allNotifications = useMemo<UnifiedNotification[]>(() => {
    const merged: UnifiedNotification[] = [];

    // Backend notifications
    if (backendNotifications) {
      backendNotifications.forEach((n) => {
        merged.push({
          id: `backend-${n.id}`,
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          created_at: new Date(n.created_at),
          source: 'system',
        });
      });
    }

    // Stock-based notifications (same logic as NotificationsPopover)
    if (stockBalances) {
      stockBalances.forEach((balance) => {
        if (balance.quantity === 0) {
          const id = `out-${balance.id}`;
          merged.push({
            id,
            title: 'Produto sem estoque',
            message: `${balance.product?.name} está sem estoque no ${balance.warehouse?.name}`,
            type: 'out_of_stock',
            read: stockReadIds.has(id),
            created_at: new Date(),
            source: 'stock',
            link: '/inventory',
          });
        } else if (balance.quantity < (balance.product?.min_stock ?? 0)) {
          const id = `low-${balance.id}`;
          merged.push({
            id,
            title: 'Estoque baixo',
            message: `${balance.product?.name} com apenas ${balance.quantity} ${balance.product?.unit} no ${balance.warehouse?.name}`,
            type: 'low_stock',
            read: stockReadIds.has(id),
            created_at: new Date(),
            source: 'stock',
            link: '/inventory',
          });
        }
      });
    }

    // Sort: unread first, then by date
    return merged.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return b.created_at.getTime() - a.created_at.getTime();
    });
  }, [backendNotifications, stockBalances, stockReadIds]);

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const handleNameChange = (value: string) => {
    setName(value);
    checkChanges(value, cpfCnpj);
  };

  const handleCpfCnpjChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length <= 11) {
      formatted = cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
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

  const handleMarkAllRead = () => {
    // Mark backend notifications
    markAllRead.mutate();
    // Mark stock notifications reactively
    const stockIds = allNotifications.filter(n => n.source === 'stock').map(n => n.id);
    const newIds = new Set(stockReadIds);
    stockIds.forEach(id => newIds.add(id));
    updateStockReadIds(newIds);
  };

  const handleNotifClick = (notif: UnifiedNotification) => {
    if (notif.read) {
      if (notif.link) navigate(notif.link);
      return;
    }
    if (notif.source === 'system') {
      const realId = notif.id.replace('backend-', '');
      markAsRead.mutate(realId);
    } else {
      const newIds = new Set(stockReadIds);
      newIds.add(notif.id);
      updateStockReadIds(newIds);
    }
    if (notif.link) navigate(notif.link);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotifIcon = (type: UnifiedNotification['type']) => {
    switch (type) {
      case 'out_of_stock':
        return <Package className="h-4 w-4 text-destructive" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4 text-amber-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getNotifColor = (type: UnifiedNotification['type']) => {
    switch (type) {
      case 'out_of_stock':
      case 'error':
        return 'border-destructive/20 bg-destructive/5';
      case 'low_stock':
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5';
      case 'success':
        return 'border-emerald-500/20 bg-emerald-500/5';
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  const memberSince = user ? 'Membro ativo' : '';

  return (
    <AppLayout title="Meu Perfil" subtitle="Gerencie sua conta e preferências">
      <div className="w-full max-w-5xl mx-auto space-y-6">
        
        {/* Profile Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 blur-sm group-hover:blur-md transition-all" />
              <Avatar className="relative h-28 w-28 ring-4 ring-background shadow-xl">
                <AvatarImage src={user?.avatar_url || undefined} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                  {getInitials(user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{user?.name}</h2>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-sm">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge className="gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                  <Shield className="h-3 w-3" />
                  Conta Verificada
                </Badge>
                {user?.cpf_cnpj && (
                  <Badge variant="outline" className="gap-1.5">
                    <CreditCard className="h-3 w-3" />
                    {user.cpf_cnpj.length > 14 ? 'CNPJ' : 'CPF'} Cadastrado
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {memberSince}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          
          {/* Left Column — Profile Form (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize seus dados cadastrais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">
                      Nome / Razão Social
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Digite seu nome ou empresa"
                      className="h-11 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf_cnpj" className="text-sm font-semibold">
                      CPF / CNPJ
                    </Label>
                    <Input
                      id="cpf_cnpj"
                      value={cpfCnpj}
                      onChange={(e) => handleCpfCnpjChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={18}
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="h-11 bg-muted/50 pr-10 rounded-lg"
                    />
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    O e-mail não pode ser alterado por questões de segurança
                  </p>
                </div>

                {hasChanges && (
                  <div className="flex gap-3 pt-3 border-t border-dashed animate-in fade-in slide-in-from-top-2 duration-200">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfile.isPending}
                      className="flex-1 shadow-lg shadow-primary/20"
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
                      size="lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Card */}
            <Card className="border-destructive/15 bg-gradient-to-br from-destructive/5 to-background shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-destructive flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Encerrar Sessão
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Desconectar do sistema com segurança
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="shadow-lg shadow-destructive/20"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                  </Button>
                </div>
                <Separator className="bg-destructive/10 my-4" />
                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider font-bold">
                  Versão do Sistema: 2.1.0
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column — Notifications (2/5) */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="relative h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-primary" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    Notificações
                  </CardTitle>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[11px] h-7 text-primary hover:text-primary"
                      onClick={handleMarkAllRead}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Marcar lidas
                    </Button>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Alertas de estoque e avisos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                  {loadingNotifs ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary/40" />
                      <p className="text-sm">Carregando...</p>
                    </div>
                  ) : allNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                        <BellOff className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">Tudo tranquilo!</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">Nenhuma notificação</p>
                    </div>
                  ) : (
                    allNotifications.map((notif, index) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all duration-200 hover:shadow-sm hover:scale-[1.01] animate-in fade-in slide-in-from-right-2",
                          notif.read 
                            ? "bg-background border-border/50 opacity-60 hover:opacity-80" 
                            : getNotifColor(notif.type)
                        )}
                        style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                            notif.read ? "bg-muted" : "bg-background shadow-sm"
                          )}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className={cn(
                                "text-sm truncate",
                                !notif.read && "font-semibold"
                              )}>
                                {notif.title}
                              </p>
                              {!notif.read && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[10px] text-muted-foreground/60">
                                {formatDistanceToNow(notif.created_at, { addSuffix: true, locale: ptBR })}
                              </span>
                              <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-medium">
                                {notif.source === 'stock' ? 'Estoque' : 'Sistema'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}