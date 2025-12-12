import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LowStockAlertProps {
  products: (Product & { currentStock: number })[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <h3 className="font-semibold text-foreground">Estoque Baixo</h3>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            {products.length} itens
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => navigate('/inventory')}
        >
          Ver todos
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="divide-y divide-border">
        {products.slice(0, 5).map((product) => {
          const percentage = (product.currentStock / product.minStock) * 100;
          return (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {product.currentStock}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {product.minStock} {product.unit}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <Progress
                    value={percentage}
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-success/10 p-3">
            <AlertTriangle className="h-6 w-6 text-success" />
          </div>
          <p className="mt-2 font-medium text-foreground">
            Tudo em ordem!
          </p>
          <p className="text-sm text-muted-foreground">
            Nenhum produto com estoque baixo.
          </p>
        </div>
      )}
    </div>
  );
}
