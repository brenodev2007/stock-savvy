import { useState } from 'react';
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
  DialogTrigger,
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
import { Plus } from 'lucide-react';
import { useCreateManualOrder } from '@/hooks/useShopee';
import type { ShopeeShipmentStatus } from '@/types/shopee';

const formSchema = z.object({
  order_sn: z.string().min(1, 'Número do pedido é obrigatório'),
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
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

export function ShopeeManualOrderForm() {
  const [open, setOpen] = useState(false);
  const createOrder = useCreateManualOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      order_sn: '',
      product_name: '',
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

  const onSubmit = async (data: FormData) => {
    await createOrder.mutateAsync({
      order_sn: data.order_sn,
      product_name: data.product_name,
      customer_name: data.customer_name,
      shipping_address: data.shipping_address,
      order_total: data.order_total,
      status: data.status as ShopeeShipmentStatus,
      carrier: data.carrier,
      tracking_code: data.tracking_code,
      purchase_date: new Date(data.purchase_date).toISOString(),
      estimated_delivery: data.estimated_delivery ? new Date(data.estimated_delivery).toISOString() : null,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Pedido Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Pedido Manual</DialogTitle>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Salvando...' : 'Salvar Pedido'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
