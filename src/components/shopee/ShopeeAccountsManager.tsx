import { Store, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopeeAccounts, useSyncShopeeOrders } from '@/hooks/useShopee';
import { ShopeeConnectButton } from './ShopeeConnectButton';
import { cn } from '@/lib/utils';

export function ShopeeAccountsManager() {
  const { data: accounts, isLoading } = useShopeeAccounts();
  const syncOrders = useSyncShopeeOrders();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Contas Shopee</h3>
        <ShopeeConnectButton />
      </div>

      {accounts?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium">Nenhuma conta conectada</h4>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Adicione sua primeira conta Shopee para começar a sincronizar pedidos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {accounts?.map((account) => (
            <Card key={account.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <Store className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{account.shop_name}</h4>
                      <p className="text-xs text-muted-foreground">ID: {account.shop_id}</p>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                      account.is_active 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {account.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Ativa
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Inativa
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncOrders.mutate(account.id)}
                      disabled={syncOrders.isPending}
                      className="gap-2"
                    >
                      <RefreshCw className={cn('h-4 w-4', syncOrders.isPending && 'animate-spin')} />
                      Sincronizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
