import { Store, RefreshCw, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useShopeeAccounts, useSyncShopeeOrders, useDeleteShopeeAccount, useSetActiveShopeeAccount } from '@/hooks/useShopee';
import { ShopeeConnectButton } from './ShopeeConnectButton';
import { cn } from '@/lib/utils';

export function ShopeeAccountsManager() {
  const { data: accounts, isLoading } = useShopeeAccounts();
  const syncOrders = useSyncShopeeOrders();
  const deleteAccount = useDeleteShopeeAccount();
  const setActiveAccount = useSetActiveShopeeAccount();
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

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
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{account.shop_name}</h4>
                        {account.is_active && (
                          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                            <Star className="h-3 w-3 fill-amber-700" />
                            Conta Ativa
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">ID: {account.shop_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!account.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveAccount.mutate(account.id)}
                        disabled={setActiveAccount.isPending}
                        className="gap-2"
                      >
                        <Star className="h-4 w-4" />
                        Marcar como Ativa
                      </Button>
                    )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAccountToDelete(account.id)}
                      disabled={deleteAccount.isPending}
                      className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta conta Shopee? Esta ação não pode ser desfeita.
              Os pedidos associados a esta conta serão mantidos, mas não será possível sincronizar novos pedidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (accountToDelete) {
                  deleteAccount.mutate(accountToDelete);
                  setAccountToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
