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
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, CalendarIcon } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Warehouse } from '@/hooks/useWarehouses';
import { MovementType, StockMovement } from '@/hooks/useMovements';
import { useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const createMovementSchema = (type: MovementType) => z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  warehouse_from_id: (type === 'OUT' || type === 'TRANSFER') 
    ? z.string().min(1, 'Selecione o depósito de origem')
    : z.string().optional(),
  warehouse_to_id: (type === 'IN' || type === 'TRANSFER' || type === 'ADJUST')
    ? z.string().min(1, 'Selecione o depósito')
    : z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
  reason: z.string().max(200, 'Motivo muito longo').optional(),
  reference: z.string().max(100, 'Referência muito longa').optional(),
  created_at: z.date().optional(),
});

type MovementFormData = z.infer<ReturnType<typeof createMovementSchema>>;

interface MovementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MovementType;
  products: Product[];
  warehouses: Warehouse[];
  onSubmit: (data: MovementFormData & { type: MovementType } & { id?: string }) => Promise<void>;
  isLoading?: boolean;
  initialData?: StockMovement | null;
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
  initialData,
}: MovementFormProps) {
  const config = movementConfig[type];
  const Icon = config.icon;

  const form = useForm<MovementFormData>({
    resolver: zodResolver(createMovementSchema(type)),
    defaultValues: {
      product_id: '',
      warehouse_from_id: '',
      warehouse_to_id: '',
      quantity: 1,
      reason: '',
      reference: '',
      created_at: new Date(),
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          product_id: initialData.product_id,
          warehouse_from_id: initialData.warehouse_from_id || '',
          warehouse_to_id: initialData.warehouse_to_id || '',
          quantity: initialData.quantity,
          reason: initialData.reason || '',
          reference: initialData.reference || '',
          created_at: new Date(initialData.created_at),
        });
      } else {
        form.reset({
          product_id: '',
          warehouse_from_id: '',
          warehouse_to_id: '',
          quantity: 1,
          reason: '',
          reference: '',
          created_at: new Date(),
        });
      }
    }
  }, [open, type, initialData, form]);

  // Re-create resolver when type changes
  useEffect(() => {
    form.clearErrors();
  }, [type, form]);

  const handleSubmit = async (data: MovementFormData) => {
    const submitData = {
      ...data,
      type,
      // Clean up empty strings to undefined for proper handling
      warehouse_from_id: data.warehouse_from_id || undefined,
      warehouse_to_id: data.warehouse_to_id || undefined,
      reason: data.reason || undefined,
      reference: data.reference || undefined,
      created_at: data.created_at || new Date(),
      id: initialData?.id
    };
    await onSubmit(submitData);
  };

  const activeWarehouses = warehouses.filter((w) => w.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{initialData ? 'Editar Movimentação' : config.title}</DialogTitle>
              <DialogDescription>{initialData ? 'Edite os dados da movimentação' : config.description}</DialogDescription>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <Input placeholder="Ex: NF-123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <FormField
              control={form.control}
              name="created_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Movimentação</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PP HH:mm", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                         <Input 
                            type="time" 
                            value={field.value ? format(field.value, 'HH:mm') : ''}
                            onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                if (hours && minutes) {
                                    const newDate = new Date(field.value || new Date());
                                    newDate.setHours(parseInt(hours));
                                    newDate.setMinutes(parseInt(minutes));
                                    field.onChange(newDate);
                                }
                            }}
                         />
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 sticky bottom-0 bg-background pb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Salvar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
