import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { Check, ChevronsUpDown, Trash2, Plus, Settings, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateManualOrder, useUpdateShopeeOrder } from '@/hooks/useShopee';
import { useProducts } from '@/hooks/useProducts';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import type { ShopeeOrder, ShopeeShipmentStatus } from '@/types/shopee';

const itemSchema = z.object({
  product_id: z.string().optional(),
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
  sku: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  unit_price: z.coerce.number().min(0, 'Valor deve ser positivo'),
});

const formSchema = z.object({
  order_sn: z.string().min(1, 'Número do pedido é obrigatório'),
  items: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
  customer_name: z.string().optional(),
  shipping_address: z.string().optional(),
  status: z.enum(['AGUARDANDO_ENVIO', 'EMPACOTADO', 'ETIQUETADO', 'ENVIADO', 'EM_TRANSPORTE', 'ENTREGUE', 'CANCELADO', 'DEVOLVIDO']),
  carrier: z.string().optional(),
  tracking_code: z.string().optional(),
  purchase_date: z.string().min(1, 'Data do pedido é obrigatória'),
  estimated_delivery: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const statusOptions = [
  { value: 'AGUARDANDO_ENVIO', label: 'Aguardando Envio' },
  { value: 'EMPACOTADO', label: 'Empacotado' },
  { value: 'ETIQUETADO', label: 'Etiquetado' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'EM_TRANSPORTE', label: 'Em Transporte' },
  { value: 'ENTREGUE', label: 'Entregue' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'DEVOLVIDO', label: 'Devolvido' },
];

interface ShopeeOrderFormProps {
  order?: ShopeeOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShopeeOrderForm({ order, open, onOpenChange }: ShopeeOrderFormProps) {
  const { settings, updateSettings, saveSettings: persistSettings } = useSettings();
  const createOrder = useCreateManualOrder();
  const updateOrder = useUpdateShopeeOrder();
  const { data: products } = useProducts();
  const isEditing = !!order;
  const [openCombobox, setOpenCombobox] = useState<number | null>(null);
  
  // Tax Settings State
  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(settings.shopee?.taxPercentage ?? 20);
  const [taxFixed, setTaxFixed] = useState(settings.shopee?.taxFixed ?? 4);

  // Update local state when settings change or modal opens
  useEffect(() => {
    if (!order && open) { 
      setTaxPercentage(settings.shopee?.taxPercentage ?? 20);
      setTaxFixed(settings.shopee?.taxFixed ?? 4);
    }
  }, [settings.shopee, order, open]);

  const handleSaveTaxDefaults = () => {
    updateSettings({
      shopee: {
        taxPercentage,
        taxFixed
      }
    });
    persistSettings();
    toast.success('Taxas padrão salvas com sucesso!');
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_sn: '',
      items: [{ product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0 }],
      customer_name: '',
      shipping_address: '',
      status: 'AGUARDANDO_ENVIO',
      carrier: '',
      tracking_code: '',
      purchase_date: new Date().toISOString().split('T')[0],
      estimated_delivery: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Calculate total whenever items change
  const items = useWatch({ control: form.control, name: 'items' });
  
  const { orderTotal, totalQuantity, totalTax, netTotal } = useMemo(() => {
    const values = (items || []).reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return {
        total: acc.total + (quantity * price),
        qty: acc.qty + quantity
      };
    }, { total: 0, qty: 0 });

    const totalTax = values.total > 0 
      ? (values.total * (taxPercentage / 100)) + (taxFixed * values.qty)
      : 0;

    return {
      orderTotal: values.total,
      totalQuantity: values.qty,
      totalTax,
      netTotal: Math.max(0, values.total - totalTax)
    };
  }, [items, taxPercentage, taxFixed]);

  useEffect(() => {
    if (order) {
      form.reset({
        order_sn: order.order_sn,
        items: order.items?.map(item => ({
          product_name: item.product_name,
          sku: item.sku || '',
          quantity: item.quantity,
          unit_price: item.unit_price,
        })) || (order.product_name ? [{ 
          product_name: order.product_name, 
          sku: order.sku || '', 
          quantity: 1, 
          unit_price: order.order_total || 0 
        }] : [{ product_name: '', sku: '', quantity: 1, unit_price: 0 }]),
        customer_name: order.customer_name || '',
        shipping_address: order.shipping_address || '',
        status: order.status,
        carrier: order.carrier || '',
        tracking_code: order.tracking_code || '',
        purchase_date: order.purchase_date ? new Date(order.purchase_date).toISOString().split('T')[0] : '',
        estimated_delivery: order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '',
      });
    } else {
      form.reset({
        order_sn: '',
        items: [{ product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0 }],
        customer_name: '',
        shipping_address: '',
        status: 'AGUARDANDO_ENVIO',
        carrier: '',
        tracking_code: '',
        purchase_date: new Date().toISOString().split('T')[0],
        estimated_delivery: '',
      });
    }
  }, [order, form]);

  const onSubmit = async (data: FormData) => {
    const total = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    
    const orderData = {
      order_sn: data.order_sn,
      items: data.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      customer_name: data.customer_name || null,
      shipping_address: data.shipping_address || null,
      order_total: total,
      status: data.status as ShopeeShipmentStatus,
      carrier: data.carrier || null,
      tracking_code: data.tracking_code || null,
      purchase_date: new Date(data.purchase_date).toISOString(),
      estimated_delivery: data.estimated_delivery ? new Date(data.estimated_delivery).toISOString() : null,
    };

    if (isEditing && order) {
      // Include previous values for edit history
      const previousValues = {
        order_sn: order.order_sn,
        product_name: order.product_name,
        sku: order.sku,
        customer_name: order.customer_name,
        shipping_address: order.shipping_address,
        order_total: order.order_total,
        status: order.status,
        carrier: order.carrier,
        tracking_code: order.tracking_code,
        purchase_date: order.purchase_date,
        estimated_delivery: order.estimated_delivery,
      };
      await updateOrder.mutateAsync({ id: order.id, previousValues, ...orderData });
    } else {
      await createOrder.mutateAsync(orderData);
    }
    
    onOpenChange(false);
  };

  const isPending = createOrder.isPending || updateOrder.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Pedido' : 'Cadastrar Pedido Manual'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="order_sn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Pedido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2401150001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Pedido *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Itens do Pedido</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product_id: '', product_name: '', sku: '', quantity: 1, unit_price: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-4 p-4 border rounded-lg bg-muted/20 relative">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <FormField
                    control={form.control}
                    name={`items.${index}.product_name`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Produto {index + 1} *</FormLabel>
                        <Popover 
                          open={openCombobox === index} 
                          onOpenChange={(open) => setOpenCombobox(open ? index : null)}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value || "Selecione ou digite"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar produto..." />
                              <CommandList>
                                <CommandEmpty>
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-sm"
                                    onClick={() => {
                                      setOpenCombobox(null);
                                    }}
                                  >
                                    Usar texto digitado
                                  </Button>
                                </CommandEmpty>
                                <CommandGroup>
                                  {products?.map((product) => (
                                    <CommandItem
                                      value={product.name}
                                      key={product.id}
                                      onSelect={() => {
                                        form.setValue(`items.${index}.product_id`, product.id, { shouldValidate: true });
                                        form.setValue(`items.${index}.product_name`, product.name, { shouldValidate: true });
                                        if (product.sku) {
                                          form.setValue(`items.${index}.sku`, product.sku, { shouldValidate: true });
                                        }
                                        if (product.price) {
                                          form.setValue(`items.${index}.unit_price`, product.price, { shouldValidate: true });
                                        }
                                        setOpenCombobox(null);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          product.name === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {product.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="SKU" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd.</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Force re-render for total calculation if needed, 
                                // though useMemo/watch should handle it globally, 
                                // local state might need this for immediate feedback if watch isn't enough
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Unit.</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormItem>
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input 
                          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            (form.watch(`items.${index}.quantity`) || 0) * (form.watch(`items.${index}.unit_price`) || 0)
                          )}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTaxSettings(!showTaxSettings)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configurar Taxas
                </Button>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground mr-2">Subtotal:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)}
                  </span>
                </div>
              </div>

              {showTaxSettings && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-background rounded-md border text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Taxa da Plataforma (%)</label>
                    <div className="relative">
                      <Input
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={taxPercentage}
                        onChange={(e) => setTaxPercentage(Number(e.target.value))}
                        className="h-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Taxa Fixa (por item)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                      <Input
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={taxFixed}
                        onChange={(e) => setTaxFixed(Number(e.target.value))}
                        className="pl-8 h-8"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm" 
                      onClick={handleSaveTaxDefaults}
                      className="text-xs h-7"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Salvar como Padrão
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-2 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxas ({taxPercentage}% + {totalQuantity}x R$ {taxFixed.toFixed(2)}):</span>
                  <span className="text-destructive font-medium">
                    - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTax)}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-1">
                  <span className="font-semibold">Líquido a Receber:</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netTotal)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" title="Este é o valor total bruto do pedido considerado para o cadastro">
                      Bruto: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orderTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do comprador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipping_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço de Entrega</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />





            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('status') !== 'ENTREGUE' && form.watch('status') !== 'CANCELADO' && (
                <>
                  <FormField
                    control={form.control}
                    name="carrier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportadora</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Correios" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tracking_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Rastreio</FormLabel>
                        <FormControl>
                          <Input placeholder="Código" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {form.watch('status') !== 'ENTREGUE' && form.watch('status') !== 'CANCELADO' && form.watch('status') !== 'DEVOLVIDO' && (
              <FormField
                control={form.control}
                name="estimated_delivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previsão de Entrega</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Salvar Pedido'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
