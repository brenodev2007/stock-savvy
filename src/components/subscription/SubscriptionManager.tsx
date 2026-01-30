import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  CreditCard, 
  Shield, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  BarChart3,
  Zap,
  Headphones,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { EnvironmentBadge } from '@/components/ui/environment-badge';

export function SubscriptionManager() {
  const { subscription, limits, isPro, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [environment, setEnvironment] = useState<'development' | 'production'>('development');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await api.post('/subscription/cancel', {
        reason: cancellationReason
      });

      toast.success('Assinatura cancelada com sucesso');
      setCancelDialogOpen(false);
      setCancellationReason('');
      await refreshSubscription();
    } catch (error: any) {
      console.error('Erro ao cancelar:', error);
      toast.error(error.response?.data?.error || 'Erro ao cancelar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setLoading(true);
      await api.post('/subscription/reactivate');
      toast.success('Assinatura reativada com sucesso!');
      await refreshSubscription();
    } catch (error: any) {
      console.error('Erro ao reativar:', error);
      toast.error(error.response?.data?.error || 'Erro ao reativar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (subscription?.status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'trial':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
      case 'paused':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = () => {
    switch (subscription?.status) {
      case 'active':
        return 'Ativo';
      case 'trial':
        return 'Período de Teste';
      case 'cancelled':
        return 'Cancelado';
      case 'paused':
        return 'Pausado';
      default:
        return 'Inativo';
    }
  };

  const getStatusVariant = () => {
    switch (subscription?.status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isTrialActive = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const isCancelled = subscription?.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Status da Assinatura Atual (Pro) */}
      {isPro && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon()}
                  Plano Pro {isTrialActive && "(Trial)"}
                </CardTitle>
                <CardDescription>
                  {isTrialActive && `Período de teste até ${formatDate(subscription?.trial_end)}`}
                  {isActive && `Próxima cobrança: ${formatDate(subscription?.next_billing_date)}`}
                  {isCancelled && `Cancelado em ${formatDate(subscription?.subscription_end)}`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusVariant() as any}>
                  {getStatusLabel()}
                </Badge>
                <EnvironmentBadge environment={environment} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor Mensal</p>
                  <p className="font-semibold">R$ {Number(subscription?.amount || 0.01).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Assinante desde</p>
                  <p className="font-semibold">{formatDate(subscription?.subscription_start)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Recursos</p>
                  <p className="font-semibold">Ilimitados</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {isCancelled ? (
              <Button onClick={handleReactivate} disabled={loading} variant="default">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reativar Assinatura
              </Button>
            ) : (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                disabled={loading}
                variant="destructive"
              >
                Cancelar Assinatura
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {/* Limites do Plano Basic */}
      {!isPro && limits && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Plano Gratuito (Basic)</strong> - Você está usando {limits.limits.products.current} de {limits.limits.products.max} produtos e {limits.limits.warehouses.current} de {limits.limits.warehouses.max} armazéns.
          </AlertDescription>
        </Alert>
      )}

      {/* Comparação de Planos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Planos Disponíveis</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Plano Basic */}
          <Card className={!isPro ? "border-2 border-primary" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Basic</span>
                {!isPro && <Badge>Plano Atual</Badge>}
              </CardTitle>
              <CardDescription>Para começar</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Grátis</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Até 50 produtos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Até 2 armazéns</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Relatórios básicos</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>Relatórios avançados</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <X className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled={!isPro}>
                {!isPro ? 'Plano Atual' : 'Downgrade Indisponível'}
              </Button>
            </CardFooter>
          </Card>

          {/* Plano Pro */}
          <Card className={isPro ? "border-2 border-primary shadow-lg" : "border-primary/20 shadow-lg"}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMENDADO
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="flex items-center justify-between">
                <span>Pro</span>
                {isPro && <Badge>Plano Atual</Badge>}
              </CardTitle>
              <CardDescription>Para negócios em crescimento</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0,01</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Produtos ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Armazéns ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Relatórios avançados ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Sem anúncios</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Suporte prioritário</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-medium">Backup diário automático</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {!isPro && (
                <Button 
                  className="w-full h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all" 
                  onClick={() => navigate('/checkout')}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Assinar Agora (Teste Grátis)
                </Button>
              )}
              {isPro && (
                <Button variant="outline" className="w-full" disabled>
                  Plano Atual
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          💳 Pagamento processado de forma segura pelo Mercado Pago
        </p>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura Pro? Você perderá acesso a todos os recursos premium.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">
                Motivo do cancelamento (opcional)
              </label>
              <Textarea
                placeholder="Nos ajude a melhorar contando o motivo..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Manter Assinatura
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
