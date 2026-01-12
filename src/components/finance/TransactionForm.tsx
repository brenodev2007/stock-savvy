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
import { useCreateFinancialTransaction } from '@/hooks/useFinancialTransactions';

const formSchema = z.object({
  type: z.enum(['income', 'expense', 'cost']),
  category: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.coerce.number().positive('Valor deve ser positivo'),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'Data é obrigatória'),
});

type FormData = z.infer<typeof formSchema>;

const categoryOptions = {
  income: [
    'Venda Avulsa',
    'Venda Shopee',
    'Venda Mercado Livre',
    'Serviço',
    'Outros Recebimentos',
  ],
  expense: [
    'Marketing',
    'Embalagens',
    'Frete',
    'Comissões',
    'Impostos',
    'Aluguel',
    'Energia',
    'Internet',
    'Software/Ferramentas',
    'Outros Gastos',
  ],
  cost: [
    'CMV - Custo Mercadoria',
    'Compra de Estoque',
    'Fornecedor',
    'Matéria Prima',
  ],
};

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionForm({ open, onOpenChange }: TransactionFormProps) {
  const createTransaction = useCreateFinancialTransaction();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      amount: 0,
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = form.watch('type');

  const onSubmit = async (data: FormData) => {
    await createTransaction.mutateAsync({
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      transaction_date: new Date(data.transaction_date).toISOString(),
    });
    
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Nova Transação</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Tipo *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue('category', '');
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">
                          <span className="text-green-600">Receita</span>
                        </SelectItem>
                        <SelectItem value="expense">
                          <span className="text-red-500">Despesa</span>
                        </SelectItem>
                        <SelectItem value="cost">
                          <span className="text-orange-500">Custo</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">Valor (R$) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} className="text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions[selectedType]?.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Data *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm">Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes da transação..." {...field} className="text-sm min-h-[60px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2 sm:pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button type="submit" disabled={createTransaction.isPending} className="flex-1 sm:flex-none">
                {createTransaction.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
