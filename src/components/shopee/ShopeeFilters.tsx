import { useState } from 'react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
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
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.carrier,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      carrier: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
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
        <Button
          variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
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
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg border bg-card">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value ? (value as ShopeeShipmentStatus) : undefined,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {Object.entries(SHIPMENT_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Carrier */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Transportadora</label>
            <Select
              value={filters.carrier || ''}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, carrier: value || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Data início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.startDate
                    ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => onFiltersChange({ ...filters, startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Data fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.endDate
                    ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => onFiltersChange({ ...filters, endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
