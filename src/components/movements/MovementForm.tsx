import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Warehouse } from '@/hooks/useWarehouses';
import { MovementType } from '@/hooks/useMovements';
import { useEffect } from 'react';

const movementSchema = z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  warehouse_from_id: z.string().optional(),
  warehouse_to_id: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
  reason: z.string().max(200, 'Motivo muito longo').optional(),
  reference: z.string().max(100, 'Referência muito longa').optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MovementType;
  products: Product[];
  warehouses: Warehouse[];
  onSubmit: (data: MovementFormData & { type: MovementType }) => Promise<void>;
  isLoading?: boolean;
}

const movementConfig = {
  IN: {
    title: 'Nova Entrada',
    description: 'Registre a entrada de produtos no estoque',
    icon: ArrowDownLeft,
    color: 'text-success',
  },
  OUT: {
    title: 'Nova Saída',
    description: 'Registre a saída de produtos do estoque',
    icon: ArrowUpRight,
    color: 'text-destructive',
  },
  TRANSFER: {
    title: 'Transferência',
    description: 'Transfira produtos entre depósitos',
    icon: ArrowRightLeft,
    color: 'text-info',
  },
  ADJUST: {
    title: 'Ajuste de Inventário',
    description: 'Ajuste a quantidade de estoque',
    icon: ArrowRightLeft,
    color: 'text-warning',
  },
};

export function MovementForm({
  open,
  onOpenChange,
  type,
  products,
  warehouses,
  onSubmit,
  isLoading,
}: MovementFormProps) {
  const config = movementConfig[type];
  const Icon = config.icon;

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: '',
      warehouse_from_id: '',
      warehouse_to_id: '',
      quantity: 1,
      reason: '',
      reference: '',
    },
  });

  useEffect(() => {
    form.reset({
      product_id: '',
      warehouse_from_id: '',
      warehouse_to_id: '',
      quantity: 1,
      reason: '',
      reference: '',
    });
  }, [open, type, form]);

  const handleSubmit = async (data: MovementFormData) => {
    await onSubmit({ ...data, type });
  };

  const activeWarehouses = warehouses.filter((w) => w.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>{config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(type === 'OUT' || type === 'TRANSFER') && (
              <FormField
                control={form.control}
                name="warehouse_from_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depósito de Origem</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o depósito" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeWarehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === 'IN' || type === 'TRANSFER' || type === 'ADJUST') && (
              <FormField
                control={form.control}
                name="warehouse_to_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === 'TRANSFER' ? 'Depósito de Destino' : 'Depósito'}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o depósito" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeWarehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referência (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: NF-123456, PED-789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compra, Venda, Ajuste" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
