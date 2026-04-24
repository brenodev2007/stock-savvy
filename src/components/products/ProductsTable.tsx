import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Edit, MoreHorizontal, Package, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProductsTableProps {
  products: Product[];
  stockBalances: Record<string, number>;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({
  products,
  stockBalances,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>SKU</th>
            <th>Categoria</th>
            <th className="text-right">Estoque</th>
            <th className="text-right">Custo</th>
            <th className="text-right">Preço</th>
            <th className="text-center">Status</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const stock = stockBalances[product.id] ?? 0;
            const isLowStock = stock < product.minStock;
            const isOutOfStock = stock === 0;

            return (
              <tr
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-sm font-sans">
                    {product.sku}
                  </span>
                </td>
                <td>
                  <span className="text-sm text-muted-foreground">
                    {product.category?.name ?? '-'}
                  </span>
                </td>
                <td className="text-right">
                  <span
                    className={cn(
                      'font-medium',
                      isOutOfStock && 'text-destructive',
                      isLowStock && !isOutOfStock && 'text-warning',
                      !isLowStock && 'text-foreground'
                    )}
                  >
                    {stock}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {product.unit}
                  </span>
                </td>
                <td className="text-right text-muted-foreground">
                  {formatCurrency(product.cost)}
                </td>
                <td className="text-right font-medium">
                  {formatCurrency(product.price)}
                </td>
                <td className="text-center">
                  {isOutOfStock ? (
                    <span className="badge-danger">Sem estoque</span>
                  ) : isLowStock ? (
                    <span className="badge-warning">Baixo</span>
                  ) : (
                    <span className="badge-success">OK</span>
                  )}
                </td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(product)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-foreground">Nenhum produto cadastrado</p>
          <p className="text-sm text-muted-foreground">
            Clique em "Novo Produto" para começar.
          </p>
        </div>
      )}
    </div>
  );
}
