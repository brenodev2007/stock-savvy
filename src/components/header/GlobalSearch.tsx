import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ArrowRightLeft, Warehouse, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useWarehouses } from '@/hooks/useWarehouses';
import { useMovements } from '@/hooks/useMovements';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const { data: movements } = useMovements(20);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch('');
    }
  }, [open]);

  const filteredProducts = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredWarehouses = warehouses?.filter(
    (w) => w.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3) || [];

  const filteredMovements = movements?.filter(
    (m) =>
      m.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      m.product?.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.reference?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 3) || [];

  const hasResults = search.length > 0 && (
    filteredProducts.length > 0 ||
    filteredWarehouses.length > 0 ||
    filteredMovements.length > 0
  );

  const navigateTo = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <div className="p-4 pt-12 pb-2 relative">
          <div className="sr-only">Busca Global</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Buscar produtos, depósitos, movimentações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {search.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Digite para buscar produtos, depósitos ou movimentações...
            </div>
          )}

          {search.length > 0 && !hasResults && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado para "{search}"
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                Produtos
              </p>
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => navigateTo('/products')}
                  className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Warehouses */}
          {filteredWarehouses.length > 0 && (
            <div className="mb-4">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                Depósitos
              </p>
              {filteredWarehouses.map((warehouse) => (
                <button
                  key={warehouse.id}
                  onClick={() => navigateTo('/warehouses')}
                  className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
                    <Warehouse className="h-4 w-4 text-success" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{warehouse.name}</p>
                    <p className="text-xs text-muted-foreground">{warehouse.address || 'Sem endereço'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Movements */}
          {filteredMovements.length > 0 && (
            <div>
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
                Movimentações
              </p>
              {filteredMovements.map((movement) => (
                <button
                  key={movement.id}
                  onClick={() => navigateTo('/movements')}
                  className="w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10">
                    <ArrowRightLeft className="h-4 w-4 text-info" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{movement.product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.type} • {movement.quantity} un
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts */}
        <div className="border-t border-border p-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted font-sans text-[10px]">ESC</kbd> para fechar</span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-sans text-[10px]">⌘</kbd> + 
            <kbd className="px-1.5 py-0.5 rounded bg-muted font-sans text-[10px]">K</kbd> para buscar
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
