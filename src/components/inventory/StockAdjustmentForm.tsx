import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const adjustmentSchema = z.object({
  newQuantity: z.coerce.number().min(0, 'Quantidade não pode ser negativa'),
  reason: z.string().min(1, 'Informe o motivo do ajuste'),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stockBalance: {
    product_id: string;
    warehouse_id: string;
    quantity: number;
    product?: { name: string; sku: string; unit: string };
    warehouse?: { name: string };
  } | null;
  onSubmit: (data: { newQuantity: number; reason: string }) => Promise<void>;
  isLoading: boolean;
}

export function StockAdjustmentForm({
  open,
  onOpenChange,
  stockBalance,
  onSubmit,
  isLoading,
}: StockAdjustmentFormProps) {
  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      newQuantity: stockBalance?.quantity ?? 0,
      reason: '',
    },
  });

  const handleSubmit = async (data: AdjustmentFormData) => {
    await onSubmit({
      newQuantity: data.newQuantity,
      reason: data.reason,
    });
    form.reset();
  };

  // Reset form when stockBalance changes
  const currentQty = stockBalance?.quantity ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Estoque</DialogTitle>
        </DialogHeader>

        {stockBalance && (
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="font-medium text-foreground">
              {stockBalance.product?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              SKU: {stockBalance.product?.sku} • Depósito: {stockBalance.warehouse?.name}
            </p>
            <p className="mt-2 text-sm">
              Estoque atual: <span className="font-semibold">{currentQty} {stockBalance.product?.unit}</span>
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      {...field}
                    />
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
                  <FormLabel>Motivo do Ajuste</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Contagem física, perda, avaria..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar Ajuste
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
