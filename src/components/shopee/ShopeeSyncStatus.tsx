import { format, formatDistanceToNow, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopeeSyncLogs, useSyncShopeeOrders, useShopeeAccounts } from '@/hooks/useShopee';
import { cn } from '@/lib/utils';

export function ShopeeSyncStatus() {
  const { data: accounts } = useShopeeAccounts();
  const { data: syncLogs, isLoading } = useShopeeSyncLogs();
  const syncOrders = useSyncShopeeOrders();

  const lastSync = syncLogs?.[0];
  const hasAccounts = accounts && accounts.length > 0;

  const handleSyncAll = () => {
    if (!accounts?.length) return;
    // Sync first active account
    const activeAccount = accounts.find(a => a.is_active);
    if (activeAccount) {
      syncOrders.mutate(activeAccount.id);
    }
  };

  const getSyncTimeDistance = (dateString: string) => {
    const date = new Date(dateString);
    if (!isValid(date)) return 'Data desconhecida';
    
    try {
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Status da Sincronização</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={!hasAccounts || syncOrders.isPending}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', syncOrders.isPending && 'animate-spin')} />
            Sincronizar Agora
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAccounts ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span className="text-sm">Conecte uma conta Shopee para sincronizar pedidos.</span>
          </div>
        ) : lastSync ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {lastSync.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : lastSync.status === 'error' ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {lastSync.status === 'success' && 'Última sincronização bem-sucedida'}
                  {lastSync.status === 'error' && 'Erro na última sincronização'}
                  {lastSync.status === 'in_progress' && 'Sincronização em andamento...'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getSyncTimeDistance(lastSync.started_at)}
                  {lastSync.orders_synced > 0 && ` • ${lastSync.orders_synced} pedidos`}
                </p>
              </div>
            </div>
            {lastSync.error_message && (
              <div className="text-xs text-red-600 bg-red-50 rounded p-2">
                {lastSync.error_message}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Nenhuma sincronização realizada ainda.</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4">
          A sincronização automática ocorre a cada 15 minutos.
        </p>
      </CardContent>
    </Card>
  );
}
