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
import { Loader2, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, CalendarIcon, Store, Tag, Plus } from 'lucide-react';
import { Product } from '@/hooks/useProducts';
import { Warehouse, useCreateWarehouse } from '@/hooks/useWarehouses';
import { MovementType, StockMovement } from '@/hooks/useMovements';
import { useCreateTransaction } from '@/hooks/useFinance';
import { useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const createMovementSchema = (type: MovementType) => z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  warehouse_from_id: (type === 'OUT' || type === 'TRANSFER') 
    ? z.string().min(1, 'Selecione o depósito de origem')
    : z.string().optional(),
  warehouse_to_id: (type === 'IN' || type === 'TRANSFER' || type === 'ADJUST')
    ? z.string().min(1, 'Selecione o depósito de destino')
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
  onSubmit: (data: MovementFormData & { type: MovementType; platform?: string } & { id?: string }) => Promise<void>;
  isLoading?: boolean;
  initialData?: StockMovement | null;
}

const movementConfig = {
  IN: {
    title: 'Nova Entrada',
    description: 'Registre a entrada de produtos no estoque',
    icon: ArrowDownLeft,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  OUT: {
    title: 'Nova Saída',
    description: 'Registre a saída de produtos do estoque',
    icon: ArrowUpRight,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  TRANSFER: {
    title: 'Transferência',
    description: 'Transfira produtos entre depósitos',
    icon: ArrowRightLeft,
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  ADJUST: {
    title: 'Ajuste de Inventário',
    description: 'Ajuste a quantidade de estoque',
    icon: ArrowRightLeft,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
};

const PREDEFINED_PLATFORMS = [
  { value: 'shopee', label: 'Shopee', feeCalc: (price: number) => (price * 0.20) + 4 },
  { value: 'mercadolivre', label: 'Mercado Livre', feeCalc: (price: number) => price * 0.17 },
  { value: 'local', label: 'Venda Local / Outro', feeCalc: () => 0 },
];

export function MovementForm({
  open,
  onOpenChange,
  type,
  products,
  warehouses,
  onSubmit,
  isLoading,
  initialData,
  onTypeChange,
}: MovementFormProps & { onTypeChange?: (type: MovementType) => void }) {
  const config = movementConfig[type];
  const Icon = config.icon;
  const { mutateAsync: createTransaction } = useCreateTransaction();
  const createWarehouse = useCreateWarehouse();

  const [platformMode, setPlatformMode] = useState<'select' | 'custom'>('select');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [includeInFinance, setIncludeInFinance] = useState(true);
  
  // Inline warehouse creation state
  const [creatingWarehouseFor, setCreatingWarehouseFor] = useState<'from' | 'to' | null>(null);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [creatingWarehouseLoading, setCreatingWarehouseLoading] = useState(false);

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

  const selectedProductId = form.watch('product_id');

  const effectivePlatform = platformMode === 'custom' ? customPlatform : platform;

  const handleCreateWarehouse = useCallback(async (target: 'from' | 'to') => {
    if (!newWarehouseName.trim()) {
      toast.error('Digite o nome do local');
      return;
    }
    setCreatingWarehouseLoading(true);
    try {
      const result = await createWarehouse.mutateAsync({ name: newWarehouseName.trim(), is_active: true });
      if (target === 'from') {
        form.setValue('warehouse_from_id', result.id);
      } else {
        form.setValue('warehouse_to_id', result.id);
      }
      setNewWarehouseName('');
      setCreatingWarehouseFor(null);
    } catch (err) {
      // Error toast is handled by the hook
    } finally {
      setCreatingWarehouseLoading(false);
    }
  }, [newWarehouseName, createWarehouse, form]);

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
        // Check if initial platform matches a predefined one
        if (initialData.platform) {
          const isPredefined = PREDEFINED_PLATFORMS.some(p => p.value === initialData.platform);
          if (isPredefined) {
            setPlatformMode('select');
            setPlatform(initialData.platform);
            setCustomPlatform('');
          } else {
            setPlatformMode('custom');
            setCustomPlatform(initialData.platform);
            setPlatform('');
          }
        } else {
          setPlatformMode('select');
          setPlatform('');
          setCustomPlatform('');
        }
        setSalePrice(0);
        setProfit(0);
        setFees(0);
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
        setPlatformMode('select');
        setPlatform('');
        setCustomPlatform('');
        setSalePrice(0);
        setProfit(0);
        setFees(0);
      }
    }
  }, [open, type, initialData, form]);

  // Update cost when product changes
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        setCost(Number(product.cost) || 0);
        if (salePrice > 0) calculateFromPrice(salePrice);
      }
    }
  }, [selectedProductId, products]);

  // Re-create resolver when type changes
  useEffect(() => {
    form.clearErrors();
  }, [type, form]);

  const getPlatformFeeCalc = () => {
    if (platformMode === 'custom') return () => 0;
    const found = PREDEFINED_PLATFORMS.find(p => p.value === platform);
    return found?.feeCalc || (() => 0);
  };

  const calculateFromPrice = (price: number) => {
    setSalePrice(price);
    const feeCalc = getPlatformFeeCalc();
    const calculatedFees = feeCalc(price);
    setFees(calculatedFees);
    setProfit(price - cost - calculatedFees);
  };

  const calculateFromProfit = (targetProfit: number) => {
    setProfit(targetProfit);
    if (platform === 'shopee') {
      const price = (targetProfit + cost + 4) / 0.8;
      setSalePrice(price);
      setFees((price * 0.20) + 4);
    } else if (platform === 'mercadolivre') {
      const price = (targetProfit + cost) / 0.83;
      setSalePrice(price);
      setFees(price * 0.17);
    } else {
      const price = targetProfit + cost;
      setSalePrice(price);
      setFees(0);
    }
  };

  // Recalculate when platform changes
  useEffect(() => {
    if (salePrice > 0) {
      calculateFromPrice(salePrice);
    }
  }, [platform, platformMode]);

  const handleFinalSubmit = async (data: MovementFormData) => {
    const submitData = {
      ...data,
      type,
      warehouse_from_id: data.warehouse_from_id || undefined,
      warehouse_to_id: data.warehouse_to_id || undefined,
      reason: data.reason || undefined,
      reference: data.reference || undefined,
      created_at: data.created_at || new Date(),
      platform: type === 'OUT' && effectivePlatform ? effectivePlatform : undefined,
      id: initialData?.id
    };
    
    await onSubmit(submitData);

    if (type === 'OUT' && includeInFinance && salePrice > 0) {
        const product = products.find(p => p.id === data.product_id);
        const qty = data.quantity;
        const platName = effectivePlatform || 'Venda';
        const description = `Venda ${platName} - ${product?.name} (x${qty})`;
        const date = data.created_at || new Date();

        // Total Revenue
        await createTransaction({
            type: 'income',
            amount: salePrice * qty, 
            description: description,
            category: 'Vendas',
            transaction_date: date,
        });

        // Total Fees
        if (fees > 0) {
            await createTransaction({
                type: 'expense',
                amount: fees * qty,
                description: `Taxas ${platName} - ${product?.name} (x${qty})`,
                category: 'Taxas',
                transaction_date: date,
            });
        }

        // Total Cost
        if (cost > 0) {
             await createTransaction({
                type: 'cost',
                amount: cost * qty,
                description: `Custo do Produto - ${product?.name} (x${qty})`,
                category: 'Custo de Mercadoria',
                transaction_date: date,
            });
        }
        
        toast.success('Lançamentos financeiros gerados!');
    }
  };

  const activeWarehouses = warehouses.filter((w) => w.is_active);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor} ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{initialData ? 'Editar Movimentação' : config.title}</DialogTitle>
              <DialogDescription>{initialData ? 'Edite os dados da movimentação' : config.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFinalSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormItem>
                <FormLabel>Tipo de Movimentação</FormLabel>
                <Select
                  value={type}
                  onValueChange={(value) => onTypeChange?.(value as MovementType)}
                  disabled={!onTypeChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(movementConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`h-4 w-4 ${config.color.split(' ')[0]}`} />
                          <span>{config.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            </div>

            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produto</FormLabel>
                  <Select onValueChange={(val) => {
                      field.onChange(val);
                  }} value={field.value}>
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

            {/* PLATFORM SECTION - ONLY FOR OUT */}
            {type === 'OUT' && (
                <div className="rounded-xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-4 space-y-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-primary flex items-center gap-2 text-sm">
                        <Store className="h-4 w-4" />
                        Dados da Venda
                    </h3>
                    
                    {/* Platform Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => { setPlatformMode('select'); setCustomPlatform(''); }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            platformMode === 'select'
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          <Store className="h-3 w-3 inline mr-1" />
                          Plataformas
                        </button>
                        <button
                          type="button"
                          onClick={() => { setPlatformMode('custom'); setPlatform(''); }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                            platformMode === 'custom'
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          <Tag className="h-3 w-3 inline mr-1" />
                          Cadastrar Nova
                        </button>
                      </div>

                      {platformMode === 'select' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <FormItem>
                            <FormLabel>Plataforma</FormLabel>
                            <Select 
                              value={platform} 
                              onValueChange={(val) => setPlatform(val)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                {PREDEFINED_PLATFORMS.map((p) => (
                                  <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>

                          <FormItem>
                            <FormLabel>Enviar para Financeiro</FormLabel>
                            <div className="flex items-center h-10">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={includeInFinance} 
                                  onChange={(e) => setIncludeInFinance(e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Gerar lançamentos
                              </label>
                            </div>
                          </FormItem>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <FormItem>
                            <FormLabel>Nome da Plataforma</FormLabel>
                            <Input
                              placeholder="Ex: Amazon, OLX, Instagram..."
                              value={customPlatform}
                              onChange={(e) => setCustomPlatform(e.target.value)}
                              className="border-primary/20 focus-visible:ring-primary"
                            />
                          </FormItem>

                          <FormItem>
                            <FormLabel>Enviar para Financeiro</FormLabel>
                            <div className="flex items-center h-10">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={includeInFinance} 
                                  onChange={(e) => setIncludeInFinance(e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Gerar lançamentos
                              </label>
                            </div>
                          </FormItem>
                        </div>
                      )}
                    </div>

                    {/* Price Calculator - shows when platform is set */}
                    {effectivePlatform && (
                        <div className="space-y-4 pt-3 border-t border-dashed border-primary/20 animate-in fade-in slide-in-from-top-1 duration-200">
                             <div className="grid grid-cols-3 gap-3">
                                <FormItem>
                                    <FormLabel className="text-xs">Custo Unit.</FormLabel>
                                    <div className="h-10 px-3 py-2 bg-muted rounded-lg text-sm flex items-center font-mono">
                                        R$ {cost.toFixed(2)}
                                    </div>
                                </FormItem>

                                 <FormItem>
                                    <FormLabel className="text-xs">Margem de Lucro</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                value={profit || ''}
                                                onChange={(e) => calculateFromProfit(Number(e.target.value))}
                                                className="pl-8 text-green-600 font-semibold rounded-lg"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                    <FormLabel className="text-xs">Preço de Venda</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                            <Input 
                                                type="number" 
                                                step="0.01"
                                                value={salePrice || ''}
                                                onChange={(e) => calculateFromPrice(Number(e.target.value))}
                                                className="pl-8 font-bold rounded-lg"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                             </div>

                            {fees > 0 && (
                                <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-2.5 flex justify-between items-center animate-in fade-in duration-200">
                                    <span className="text-xs font-medium">Taxas da Plataforma:</span>
                                    <span className="font-bold">- R$ {fees.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="bg-muted p-2.5 rounded-lg flex justify-between items-center text-sm">
                                <span className="text-xs font-medium">Total a Receber (Financeiro):</span>
                                <span className="font-black text-lg text-primary">
                                    R$ {((salePrice - fees) * (form.watch('quantity') || 1)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {(type === 'IN' || type === 'OUT' || type === 'TRANSFER') && (
              <FormField
                control={form.control}
                name="warehouse_from_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === 'IN' ? 'Origem (opcional)' : 'De onde vai sair?'}
                    </FormLabel>
                    {creatingWarehouseFor === 'from' ? (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input
                          placeholder="Nome do novo local..."
                          value={newWarehouseName}
                          onChange={(e) => setNewWarehouseName(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleCreateWarehouse('from'); }
                            if (e.key === 'Escape') { setCreatingWarehouseFor(null); setNewWarehouseName(''); }
                          }}
                        />
                        <Button type="button" size="sm" disabled={creatingWarehouseLoading} onClick={() => handleCreateWarehouse('from')}>
                          {creatingWarehouseLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => { setCreatingWarehouseFor(null); setNewWarehouseName(''); }}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione o local" />
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
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="shrink-0 h-10 w-10 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => setCreatingWarehouseFor('from')}
                          title="Cadastrar novo local"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(type === 'IN' || type === 'OUT' || type === 'TRANSFER' || type === 'ADJUST') && (
              <FormField
                control={form.control}
                name="warehouse_to_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {type === 'TRANSFER' ? 'Para onde vai?' : type === 'OUT' ? 'Destino (opcional)' : 'Em qual local?'}
                    </FormLabel>
                    {creatingWarehouseFor === 'to' ? (
                      <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Input
                          placeholder="Nome do novo local..."
                          value={newWarehouseName}
                          onChange={(e) => setNewWarehouseName(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleCreateWarehouse('to'); }
                            if (e.key === 'Escape') { setCreatingWarehouseFor(null); setNewWarehouseName(''); }
                          }}
                        />
                        <Button type="button" size="sm" disabled={creatingWarehouseLoading} onClick={() => handleCreateWarehouse('to')}>
                          {creatingWarehouseLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => { setCreatingWarehouseFor(null); setNewWarehouseName(''); }}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione o local" />
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
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="shrink-0 h-10 w-10 border-dashed border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => setCreatingWarehouseFor('to')}
                          title="Cadastrar novo local"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
