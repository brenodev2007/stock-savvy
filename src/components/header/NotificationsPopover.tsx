import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, AlertTriangle, TrendingDown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStockBalances } from '@/hooks/useStockBalances';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'info';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  link?: string;
}

const STORAGE_KEY = 'notifications_read_ids';

export function NotificationsPopover() {
  const navigate = useNavigate();
  const { data: stockBalances } = useStockBalances();
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [open, setOpen] = useState(false);

  // Persist read IDs to localStorage
  const updateReadIds = (newReadIds: Set<string>) => {
    setReadIds(newReadIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...newReadIds]));
  };

  // Generate notifications from stock data
  const notifications = useMemo<Notification[]>(() => {
    if (!stockBalances) return [];

    const notifs: Notification[] = [];

    stockBalances.forEach((balance) => {
      if (balance.quantity === 0) {
        notifs.push({
          id: `out-${balance.id}`,
          type: 'out_of_stock',
          title: 'Produto sem estoque',
          message: `${balance.product?.name} está sem estoque no ${balance.warehouse?.name}`,
          time: new Date(),
          read: readIds.has(`out-${balance.id}`),
          link: '/inventory',
        });
      } else if (balance.quantity < (balance.product?.min_stock ?? 0)) {
        notifs.push({
          id: `low-${balance.id}`,
          type: 'low_stock',
          title: 'Estoque baixo',
          message: `${balance.product?.name} com apenas ${balance.quantity} ${balance.product?.unit} no ${balance.warehouse?.name}`,
          time: new Date(),
          read: readIds.has(`low-${balance.id}`),
          link: '/inventory',
        });
      }
    });

    return notifs.sort((a, b) => {
      // Unread first
      if (a.read !== b.read) return a.read ? 1 : -1;
      // Then by type severity
      const typeOrder = { out_of_stock: 0, low_stock: 1, info: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [stockBalances, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    updateReadIds(new Set([...readIds, id]));
  };

  const markAllAsRead = () => {
    updateReadIds(new Set(notifications.map((n) => n.id)));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'out_of_stock':
        return <Package className="h-4 w-4 text-destructive" />;
      case 'low_stock':
        return <TrendingDown className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-info" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllAsRead}
            >
              <Check className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full flex items-start gap-3 p-3 text-left hover:bg-muted transition-colors',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'text-sm truncate',
                        !notification.read && 'font-medium'
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(notification.time, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                navigate('/inventory');
                setOpen(false);
              }}
            >
              Ver todos os alertas de estoque
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
