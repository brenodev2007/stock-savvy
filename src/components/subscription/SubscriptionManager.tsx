import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CreditCard, 
  Shield, 
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
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

export function SubscriptionManager() {
  const { subscription, isPro, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

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

  if (!isPro && subscription?.status !== 'cancelled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Você está no plano gratuito</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Faça upgrade para o plano Pro e desbloqueie recursos ilimitados!
          </p>
          <Button onClick={() => navigate('/subscription')}>
            Ver Planos
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Plano Pro
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura
              </CardDescription>
            </div>
            <Badge variant={getStatusVariant() as any}>
              {getStatusLabel()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {/* Subscription Details */}
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Valor Mensal
              </div>
              <span className="font-medium">
                R$ {subscription?.amount?.toFixed(2) || '50,00'}
              </span>
            </div>

            {subscription?.status === 'trial' && subscription.trial_end && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Teste termina em
                </div>
                <span className="font-medium">
                  {formatDate(subscription.trial_end)}
                </span>
              </div>
            )}

            {subscription?.next_billing_date && subscription?.status === 'active' && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Próxima cobrança
                </div>
                <span className="font-medium">
                  {formatDate(subscription.next_billing_date)}
                </span>
              </div>
            )}

            {subscription?.subscription_start && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Assinante desde
                </div>
                <span className="font-medium">
                  {formatDate(subscription.subscription_start)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex gap-2">
            {subscription?.status === 'cancelled' ? (
              <Button 
                onClick={handleReactivate} 
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reativar Assinatura
              </Button>
            ) : (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                Cancelar Assinatura
              </Button>
            )}
            
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
            >
              Ver Planos
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}
