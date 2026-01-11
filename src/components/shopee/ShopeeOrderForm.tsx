import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { useCreateManualOrder, useUpdateShopeeOrder } from '@/hooks/useShopee';
import type { ShopeeOrder, ShopeeShipmentStatus } from '@/types/shopee';

const formSchema = z.object({
  order_sn: z.string().min(1, 'Número do pedido é obrigatório'),
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
  sku: z.string().optional(),
  customer_name: z.string().optional(),
  shipping_address: z.string().optional(),
  order_total: z.coerce.number().min(0, 'Valor deve ser positivo'),
  status: z.enum(['AGUARDANDO_ENVIO', 'ENVIADO', 'EM_TRANSPORTE', 'ENTREGUE', 'CANCELADO', 'DEVOLVIDO']),
  carrier: z.string().optional(),
  tracking_code: z.string().optional(),
  purchase_date: z.string().min(1, 'Data do pedido é obrigatória'),
  estimated_delivery: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const statusOptions = [
  { value: 'AGUARDANDO_ENVIO', label: 'Aguardando Envio' },
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
  const createOrder = useCreateManualOrder();
  const updateOrder = useUpdateShopeeOrder();
  const isEditing = !!order;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_sn: '',
      product_name: '',
      sku: '',
      customer_name: '',
      shipping_address: '',
      order_total: 0,
      status: 'AGUARDANDO_ENVIO',
      carrier: '',
      tracking_code: '',
      purchase_date: new Date().toISOString().split('T')[0],
      estimated_delivery: '',
    },
  });

  useEffect(() => {
    if (order) {
      form.reset({
        order_sn: order.order_sn,
        product_name: order.product_name,
        sku: order.sku || '',
        customer_name: order.customer_name || '',
        shipping_address: order.shipping_address || '',
        order_total: order.order_total || 0,
        status: order.status,
        carrier: order.carrier || '',
        tracking_code: order.tracking_code || '',
        purchase_date: order.purchase_date ? new Date(order.purchase_date).toISOString().split('T')[0] : '',
        estimated_delivery: order.estimated_delivery ? new Date(order.estimated_delivery).toISOString().split('T')[0] : '',
      });
    } else {
      form.reset({
        order_sn: '',
        product_name: '',
        sku: '',
        customer_name: '',
        shipping_address: '',
        order_total: 0,
        status: 'AGUARDANDO_ENVIO',
        carrier: '',
        tracking_code: '',
        purchase_date: new Date().toISOString().split('T')[0],
        estimated_delivery: '',
      });
    }
  }, [order, form]);

  const onSubmit = async (data: FormData) => {
    const orderData = {
      order_sn: data.order_sn,
      product_name: data.product_name,
      sku: data.sku || null,
      customer_name: data.customer_name || null,
      shipping_address: data.shipping_address || null,
      order_total: data.order_total,
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto *</FormLabel>
                    <FormControl>
                      <Input placeholder="Descrição do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="Código SKU" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="order_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

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
