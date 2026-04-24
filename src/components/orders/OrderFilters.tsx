import { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SHIPMENT_STATUS_CONFIG, type OrderShipmentStatus } from '@/types/orders';

export interface OrderFiltersState {
  search: string;
  status: OrderShipmentStatus | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  carrier: string | undefined;
}

interface OrderFiltersProps {
  filters: OrderFiltersState;
  onFiltersChange: (filters: OrderFiltersState) => void;
  carriers: string[];
}

export function OrderFilters({ filters, onFiltersChange, carriers }: OrderFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<OrderFiltersState>(filters);

  // Sync local filters when modal opens or parent filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const activeFiltersCount = [
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.carrier,
  ].filter(Boolean).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      ...localFilters,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      carrier: undefined,
    };
    setLocalFilters(clearedFilters);
  };

  const handleClearAllAndApply = () => {
    const cleared = {
      search: filters.search,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      carrier: undefined,
    };
    onFiltersChange(cleared);
    setOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Buscar por pedido, produto, SKU ou rastreio..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10 rounded-xl bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
            className="gap-2 rounded-xl"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Filtros Avançados</DialogTitle>
            <DialogDescription>
              Refine sua busca por pedidos e envios
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Status do Pedido</label>
              <Select
                value={localFilters.status || 'ALL'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    status: value && value !== 'ALL' ? (value as OrderShipmentStatus) : undefined,
                  })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  {Object.entries(SHIPMENT_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Carrier */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Transportadora</label>
              <Select
                value={localFilters.carrier || 'ALL'}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, carrier: value && value !== 'ALL' ? value : undefined })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Todas as transportadoras" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">Todas</SelectItem>
                  {carriers.map((carrier) => (
                    <SelectItem key={carrier} value={carrier}>
                      {carrier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Período - De</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
                    <Calendar className="mr-2 h-4 w-4" />
                    {localFilters.startDate && isValid(localFilters.startDate)
                      ? format(localFilters.startDate, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localFilters.startDate}
                    onSelect={(date) => setLocalFilters({ ...localFilters, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground ml-1">Período - Até</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
                    <Calendar className="mr-2 h-4 w-4" />
                    {localFilters.endDate && isValid(localFilters.endDate)
                      ? format(localFilters.endDate, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={localFilters.endDate}
                    onSelect={(date) => setLocalFilters({ ...localFilters, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 border-t pt-6">
             <Button
              variant="ghost"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground rounded-xl mr-auto"
            >
              Limpar Campos
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleApply} className="rounded-xl px-6">
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {activeFiltersCount > 0 && (
         <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClearAllAndApply} 
          title="Limpar todos os filtros"
          className="rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
         >
            <X className="h-4 w-4" />
         </Button>
      )}
    </div>
  );
}
