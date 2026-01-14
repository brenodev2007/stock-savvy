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
import { SHIPMENT_STATUS_CONFIG, type ShopeeShipmentStatus } from '@/types/shopee';

export interface ShopeeFiltersState {
  search: string;
  status: ShopeeShipmentStatus | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  carrier: string | undefined;
}

interface ShopeeFiltersProps {
  filters: ShopeeFiltersState;
  onFiltersChange: (filters: ShopeeFiltersState) => void;
  carriers: string[];
}

export function ShopeeFilters({ filters, onFiltersChange, carriers }: ShopeeFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ShopeeFiltersState>(filters);

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
    // Optional: Apply immediately on clear, or wait for user to click Apply?
    // Usually "Clear" in a modal just clears the form, "Apply" commits it.
    // Let's keep it in the form state.
  };

  const handleClearAllAndApply = () => {
    const cleared = {
      search: filters.search, // Keep search, it's outside
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
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por pedido, produto, SKU ou rastreio..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filtros Avançados</DialogTitle>
            <DialogDescription>
              Refine sua busca pelos envios da Shopee
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={localFilters.status || 'ALL'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    status: value && value !== 'ALL' ? (value as ShopeeShipmentStatus) : undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm font-medium">Transportadora</label>
              <Select
                value={localFilters.carrier || 'ALL'}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, carrier: value && value !== 'ALL' ? value : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
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
              <label className="text-sm font-medium">Data início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {localFilters.startDate && isValid(localFilters.startDate)
                      ? format(localFilters.startDate, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <label className="text-sm font-medium">Data fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {localFilters.endDate && isValid(localFilters.endDate)
                      ? format(localFilters.endDate, 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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

          <DialogFooter className="flex justify-between sm:justify-between w-full">
             <Button
              variant="ghost"
              onClick={handleClear}
              className="text-muted-foreground mr-auto"
            >
              Limpar Campos
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
               <Button onClick={handleApply}>
                Aplicar Filtros
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {activeFiltersCount > 0 && (
         <Button variant="ghost" size="icon" onClick={handleClearAllAndApply} title="Limpar todos os filtros">
            <X className="h-4 w-4" />
         </Button>
      )}
    </div>
  );
}
