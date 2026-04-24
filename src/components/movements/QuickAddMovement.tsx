import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, Plus, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/hooks/useProducts";
import { Warehouse } from "@/hooks/useWarehouses";
import { MovementType } from "@/hooks/useMovements";
import { toast } from "sonner";

interface QuickAddMovementProps {
  products: Product[];
  warehouses: Warehouse[];
  onAdd: (data: any) => Promise<void>;
}

export function QuickAddMovement({ products, warehouses, onAdd }: QuickAddMovementProps) {
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [type, setType] = useState<MovementType>("IN");
  const [warehouseId, setWarehouseId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fastMode, setFastMode] = useState(false);

  const quantityRef = useRef<HTMLInputElement>(null);

  const activeWarehouses = warehouses.filter((w) => w.is_active);

  // Set default warehouse if only one exists
  useEffect(() => {
    if (activeWarehouses.length === 1 && !warehouseId) {
      setWarehouseId(activeWarehouses[0].id);
    }
  }, [activeWarehouses, warehouseId]);

  const handleAdd = async () => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return;
    }
    if (!warehouseId) {
      toast.error("Selecione um depósito");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    setIsLoading(true);
    try {
      await onAdd({
        product_id: selectedProductId,
        type,
        warehouse_from_id: type === "OUT" ? warehouseId : undefined,
        warehouse_to_id: type === "IN" ? warehouseId : undefined,
        quantity,
        reason: "Lançamento rápido",
      });
      
      toast.success("Movimentação registrada!");
      
      // Reset fields but keep type and warehouse for next entry
      setSelectedProductId("");
      if (!fastMode) {
        setQuantity(1);
      }
    } catch (error) {
      toast.error("Erro ao registrar");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Lançamento Rápido
        </h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer hover:text-primary transition-colors">
            <input 
              type="checkbox" 
              checked={fastMode} 
              onChange={(e) => setFastMode(e.target.checked)}
              className="rounded border-primary/30 text-primary focus:ring-primary h-3.5 w-3.5"
            />
            Modo Contínuo
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* TYPE */}
        <div className="w-[110px]">
          <Select value={type} onValueChange={(val: MovementType) => setType(val)}>
            <SelectTrigger className="h-10 rounded-lg border-primary/20 focus:ring-primary font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN" className="text-success font-medium">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="h-3 w-3" />
                  Entrada
                </div>
              </SelectItem>
              <SelectItem value="OUT" className="text-destructive font-medium">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-3 w-3" />
                  Saída
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* PRODUCT */}
        <div className="flex-1 min-w-[250px]">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between h-10 rounded-lg border-primary/20 font-normal hover:bg-background transition-all",
                  !selectedProductId && "text-muted-foreground"
                )}
              >
                {selectedProductId
                  ? `${selectedProduct?.sku} - ${selectedProduct?.name}`
                  : "Buscar produto por nome ou SKU..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Digite o SKU ou nome..." />
                <CommandEmpty>Produto não encontrado.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-y-auto">
                  {products.map((product) => (
                    <CommandItem
                      key={product.id}
                      value={`${product.sku} ${product.name}`}
                      onSelect={() => {
                        setSelectedProductId(product.id);
                        setOpen(false);
                        // Focus quantity if not in fast mode
                        if (!fastMode) {
                          setTimeout(() => quantityRef.current?.focus(), 100);
                        } else {
                            // In fast mode, maybe add immediately?
                            // For safety, let the user hit Enter, but focus quantity anyway.
                            setTimeout(() => quantityRef.current?.focus(), 100);
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedProductId === product.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="font-mono text-xs text-muted-foreground mr-2">{product.sku}</span>
                      {product.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* WAREHOUSE */}
        <div className="w-[180px]">
          <Select value={warehouseId} onValueChange={setWarehouseId}>
            <SelectTrigger className="h-10 rounded-lg border-primary/20 focus:ring-primary">
              <SelectValue placeholder="Depósito" />
            </SelectTrigger>
            <SelectContent>
              {activeWarehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* QUANTITY */}
        <div className="w-[100px]">
          <Input
            ref={quantityRef}
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Qtd"
            className="h-10 rounded-lg border-primary/20 focus:ring-primary font-bold text-center"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAdd();
              }
            }}
          />
        </div>

        {/* SUBMIT */}
        <Button 
          onClick={handleAdd} 
          disabled={isLoading || !selectedProductId}
          className="h-10 px-6 rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Registrar
              <Plus className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {selectedProduct && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground bg-background/50 p-2 rounded-lg border border-primary/5">
            <div className="flex items-center gap-1">
                <span className="font-bold">Saldo atual:</span>
                <span className="text-primary">{selectedProduct.stock} {selectedProduct.unit}</span>
            </div>
            {selectedProduct.price && (
                <div className="flex items-center gap-1">
                    <span className="font-bold">Preço:</span>
                    <span className="text-primary">R$ {Number(selectedProduct.price).toFixed(2)}</span>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
