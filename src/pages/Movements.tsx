/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Plus,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useMovements,
  useCreateMovement,
  useUpdateMovement,
  useDeleteMovement,
  MovementType,
  StockMovement,
} from "@/hooks/useMovements";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts } from "@/hooks/useProducts";
import { useWarehouses } from "@/hooks/useWarehouses";
import { MovementForm } from "@/components/movements/MovementForm";
import { QuickAddMovement } from "@/components/movements/QuickAddMovement";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeConfig = {
  IN: {
    label: "Entrada",
    icon: ArrowDownLeft,
    color: "text-success bg-success/10",
  },
  OUT: {
    label: "Saída",
    icon: ArrowUpRight,
    color: "text-destructive bg-destructive/10",
  },
  TRANSFER: {
    label: "Transferência",
    icon: ArrowRightLeft,
    color: "text-info bg-info/10",
  },
  ADJUST: {
    label: "Ajuste",
    icon: ArrowRightLeft,
    color: "text-warning bg-warning/10",
  },
};

type FilterTab = "ALL" | "IN" | "OUT" | "TRANSFER";

export default function Movements() {
  const { data: movements, isLoading } = useMovements();
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const createMovement = useCreateMovement();
  const updateMovement = useUpdateMovement();
  const deleteMovement = useDeleteMovement();

  const [formOpen, setFormOpen] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>("IN");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<StockMovement | null>(
    null
  );

  const openForm = (type: MovementType) => {
    setMovementType(type);
    setEditingMovement(null);
    setFormOpen(true);
  };

  const handleEdit = (movement: StockMovement) => {
    setEditingMovement(movement);
    setMovementType(movement.type);
    setFormOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingMovement) {
      await updateMovement.mutateAsync({ ...data, id: editingMovement.id });
    } else {
      await createMovement.mutateAsync(data);
    }
    setFormOpen(false);
    setEditingMovement(null);
  };

  const handleDelete = async () => {
    if (movementToDelete) {
      await deleteMovement.mutateAsync(movementToDelete.id);
      setMovementToDelete(null);
    }
  };

  // Stats
  const stats = useMemo(() => {
    if (!movements) return { entries: 0, exits: 0, transfers: 0, total: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMovements = movements.filter(
      (m) => new Date(m.created_at) >= today
    );
    return {
      entries: todayMovements.filter((m) => m.type === "IN").reduce((s, m) => s + m.quantity, 0),
      exits: todayMovements.filter((m) => m.type === "OUT").reduce((s, m) => s + m.quantity, 0),
      transfers: todayMovements.filter((m) => m.type === "TRANSFER").length,
      total: movements.length,
    };
  }, [movements]);

  // Filtered movements
  const filteredMovements = useMemo(() => {
    let result = movements || [];
    
    // Tab filter
    if (activeTab !== "ALL") {
      result = result.filter((m) => m.type === activeTab);
    }

    // Search filter
    if (search) {
      result = result.filter(
        (m) =>
          m.product?.name.toLowerCase().includes(search.toLowerCase()) ||
          m.product?.sku.toLowerCase().includes(search.toLowerCase()) ||
          m.reference?.toLowerCase().includes(search.toLowerCase()) ||
          m.platform?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return result;
  }, [movements, activeTab, search]);

  const tabs: { key: FilterTab; label: string; count: number; icon: any; color: string }[] = [
    { key: "ALL", label: "Todas", count: movements?.length || 0, icon: Package, color: "text-primary" },
    { key: "IN", label: "Entradas", count: movements?.filter((m) => m.type === "IN").length || 0, icon: ArrowDownLeft, color: "text-success" },
    { key: "OUT", label: "Saídas", count: movements?.filter((m) => m.type === "OUT").length || 0, icon: ArrowUpRight, color: "text-destructive" },
    { key: "TRANSFER", label: "Transferências", count: movements?.filter((m) => m.type === "TRANSFER").length || 0, icon: ArrowRightLeft, color: "text-info" },
  ];

  if (isLoading) {
    return (
      <AppLayout
        title="Movimentações"
        subtitle="Registre entradas, saídas e transferências"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Entrada e Saída"
      subtitle="Registre o que entra e sai do estoque"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="relative overflow-hidden rounded-xl border border-success/20 bg-gradient-to-br from-success/5 to-success/10 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-success/10 hover:scale-[1.02] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-success/70">Entradas Hoje</p>
              <p className="text-3xl font-black text-success mt-1">{stats.entries}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-success/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-success/5 blur-2xl" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-destructive/10 hover:scale-[1.02] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-destructive/70">Saídas Hoje</p>
              <p className="text-3xl font-black text-destructive mt-1">{stats.exits}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-destructive/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-destructive/5 blur-2xl" />
        </div>

        <div className="relative overflow-hidden rounded-xl border border-info/20 bg-gradient-to-br from-info/5 to-info/10 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-info/10 hover:scale-[1.02] group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-info/70">Total de Movimentações</p>
              <p className="text-3xl font-black text-info mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-info/15 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="h-6 w-6 text-info" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-info/5 blur-2xl" />
        </div>
      </div>

      {/* Quick Add Section */}
      <QuickAddMovement 
        products={products || []} 
        warehouses={warehouses || []}
        onAdd={async (data) => {
          await createMovement.mutateAsync(data);
        }}
      />

      {/* Action Buttons + Search */}
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-success/30 text-success hover:bg-success/10 hover:text-success hover:border-success/50 transition-all"
              onClick={() => openForm("IN")}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Nova Entrada
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all"
              onClick={() => openForm("OUT")}
            >
              <ArrowUpRight className="h-4 w-4" />
              Nova Saída
            </Button>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => openForm("TRANSFER")}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transferência
            </Button>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto, referência ou plataforma..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }
                `}
              >
                <TabIcon className={`h-4 w-4 ${isActive ? tab.color : ""}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`
                  text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[20px] text-center
                  ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredMovements?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <ArrowRightLeft className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="mt-2 font-semibold text-foreground text-lg">
            Nenhuma movimentação encontrada
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "Tente outro termo de busca." : "Registre sua primeira movimentação acima."}
          </p>
          {!search && (
            <Button
              className="mt-4 gap-2"
              onClick={() => openForm("IN")}
            >
              <Plus className="h-4 w-4" />
              Criar Movimentação
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
            <Table className="table-fixed">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-center w-[120px]">Tipo</TableHead>
                  <TableHead className="text-center">Produto</TableHead>
                  <TableHead className="text-center">Origem</TableHead>
                  <TableHead className="text-center">Destino</TableHead>
                  <TableHead className="text-center w-[90px]">Qtd</TableHead>
                  <TableHead className="text-center">Plataforma</TableHead>
                  <TableHead className="text-center">Referência</TableHead>
                  <TableHead className="text-center w-[120px]">Data</TableHead>
                  <TableHead className="text-center w-[60px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements?.map((movement, index) => {
                  const config = typeConfig[movement.type];
                  const Icon = config.icon;
                  return (
                    <TableRow 
                      key={movement.id} 
                      className="group transition-all duration-200 hover:bg-muted/30 animate-in fade-in slide-in-from-bottom-1"
                      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                    >
                      <TableCell className="text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.color}`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-center">
                          <span className="font-semibold text-foreground leading-tight">
                            {movement.product?.name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            {movement.product?.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground/80 font-medium text-center">
                        {movement.warehouse_from?.name || <span className="text-muted-foreground/30">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground/80 font-medium text-center">
                        {movement.warehouse_to?.name || <span className="text-muted-foreground/30">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-primary text-base">
                          {movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {movement.platform ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                            {movement.platform}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {movement.reference ? (
                          <code className="rounded bg-muted/50 px-2 py-0.5 text-xs font-mono text-muted-foreground border border-border/50">
                            {movement.reference}
                          </code>
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {format(
                          new Date(movement.created_at),
                          "dd/MM/yy HH:mm",
                          { locale: ptBR }
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border shadow-xl rounded-xl p-1.5 min-w-[140px]">
                            <DropdownMenuItem onClick={() => handleEdit(movement)} className="rounded-lg gap-2 cursor-pointer">
                              <Pencil className="h-4 w-4" />
                              <span className="font-medium text-sm">Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => setMovementToDelete(movement)}
                              className="text-destructive focus:text-destructive rounded-lg gap-2 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="font-medium text-sm">Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredMovements?.map((movement, index) => {
              const config = typeConfig[movement.type];
              const Icon = config.icon;
              return (
                <div
                  key={movement.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3 transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${config.color}`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </div>
                      {movement.platform && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                          {movement.platform}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(movement.created_at), "dd/MM/yy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{movement.product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {movement.product?.sku}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      {movement.warehouse_from && (
                        <p className="text-muted-foreground">
                          De:{" "}
                          <span className="text-foreground font-medium">
                            {movement.warehouse_from.name}
                          </span>
                        </p>
                      )}
                      {movement.warehouse_to && (
                        <p className="text-muted-foreground">
                          Para:{" "}
                          <span className="text-foreground font-medium">
                            {movement.warehouse_to.name}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="text-2xl font-black text-primary">{movement.quantity}</p>
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(movement)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setMovementToDelete(movement)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}


      <MovementForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMovement(null);
        }}
        type={movementType}
        products={products || []}
        warehouses={warehouses || []}
        onSubmit={handleSubmit}
        isLoading={createMovement.isPending || updateMovement.isPending}
        initialData={editingMovement}
        onTypeChange={setMovementType}
      />

      <AlertDialog
        open={!!movementToDelete}
        onOpenChange={(open) => !open && setMovementToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta movimentação? Esta ação não pode
              ser desfeita e o estoque será revertido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
